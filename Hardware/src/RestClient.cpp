/**
 * @file RestClient.cpp
 * @brief HTTP REST client implementation using libcurl
 */

#include "RestClient.hpp"

#include <stdexcept>
#include <utility>

RestClient::RestClient(std::string baseUrl)
    : m_curl(nullptr)
    , m_baseUrl(std::move(baseUrl))
    , m_timeout(DEFAULT_TIMEOUT_SECONDS)
    , m_connectTimeout(DEFAULT_CONNECT_TIMEOUT_SECONDS)
{
    // Initialize libcurl globally (safe to call multiple times)
    static bool curlGlobalInit = false;
    if (!curlGlobalInit) {
        CURLcode res = curl_global_init(CURL_GLOBAL_DEFAULT);
        if (res != CURLE_OK) {
            throw std::runtime_error(
                std::string("Failed to initialize libcurl: ") + 
                curl_easy_strerror(res)
            );
        }
        curlGlobalInit = true;
    }
    
    m_curl = curl_easy_init();
    if (!m_curl) {
        throw std::runtime_error("Failed to create libcurl handle");
    }
    
    // Remove trailing slash from base URL if present
    if (!m_baseUrl.empty() && m_baseUrl.back() == '/') {
        m_baseUrl.pop_back();
    }
}

RestClient::~RestClient() {
    if (m_curl) {
        curl_easy_cleanup(m_curl);
        m_curl = nullptr;
    }
}

RestClient::RestClient(RestClient&& other) noexcept
    : m_curl(other.m_curl)
    , m_baseUrl(std::move(other.m_baseUrl))
    , m_timeout(other.m_timeout)
    , m_connectTimeout(other.m_connectTimeout)
{
    other.m_curl = nullptr;
}

RestClient& RestClient::operator=(RestClient&& other) noexcept {
    if (this != &other) {
        if (m_curl) {
            curl_easy_cleanup(m_curl);
        }
        m_curl = other.m_curl;
        m_baseUrl = std::move(other.m_baseUrl);
        m_timeout = other.m_timeout;
        m_connectTimeout = other.m_connectTimeout;
        other.m_curl = nullptr;
    }
    return *this;
}

size_t RestClient::writeCallback(char* ptr, size_t size, size_t nmemb, void* userdata) {
    size_t totalSize = size * nmemb;
    auto* response = static_cast<std::string*>(userdata);
    response->append(ptr, totalSize);
    return totalSize;
}

RestClient::Response RestClient::post(const std::string& endpoint, const std::string& jsonPayload) {
    Response response{false, 0, "", ""};
    
    if (!m_curl) {
        response.error = "RestClient not initialized";
        return response;
    }
    
    // Build full URL
    std::string url = m_baseUrl;
    if (!endpoint.empty()) {
        if (endpoint.front() != '/') {
            url += '/';
        }
        url += endpoint;
    }
    
    // Reset curl handle for new request
    curl_easy_reset(m_curl);
    
    // Set URL
    curl_easy_setopt(m_curl, CURLOPT_URL, url.c_str());
    
    // Set POST method
    curl_easy_setopt(m_curl, CURLOPT_POST, 1L);
    
    // Set request body
    curl_easy_setopt(m_curl, CURLOPT_POSTFIELDS, jsonPayload.c_str());
    curl_easy_setopt(m_curl, CURLOPT_POSTFIELDSIZE, static_cast<long>(jsonPayload.size()));
    
    // Set headers
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "Accept: application/json");
    curl_easy_setopt(m_curl, CURLOPT_HTTPHEADER, headers);
    
    // Set timeouts
    curl_easy_setopt(m_curl, CURLOPT_TIMEOUT, m_timeout);
    curl_easy_setopt(m_curl, CURLOPT_CONNECTTIMEOUT, m_connectTimeout);
    
    // Set response callback
    curl_easy_setopt(m_curl, CURLOPT_WRITEFUNCTION, writeCallback);
    curl_easy_setopt(m_curl, CURLOPT_WRITEDATA, &response.body);
    
    // Disable signal handling (safer for embedded systems)
    curl_easy_setopt(m_curl, CURLOPT_NOSIGNAL, 1L);
    
    // Follow redirects
    curl_easy_setopt(m_curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(m_curl, CURLOPT_MAXREDIRS, 3L);
    
    // Skip SSL certificate verification (needed on embedded systems without CA bundle)
    // For production, install proper CA certificates instead
    curl_easy_setopt(m_curl, CURLOPT_SSL_VERIFYPEER, 0L);
    curl_easy_setopt(m_curl, CURLOPT_SSL_VERIFYHOST, 0L);
    
    // Perform request
    CURLcode res = curl_easy_perform(m_curl);
    
    // Clean up headers
    curl_slist_free_all(headers);
    
    if (res != CURLE_OK) {
        response.success = false;
        response.error = std::string("HTTP request failed: ") + curl_easy_strerror(res);
        return response;
    }
    
    // Get HTTP response code
    curl_easy_getinfo(m_curl, CURLINFO_RESPONSE_CODE, &response.httpCode);
    response.success = true;
    
    return response;
}

void RestClient::setTimeout(long timeoutSeconds) {
    m_timeout = timeoutSeconds;
}

void RestClient::setConnectTimeout(long timeoutSeconds) {
    m_connectTimeout = timeoutSeconds;
}

const std::string& RestClient::getBaseUrl() const noexcept {
    return m_baseUrl;
}
