import type { ProcessedBreathingSample, Alert, WSEvent, WSEventType } from '../types';
/**
 * Create a WebSocket event
 */
export declare function createWSEvent<T>(type: WSEventType, payload: T): WSEvent<T>;
/**
 * Create a processed sample event
 */
export declare function createProcessedSampleEvent(sample: ProcessedBreathingSample): WSEvent<ProcessedBreathingSample>;
/**
 * Create an alert event
 */
export declare function createAlertEvent(alert: Alert): WSEvent<Alert>;
/**
 * Create a connection acknowledgment event
 */
export declare function createConnectionAckEvent(): WSEvent<{
    message: string;
}>;
/**
 * Create an error event
 */
export declare function createErrorEvent(code: string, message: string): WSEvent<{
    code: string;
    message: string;
}>;
//# sourceMappingURL=events.d.ts.map