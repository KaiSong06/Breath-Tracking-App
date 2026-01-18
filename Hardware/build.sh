#!/bin/bash
#
# Build script for breath_sensor application
# Cross-compiles for QNX Neutrino on ARM64 (Raspberry Pi 5)
#
# Usage: ./build.sh [clean]
#

set -e

# Project configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_NAME="breath_sensor"
SRC_DIR="src"

# Source QNX environment if available locally (optional, Docker handles this)
if [ -f "$HOME/qnx800/qnxsdp-env.sh" ]; then
    source "$HOME/qnx800/qnxsdp-env.sh" 2>/dev/null || true
fi

# Handle clean command
if [ "$1" = "clean" ]; then
    echo "Cleaning build artifacts..."
    rm -f "${PROJECT_DIR}/${OUTPUT_NAME}"
    rm -f "${PROJECT_DIR}/${SRC_DIR}"/*.o
    echo "Clean complete."
    exit 0
fi

echo "Building ${OUTPUT_NAME} for QNX Neutrino (aarch64)..."
echo "Project directory: ${PROJECT_DIR}"

# Build using Docker with QNX SDK
docker run --rm \
    --platform linux/amd64 \
    --network host \
    -v "$HOME/qnx800:/qnx800" \
    -v "$HOME/.qnx:/root/.qnx" \
    -e HOME=/root \
    -e QNX_LICENSE_FILE=/root/.qnx/license/licenses \
    -v "${PROJECT_DIR}:/workspace" \
    -w /workspace \
    --user root \
    qnx800 \
    bash -c "
        chmod 777 /root && \
        source /qnx800/qnxsdp-env.sh && \
        echo 'Compiling with qcc...' && \
        qcc -Vgcc_ntoaarch64le_cxx \
            -std=c++17 \
            -Wall \
            -Wextra \
            -O2 \
            -o ${OUTPUT_NAME} \
            ${SRC_DIR}/Mcp3008.cpp \
            ${SRC_DIR}/RestClient.cpp \
            ${SRC_DIR}/main.cpp \
            -lcurl \
            -lsocket && \
        echo 'Build successful!'
    "

# Check if build succeeded
if [ -f "${PROJECT_DIR}/${OUTPUT_NAME}" ]; then
    echo ""
    echo "Build complete: ${PROJECT_DIR}/${OUTPUT_NAME}"
    echo ""
    echo "To deploy to Raspberry Pi:"
    echo "  ./deploy/install.sh <PI_IP> <RAILWAY_API_URL>"
    echo ""
    file "${PROJECT_DIR}/${OUTPUT_NAME}" 2>/dev/null || true
else
    echo "Build failed - output binary not found"
    exit 1
fi
