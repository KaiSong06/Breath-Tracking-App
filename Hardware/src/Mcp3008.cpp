/**
 * @file Mcp3008.cpp
 * @brief MCP3008 ADC driver implementation for QNX Neutrino
 * 
 * Uses POSIX file I/O for SPI communication, compatible with QNX's
 * SPI resource manager without requiring platform-specific headers.
 */

// Feature test macros must come before any includes
#define _QNX_SOURCE
#define _POSIX_C_SOURCE 200809L

#include "Mcp3008.hpp"

#include <fcntl.h>
#include <unistd.h>
#include <sys/types.h>
#include <errno.h>
#include <cstring>
#include <stdexcept>
#include <vector>

namespace {
    /// Start bit for MCP3008 command
    constexpr uint8_t MCP3008_START_BIT = 0x01;
    
    /// Single-ended mode flag (bit 3 of control byte)
    constexpr uint8_t MCP3008_SINGLE_ENDED = 0x80;
    
    /// Mask for extracting 10-bit result from response bytes
    constexpr uint16_t MCP3008_RESULT_MASK = 0x03FF;
}

Mcp3008::Mcp3008(const std::string& spiDevice)
    : m_fd(-1)
    , m_devicePath(spiDevice)
{
    m_fd = open(spiDevice.c_str(), O_RDWR);
    if (m_fd < 0) {
        throw std::runtime_error(
            "Failed to open SPI device '" + spiDevice + "': " + 
            std::strerror(errno)
        );
    }
    
    // Note: SPI configuration (mode, speed) is typically handled by
    // the QNX SPI resource manager based on device configuration.
    // If specific configuration is needed, it would be done via
    // devctl() with appropriate commands for the specific SPI driver.
}

Mcp3008::~Mcp3008() {
    if (m_fd >= 0) {
        close(m_fd);
        m_fd = -1;
    }
}

Mcp3008::Mcp3008(Mcp3008&& other) noexcept
    : m_fd(other.m_fd)
    , m_devicePath(std::move(other.m_devicePath))
{
    other.m_fd = -1;
}

Mcp3008& Mcp3008::operator=(Mcp3008&& other) noexcept {
    if (this != &other) {
        if (m_fd >= 0) {
            close(m_fd);
        }
        m_fd = other.m_fd;
        m_devicePath = std::move(other.m_devicePath);
        other.m_fd = -1;
    }
    return *this;
}

void Mcp3008::configureSpi() {
    // SPI configuration is handled by the resource manager on QNX.
    // This method is kept for interface compatibility but does nothing
    // in this implementation. Configuration parameters like clock speed
    // and mode are set when the SPI driver is started.
}

void Mcp3008::spiTransfer(const uint8_t* txBuf, uint8_t* rxBuf, size_t length) {
    // For QNX SPI resource manager, we perform a combined write/read operation.
    // The SPI protocol is full-duplex, so we write and read simultaneously.
    
    // Write command bytes
    ssize_t bytesWritten = write(m_fd, txBuf, length);
    if (bytesWritten < 0) {
        throw std::runtime_error(
            "SPI write failed: " + std::string(std::strerror(errno))
        );
    }
    if (static_cast<size_t>(bytesWritten) != length) {
        throw std::runtime_error(
            "SPI write incomplete: wrote " + std::to_string(bytesWritten) + 
            " of " + std::to_string(length) + " bytes"
        );
    }
    
    // Read response bytes
    ssize_t bytesRead = read(m_fd, rxBuf, length);
    if (bytesRead < 0) {
        throw std::runtime_error(
            "SPI read failed: " + std::string(std::strerror(errno))
        );
    }
    if (static_cast<size_t>(bytesRead) != length) {
        throw std::runtime_error(
            "SPI read incomplete: read " + std::to_string(bytesRead) + 
            " of " + std::to_string(length) + " bytes"
        );
    }
}

uint16_t Mcp3008::readChannel(uint8_t channel) {
    if (channel > MAX_CHANNEL) {
        throw std::invalid_argument(
            "Invalid channel " + std::to_string(channel) + 
            " (must be 0-" + std::to_string(MAX_CHANNEL) + ")"
        );
    }
    
    if (m_fd < 0) {
        throw std::runtime_error("SPI device not open");
    }
    
    // Build MCP3008 command for single-ended read
    // Byte 0: Start bit (0x01)
    // Byte 1: Single-ended + channel select (0x80 | channel << 4)
    // Byte 2: Don't care (0x00)
    uint8_t txBuf[SPI_TRANSFER_SIZE] = {
        MCP3008_START_BIT,
        static_cast<uint8_t>(MCP3008_SINGLE_ENDED | (channel << 4)),
        0x00
    };
    
    uint8_t rxBuf[SPI_TRANSFER_SIZE] = {0};
    
    spiTransfer(txBuf, rxBuf, SPI_TRANSFER_SIZE);
    
    // Extract 10-bit result from response
    // Null bit in bit 0 of byte 1, then bits 9-8 in byte 1, bits 7-0 in byte 2
    uint16_t result = static_cast<uint16_t>(
        ((rxBuf[1] & 0x03) << 8) | rxBuf[2]
    );
    
    return result & MCP3008_RESULT_MASK;
}

bool Mcp3008::isOpen() const noexcept {
    return m_fd >= 0;
}
