"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWSEvent = createWSEvent;
exports.createProcessedSampleEvent = createProcessedSampleEvent;
exports.createAlertEvent = createAlertEvent;
exports.createConnectionAckEvent = createConnectionAckEvent;
exports.createErrorEvent = createErrorEvent;
/**
 * Create a WebSocket event
 */
function createWSEvent(type, payload) {
    return {
        type,
        payload,
        timestamp: Date.now(),
    };
}
/**
 * Create a processed sample event
 */
function createProcessedSampleEvent(sample) {
    return createWSEvent('PROCESSED_SAMPLE', sample);
}
/**
 * Create an alert event
 */
function createAlertEvent(alert) {
    return createWSEvent('ALERT', alert);
}
/**
 * Create a connection acknowledgment event
 */
function createConnectionAckEvent() {
    return createWSEvent('CONNECTION_ACK', {
        message: 'Connected to breathing monitor WebSocket'
    });
}
/**
 * Create an error event
 */
function createErrorEvent(code, message) {
    return createWSEvent('ERROR', { code, message });
}
//# sourceMappingURL=events.js.map