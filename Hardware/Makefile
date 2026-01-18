# Makefile for breath_sensor application
# Cross-compiles for QNX Neutrino on ARM64 (Raspberry Pi 5)

.PHONY: all clean deploy help

# Default target
all:
	@./build.sh

# Clean build artifacts
clean:
	@./build.sh clean

# Deploy to Raspberry Pi (requires PI_IP and API_URL)
# Usage: make deploy PI_IP=192.168.1.100 API_URL=https://your-api.railway.app
deploy:
ifndef PI_IP
	$(error PI_IP is not set. Usage: make deploy PI_IP=192.168.1.100 API_URL=https://...)
endif
ifndef API_URL
	$(error API_URL is not set. Usage: make deploy PI_IP=192.168.1.100 API_URL=https://...)
endif
	@./deploy/install.sh $(PI_IP) $(API_URL)

# Show help
help:
	@echo "Breath Sensor Build System"
	@echo ""
	@echo "Targets:"
	@echo "  all      - Build the application (default)"
	@echo "  clean    - Remove build artifacts"
	@echo "  deploy   - Deploy to Raspberry Pi"
	@echo "  help     - Show this help message"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy PI_IP=<ip> API_URL=<url>"
	@echo ""
	@echo "Example:"
	@echo "  make deploy PI_IP=192.168.1.100 API_URL=https://my-api.railway.app"
