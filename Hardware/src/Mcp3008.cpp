/**
 * @file Mcp3008.cpp
 * @brief MCP3008 ADC driver implementation for QNX Neutrino
 */

#include "Mcp3008.hpp"

#include <fcntl.h>
#include <unistd.h>
#include <sys/types.h>
#include <devctl.h>
#include <errno.h>
#include <cstring>
#include <stdexcept>

// QNX SPI header - provides spi_cfg_t and DCMD_SPI_* commands
#include <hw/spi-master.h>

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
    
    configureSpi();
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
    spi_cfg_t cfg;
    std::memset(&cfg, 0, sizeof(cfg));
    
    // Configure SPI parameters for MCP3008
    cfg.mode = SPI_MODE_0;              // CPOL=0, CPHA=0
    cfg.clock_rate = DEFAULT_SPI_SPEED_HZ;
    
    int result = devctl(m_fd, DCMD_SPI_SET_CONFIG, &cfg, sizeof(cfg), nullptr);
    if (result != EOK) {
        close(m_fd);
        m_fd = -1;
        throw std::runtime_error(
            "Failed to configure SPI: " + std::string(std::strerror(result))
        );
    }
}

void Mcp3008::spiTransfer(const uint8_t* txBuf, uint8_t* rxBuf, size_t length) {
    // QNX SPI transfer using devctl with DCMD_SPI_READWRITE
    // We need to use the spi_read_write structure for full-duplex transfer
    
    // Allocate buffer for command structure + data
    // The spi_cmdread_t structure is followed by the tx data
    size_t cmdSize = sizeof(spi_cmdread_t) + length;
    std::vector<uint8_t> cmdBuf(cmdSize);
    
    auto* cmd = reinterpret_cast<spi_cmdread_t*>(cmdBuf.data());
    cmd->device = 0;  // Chip select 0
    cmd->len = length;
    
    // Copy transmit data after the command structure
    std::memcpy(cmdBuf.data() + sizeof(spi_cmdread_t), txBuf, length);
    
    // Perform the transfer - response overwrites the data portion
    int result = devctl(m_fd, DCMD_SPI_READWRITE, cmdBuf.data(), cmdSize, nullptr);
    if (result != EOK) {
        throw std::runtime_error(
            "SPI transfer failed: " + std::string(std::strerror(result))
        );
    }
    
    // Copy received data from response
    std::memcpy(rxBuf, cmdBuf.data() + sizeof(spi_cmdread_t), length);
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
