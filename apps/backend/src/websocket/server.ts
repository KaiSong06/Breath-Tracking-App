import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from '../config';
import { logger } from '../utils/logger';
import type { ProcessedBreathingSample, Alert } from '../types';
import { 
  createProcessedSampleEvent, 
  createAlertEvent, 
  createConnectionAckEvent,
  createErrorEvent 
} from './events';

/**
 * WebSocket server for real-time breathing data
 */
class WSServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private pingInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   */
  init(server: HTTPServer): void {
    this.wss = new WebSocketServer({ 
      server,
      path: config.websocket.path,
    });

    this.wss.on('connection', (ws, req) => {
      const clientIp = req.socket.remoteAddress;
      logger.info('WebSocket client connected', { clientIp });
      
      this.clients.add(ws);

      // Send connection acknowledgment
      this.send(ws, createConnectionAckEvent());

      // Handle messages from client
      ws.on('message', (data) => {
        this.handleMessage(ws, data.toString());
      });

      // Handle client disconnect
      ws.on('close', () => {
        logger.info('WebSocket client disconnected', { clientIp });
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket client error', { error: error.message, clientIp });
        this.clients.delete(ws);
      });
    });

    // Start ping interval to keep connections alive
    this.startPingInterval();

    logger.info('WebSocket server initialized', { 
      path: config.websocket.path 
    });
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(ws: WebSocket, message: string): void {
    try {
      const data = JSON.parse(message);
      
      // Handle ping
      if (data.type === 'PING') {
        this.send(ws, { type: 'PONG', timestamp: Date.now() });
        return;
      }

      // TODO: Handle other message types (e.g., subscribe to specific device)
      logger.debug('Received WebSocket message', { type: data.type });
      
    } catch (error) {
      logger.warn('Invalid WebSocket message', { message });
      this.send(ws, createErrorEvent('INVALID_MESSAGE', 'Invalid JSON message'));
    }
  }

  /**
   * Send message to a specific client
   */
  private send(ws: WebSocket, data: unknown): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(data: unknown): void {
    const message = JSON.stringify(data);
    
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  /**
   * Broadcast a processed sample to all clients
   */
  broadcastProcessedSample(sample: ProcessedBreathingSample): void {
    const event = createProcessedSampleEvent(sample);
    this.broadcast(event);
    
    logger.debug('Broadcast processed sample', { 
      deviceId: sample.deviceId,
      clients: this.clients.size 
    });
  }

  /**
   * Broadcast an alert to all clients
   */
  broadcastAlert(alert: Alert): void {
    const event = createAlertEvent(alert);
    this.broadcast(event);
    
    logger.info('Broadcast alert', { 
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      clients: this.clients.size 
    });
  }

  /**
   * Start ping interval to keep connections alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      }
    }, config.websocket.pingInterval);
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Close WebSocket server
   */
  close(): Promise<void> {
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
          logger.info('WebSocket server closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export const wsServer = new WSServer();

