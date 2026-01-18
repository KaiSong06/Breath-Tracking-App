/**
 * @file RestClient.hpp
 * @brief HTTP REST client using libcurl
 * 
 * Provides a simple interface for sending HTTP POST requests
 * with JSON payloads to a REST API.
 */

#ifndef REST_CLIENT_HPP
#define REST_CLIENT_HPP

#include <string>
#include <curl/curl.h>

/**
 * @class RestClient
 * @brief HTTP client for REST API communication
 * 
 * RAII-based client that initializes libcurl on construction
 * and cleans up on destruction. Thread-safe for single-threaded use.
 * 
 * Example usage:
 * @code
 *   RestClient client("https://api.example.com");
 *   auto response = client.post("/data", "{\"value\": 42}");
 *   if (response.success) {
 *       std::cout << "HTTP " << response.httpCode << std::endl;
 *   }
 * @endcode
 */
class RestClient {
public:
    /// Default timeout for HTTP requests in seconds
    static constexpr long DEFAULT_TIMEOUT_SECONDS = 5;
    
    /// Default connection timeout in seconds
    static constexpr long DEFAULT_CONNECT_TIMEOUT_SECONDS = 3;

    /**
     * @struct Response
     * @brief HTTP response data
     */
    struct Response {
        bool success;           ///< true if request completed (even with HTTP error)
        long httpCode;          ///< HTTP status code (0 if request failed)
        std::string body;       ///< Response body
        std::string error;      ///< Error message if success is false
    };

    /**
     * @brief Construct REST client with base URL
     * @param baseUrl Base URL for all requests (e.g., "https://api.example.com")
     * @throws std::runtime_error if libcurl initialization fails
     */
    explicit RestClient(std::string baseUrl);
    
    /**
     * @brief Destructor - cleans up libcurl handle
     */
    ~RestClient();
    
    // Disable copy operations (curl handle ownership)
    RestClient(const RestClient&) = delete;
    RestClient& operator=(const RestClient&) = delete;
    
    // Enable move operations
    RestClient(RestClient&& other) noexcept;
    RestClient& operator=(RestClient&& other) noexcept;

    /**
     * @brief Send HTTP POST request with JSON payload
     * @param endpoint API endpoint (appended to base URL)
     * @param jsonPayload JSON string to send as request body
     * @return Response containing HTTP status and body
     */
    Response post(const std::string& endpoint, const std::string& jsonPayload);
    
    /**
     * @brief Set request timeout
     * @param timeoutSeconds Timeout in seconds (0 for no timeout)
     */
    void setTimeout(long timeoutSeconds);
    
    /**
     * @brief Set connection timeout
     * @param timeoutSeconds Connection timeout in seconds
     */
    void setConnectTimeout(long timeoutSeconds);
    
    /**
     * @brief Get the base URL
     * @return Base URL string
     */
    const std::string& getBaseUrl() const noexcept;

private:
    CURL* m_curl;                   ///< libcurl easy handle
    std::string m_baseUrl;          ///< Base URL for requests
    long m_timeout;                 ///< Request timeout in seconds
    long m_connectTimeout;          ///< Connection timeout in seconds
    
    /**
     * @brief libcurl write callback for capturing response body
     */
    static size_t writeCallback(char* ptr, size_t size, size_t nmemb, void* userdata);
};

#endif // REST_CLIENT_HPP
