import { z } from 'zod';
import type { ProcessedBreathingSample, Alert } from './domain.types';
/**
 * API Request/Response types and validation schemas
 */
/**
 * Schema for raw breath sample input
 */
export declare const RawBreathSampleSchema: z.ZodObject<{
    deviceId: z.ZodString;
    timestamp: z.ZodNumber;
    rawValue: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    deviceId: string;
    timestamp: number;
    rawValue: number;
}, {
    deviceId: string;
    timestamp: number;
    rawValue: number;
}>;
export type RawBreathSampleRequest = z.infer<typeof RawBreathSampleSchema>;
/**
 * Schema for history query parameters
 */
export declare const HistoryQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodNumber>;
    to: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    deviceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    deviceId?: string | undefined;
    from?: number | undefined;
    to?: number | undefined;
}, {
    deviceId?: string | undefined;
    from?: number | undefined;
    to?: number | undefined;
    limit?: number | undefined;
}>;
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;
/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiErrorBody;
    timestamp: number;
}
/**
 * API error structure in responses
 */
export interface ApiErrorBody {
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
export interface WSConnectionAckEvent extends WSEvent<{
    message: string;
}> {
    type: 'CONNECTION_ACK';
}
export interface WSErrorEvent extends WSEvent<{
    code: string;
    message: string;
}> {
    type: 'ERROR';
}
//# sourceMappingURL=api.types.d.ts.map