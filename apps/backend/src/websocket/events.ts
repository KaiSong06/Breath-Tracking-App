import type { 
  ProcessedBreathingSample, 
  Alert,
  WSEvent,
  WSEventType 
} from '../types';

/**
 * Create a WebSocket event
 */
export function createWSEvent<T>(type: WSEventType, payload: T): WSEvent<T> {
  return {
    type,
    payload,
    timestamp: Date.now(),
  };
}

/**
 * Create a processed sample event
 */
export function createProcessedSampleEvent(
  sample: ProcessedBreathingSample
): WSEvent<ProcessedBreathingSample> {
  return createWSEvent('PROCESSED_SAMPLE', sample);
}

/**
 * Create an alert event
 */
export function createAlertEvent(alert: Alert): WSEvent<Alert> {
  return createWSEvent('ALERT', alert);
}

/**
 * Create a connection acknowledgment event
 */
export function createConnectionAckEvent(): WSEvent<{ message: string }> {
  return createWSEvent('CONNECTION_ACK', { 
    message: 'Connected to breathing monitor WebSocket' 
  });
}

/**
 * Create an error event
 */
export function createErrorEvent(
  code: string, 
  message: string
): WSEvent<{ code: string; message: string }> {
  return createWSEvent('ERROR', { code, message });
}

