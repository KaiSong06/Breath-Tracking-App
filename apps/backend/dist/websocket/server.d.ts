import { Server as HTTPServer } from 'http';
import type { ProcessedBreathingSample, Alert } from '../types';
/**
 * WebSocket server for real-time breathing data
 */
declare class WSServer {
    private wss;
    private clients;
    private pingInterval;
    /**
     * Initialize WebSocket server
     */
    init(server: HTTPServer): void;
    /**
     * Handle incoming message from client
     */
    private handleMessage;
    /**
     * Send message to a specific client
     */
    private send;
    /**
     * Broadcast message to all connected clients
     */
    private broadcast;
    /**
     * Broadcast a processed sample to all clients
     */
    broadcastProcessedSample(sample: ProcessedBreathingSample): void;
    /**
     * Broadcast an alert to all clients
     */
    broadcastAlert(alert: Alert): void;
    /**
     * Start ping interval to keep connections alive
     */
    private startPingInterval;
    /**
     * Get number of connected clients
     */
    getClientCount(): number;
    /**
     * Close WebSocket server
     */
    close(): Promise<void>;
}
export declare const wsServer: WSServer;
export {};
//# sourceMappingURL=server.d.ts.map