/**
 * @file main.cpp
 * @brief Breath sensor application - reads potentiometer via MCP3008 and POSTs to REST API
 * 
 * This application runs headless on QNX Neutrino, reading analog values from
 * an MCP3008 ADC and sending them to a Railway-hosted REST API.
 * 
 * Environment variables:
 *   RAILWAY_API_URL - Base URL of the REST API (required)
 *   SPI_DEVICE      - Path to SPI device (optional, default: /dev/spi0)
 *   POLL_INTERVAL_MS - Polling interval in milliseconds (optional, default: 500)
 * 
 * Exit codes:
 *   0 - Normal termination (via signal)
 *   1 - Configuration error (missing env var)
 *   2 - Hardware initialization error
 *   3 - Network initialization error
 */

// Feature test macros must come before any includes
#define _QNX_SOURCE
#define _POSIX_C_SOURCE 200809L

#include "Mcp3008.hpp"
#include "RestClient.hpp"

#include <iostream>
#include <cstdlib>
#include <cstring>
#include <csignal>
#include <unistd.h>
#include <time.h>
#include <iomanip>
#include <sstream>

namespace {
    /// Reference voltage for ADC (3.3V for Raspberry Pi)
    constexpr double VREF = 3.3;
    
    /// Maximum ADC value (10-bit)
    constexpr double ADC_MAX = 1023.0;
    
    /// ADC channel connected to potentiometer
    constexpr uint8_t POT_CHANNEL = 0;
    
    /// Default SPI device path
    constexpr const char* DEFAULT_SPI_DEVICE = "/dev/spi0";
    
    /// Default polling interval in milliseconds
    constexpr int DEFAULT_POLL_INTERVAL_MS = 500;
    
    /// API endpoint for posting sensor data
    constexpr const char* API_ENDPOINT = "/api/v1/breathing/raw";
    
    /// Flag for graceful shutdown
    volatile sig_atomic_t g_running = 1;
}

/**
 * @brief Convert raw ADC value to voltage
 * @param raw Raw ADC value (0-1023)
 * @return Voltage in volts
 */
double rawToVoltage(uint16_t raw) {
    return (static_cast<double>(raw) / ADC_MAX) * VREF;
}

/**
 * @brief Build JSON payload for API request
 * @param raw Raw ADC value
 * @param voltage Calculated voltage
 * @return JSON string
 */
std::string buildJsonPayload(uint16_t raw, double voltage) {
    std::ostringstream json;
    json << std::fixed << std::setprecision(4);
    json << "{\"raw\":" << raw << ",\"voltage\":" << voltage << "}";
    return json.str();
}

/**
 * @brief Signal handler for graceful shutdown
 */
void signalHandler(int signum) {
    (void)signum;  // Suppress unused parameter warning
    g_running = 0;
}

/**
 * @brief Get environment variable with optional default
 * @param name Variable name
 * @param defaultValue Default if not set (nullptr means required)
 * @return Variable value or default
 */
const char* getEnvOrDefault(const char* name, const char* defaultValue) {
    const char* value = std::getenv(name);
    if (value != nullptr && value[0] != '\0') {
        return value;
    }
    return defaultValue;
}

/**
 * @brief Log message to stderr with timestamp
 */
void logMessage(const char* level, const std::string& message) {
    time_t now = time(nullptr);
    char timestamp[32];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", localtime(&now));
    std::cerr << "[" << timestamp << "] [" << level << "] " << message << std::endl;
}

void logInfo(const std::string& message) { logMessage("INFO", message); }
void logError(const std::string& message) { logMessage("ERROR", message); }
void logWarn(const std::string& message) { logMessage("WARN", message); }

/**
 * @brief Sleep for specified milliseconds (portable replacement for usleep)
 * @param milliseconds Time to sleep in milliseconds
 */
void sleepMs(int milliseconds) {
    struct timespec ts;
    ts.tv_sec = milliseconds / 1000;
    ts.tv_nsec = (milliseconds % 1000) * 1000000L;
    nanosleep(&ts, nullptr);
}

int main() {
    // Setup signal handlers for graceful shutdown
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);
    
    logInfo("Breath sensor starting...");
    
    // Get configuration from environment
    const char* apiUrl = getEnvOrDefault("RAILWAY_API_URL", nullptr);
    if (apiUrl == nullptr) {
        logError("RAILWAY_API_URL environment variable not set");
        return 1;
    }
    
    const char* spiDevice = getEnvOrDefault("SPI_DEVICE", DEFAULT_SPI_DEVICE);
    
    const char* pollIntervalStr = getEnvOrDefault("POLL_INTERVAL_MS", nullptr);
    int pollIntervalMs = DEFAULT_POLL_INTERVAL_MS;
    if (pollIntervalStr != nullptr) {
        pollIntervalMs = std::atoi(pollIntervalStr);
        if (pollIntervalMs <= 0) {
            logWarn("Invalid POLL_INTERVAL_MS, using default");
            pollIntervalMs = DEFAULT_POLL_INTERVAL_MS;
        }
    }
    
    logInfo("Configuration:");
    logInfo("  API URL: " + std::string(apiUrl));
    logInfo("  SPI Device: " + std::string(spiDevice));
    logInfo("  Poll Interval: " + std::to_string(pollIntervalMs) + " ms");
    
    // Initialize MCP3008 ADC
    std::unique_ptr<Mcp3008> adc;
    try {
        adc = std::make_unique<Mcp3008>(spiDevice);
        logInfo("MCP3008 ADC initialized on " + std::string(spiDevice));
    } catch (const std::exception& e) {
        logError(std::string("Failed to initialize ADC: ") + e.what());
        return 2;
    }
    
    // Initialize REST client
    std::unique_ptr<RestClient> client;
    try {
        client = std::make_unique<RestClient>(apiUrl);
        logInfo("REST client initialized for " + std::string(apiUrl));
    } catch (const std::exception& e) {
        logError(std::string("Failed to initialize REST client: ") + e.what());
        return 3;
    }
    
    logInfo("Starting main loop (poll interval: " + std::to_string(pollIntervalMs) + " ms)");
    
    // Main polling loop
    uint32_t sampleCount = 0;
    uint32_t errorCount = 0;
    
    while (g_running) {
        try {
            // Read ADC value
            uint16_t rawValue = adc->readChannel(POT_CHANNEL);
            double voltage = rawToVoltage(rawValue);
            
            // Build and send payload
            std::string payload = buildJsonPayload(rawValue, voltage);
            RestClient::Response response = client->post(API_ENDPOINT, payload);
            
            sampleCount++;
            
            if (response.success) {
                if (response.httpCode >= 200 && response.httpCode < 300) {
                    // Success - log periodically (every 100 samples)
                    if (sampleCount % 100 == 0) {
                        logInfo("Sent " + std::to_string(sampleCount) + 
                               " samples, last: raw=" + std::to_string(rawValue) + 
                               ", voltage=" + std::to_string(voltage) + "V");
                    }
                } else {
                    // HTTP error
                    logWarn("HTTP " + std::to_string(response.httpCode) + 
                           " for sample " + std::to_string(sampleCount));
                }
            } else {
                // Request failed
                errorCount++;
                logError("Request failed: " + response.error);
                
                // If too many consecutive errors, slow down
                if (errorCount > 10) {
                    logWarn("Multiple errors, backing off...");
                    sleepMs(5000);  // 5 second backoff
                    errorCount = 0;
                }
            }
            
        } catch (const std::exception& e) {
            errorCount++;
            logError(std::string("Error in main loop: ") + e.what());
        }
        
        // Sleep until next poll
        sleepMs(pollIntervalMs);
    }
    
    logInfo("Shutting down after " + std::to_string(sampleCount) + " samples");
    
    return 0;
}
