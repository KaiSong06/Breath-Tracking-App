import { z } from 'zod';
import type { ProcessedBreathingSample, Alert } from './domain.types';

/**
 * API Request/Response types and validation schemas
 */

// ============ Request Schemas ============

/**
 * Schema for raw breath sample input
 */
export const RawBreathSampleSchema = z.object({
  deviceId: z.string().min(1).max(64),
  timestamp: z.number().int().positive(),
  rawValue: z.number().int().min(0).max(4095), // 12-bit ADC range
});

export type RawBreathSampleRequest = z.infer<typeof RawBreathSampleSchema>;

/**
 * Schema for history query parameters
 */
export const HistoryQuerySchema = z.object({
  from: z.coerce.number().int().positive().optional(),
  to: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  deviceId: z.string().optional(),
});

export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;

// ============ Response Types ============

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  database: 'connected' | 'disconnected';
}

/**
 * Response for POST /breathing/raw
 */
export interface RawSampleResponse {
  received: boolean;
  processed: ProcessedBreathingSample | null;
  alertTriggered: boolean;
}

/**
 * Response for GET /breathing/latest
 */
export type LatestSampleResponse = ProcessedBreathingSample | null;

/**
 * Response for GET /breathing/history
 */
export interface HistoryResponse {
  samples: ProcessedBreathingSample[];
  count: number;
  hasMore: boolean;
}

// ============ WebSocket Event Types ============

export type WSEventType = 'PROCESSED_SAMPLE' | 'ALERT' | 'CONNECTION_ACK' | 'ERROR';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: number;
}

export interface WSProcessedSampleEvent extends WSEvent<ProcessedBreathingSample> {
  type: 'PROCESSED_SAMPLE';
}

export interface WSAlertEvent extends WSEvent<Alert> {
  type: 'ALERT';
}

export interface WSConnectionAckEvent extends WSEvent<{ message: string }> {
  type: 'CONNECTION_ACK';
}

export interface WSErrorEvent extends WSEvent<{ code: string; message: string }> {
  type: 'ERROR';
}

