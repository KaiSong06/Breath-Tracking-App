/**
 * @file Mcp3008.hpp
 * @brief MCP3008 ADC driver for QNX Neutrino
 * 
 * Provides SPI communication with the MCP3008 10-bit ADC.
 * Uses QNX POSIX-compliant SPI access via file descriptors and devctl().
 */

#ifndef MCP3008_HPP
#define MCP3008_HPP

#include <cstdint>
#include <string>

/**
 * @class Mcp3008
 * @brief Driver for MCP3008 10-bit ADC over SPI
 * 
 * RAII-based driver that opens the SPI device on construction
 * and closes it on destruction. Supports reading from any of
 * the 8 single-ended analog input channels.
 * 
 * Example usage:
 * @code
 *   Mcp3008 adc("/dev/spi0");
 *   uint16_t value = adc.readChannel(0);
 * @endcode
 */
class Mcp3008 {
public:
    /// Maximum valid channel number (0-7)
    static constexpr uint8_t MAX_CHANNEL = 7;
    
    /// Maximum ADC value (10-bit resolution)
    static constexpr uint16_t MAX_VALUE = 1023;
    
    /// Number of bytes in SPI transfer
    static constexpr size_t SPI_TRANSFER_SIZE = 3;
    
    /// Default SPI clock speed in Hz (1 MHz is safe for MCP3008)
    static constexpr uint32_t DEFAULT_SPI_SPEED_HZ = 1000000;

    /**
     * @brief Construct and open SPI connection to MCP3008
     * @param spiDevice Path to SPI device (e.g., "/dev/spi0")
     * @throws std::runtime_error if SPI device cannot be opened
     */
    explicit Mcp3008(const std::string& spiDevice);
    
    /**
     * @brief Destructor - closes SPI file descriptor
     */
    ~Mcp3008();
    
    // Disable copy operations (file descriptor ownership)
    Mcp3008(const Mcp3008&) = delete;
    Mcp3008& operator=(const Mcp3008&) = delete;
    
    // Enable move operations
    Mcp3008(Mcp3008&& other) noexcept;
    Mcp3008& operator=(Mcp3008&& other) noexcept;

    /**
     * @brief Read raw ADC value from specified channel
     * @param channel Channel number (0-7)
     * @return Raw ADC value (0-1023)
     * @throws std::invalid_argument if channel > 7
     * @throws std::runtime_error if SPI transfer fails
     */
    uint16_t readChannel(uint8_t channel);
    
    /**
     * @brief Check if device is open and ready
     * @return true if SPI device is open
     */
    bool isOpen() const noexcept;

private:
    int m_fd;                    ///< SPI file descriptor
    std::string m_devicePath;   ///< Path to SPI device
    
    /**
     * @brief Configure SPI parameters (mode, speed, bits)
     * @throws std::runtime_error if configuration fails
     */
    void configureSpi();
    
    /**
     * @brief Perform full-duplex SPI transfer
     * @param txBuf Transmit buffer
     * @param rxBuf Receive buffer
     * @param length Number of bytes to transfer
     * @throws std::runtime_error if transfer fails
     */
    void spiTransfer(const uint8_t* txBuf, uint8_t* rxBuf, size_t length);
};

#endif // MCP3008_HPP
