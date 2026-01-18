"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsServer = void 0;
const ws_1 = require("ws");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const events_1 = require("./events");
/**
 * WebSocket server for real-time breathing data
 */
class WSServer {
    wss = null;
    clients = new Set();
    pingInterval = null;
    /**
     * Initialize WebSocket server
     */
    init(server) {
        this.wss = new ws_1.WebSocketServer({
            server,
            path: config_1.config.websocket.path,
        });
        this.wss.on('connection', (ws, req) => {
            const clientIp = req.socket.remoteAddress;
            logger_1.logger.info('WebSocket client connected', { clientIp });
            this.clients.add(ws);
            // Send connection acknowledgment
            this.send(ws, (0, events_1.createConnectionAckEvent)());
            // Handle messages from client
            ws.on('message', (data) => {
                this.handleMessage(ws, data.toString());
            });
            // Handle client disconnect
            ws.on('close', () => {
                logger_1.logger.info('WebSocket client disconnected', { clientIp });
                this.clients.delete(ws);
            });
            // Handle errors
            ws.on('error', (error) => {
                logger_1.logger.error('WebSocket client error', { error: error.message, clientIp });
                this.clients.delete(ws);
            });
        });
        // Start ping interval to keep connections alive
        this.startPingInterval();
        logger_1.logger.info('WebSocket server initialized', {
            path: config_1.config.websocket.path
        });
    }
    /**
     * Handle incoming message from client
     */
    handleMessage(ws, message) {
        try {
            const data = JSON.parse(message);
            // Handle ping
            if (data.type === 'PING') {
                this.send(ws, { type: 'PONG', timestamp: Date.now() });
                return;
            }
            // TODO: Handle other message types (e.g., subscribe to specific device)
            logger_1.logger.debug('Received WebSocket message', { type: data.type });
        }
        catch (error) {
            logger_1.logger.warn('Invalid WebSocket message', { message });
            this.send(ws, (0, events_1.createErrorEvent)('INVALID_MESSAGE', 'Invalid JSON message'));
        }
    }
    /**
     * Send message to a specific client
     */
    send(ws, data) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }
    /**
     * Broadcast message to all connected clients
     */
    broadcast(data) {
        const message = JSON.stringify(data);
        for (const client of this.clients) {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(message);
            }
        }
    }
    /**
     * Broadcast a processed sample to all clients
     */
    broadcastProcessedSample(sample) {
        const event = (0, events_1.createProcessedSampleEvent)(sample);
        this.broadcast(event);
        logger_1.logger.debug('Broadcast processed sample', {
            deviceId: sample.deviceId,
            clients: this.clients.size
        });
    }
    /**
     * Broadcast an alert to all clients
     */
    broadcastAlert(alert) {
        const event = (0, events_1.createAlertEvent)(alert);
        this.broadcast(event);
        logger_1.logger.info('Broadcast alert', {
            alertId: alert.id,
            type: alert.type,
            severity: alert.severity,
            clients: this.clients.size
        });
    }
    /**
     * Start ping interval to keep connections alive
     */
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            for (const client of this.clients) {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.ping();
                }
            }
        }, config_1.config.websocket.pingInterval);
    }
    /**
     * Get number of connected clients
     */
    getClientCount() {
        return this.clients.size;
    }
    /**
     * Close WebSocket server
     */
    close() {
        return new Promise((resolve) => {
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
            }
            if (this.wss) {
                // Close all client connections
                for (const client of this.clients) {
                    client.close(1000, 'Server shutting down');
                }
                this.wss.close(() => {
                    logger_1.logger.info('WebSocket server closed');
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
}
exports.wsServer = new WSServer();
//# sourceMappingURL=server.js.map