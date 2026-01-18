"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processingPipeline = exports.ProcessingPipeline = void 0;
const config_1 = require("../config");
const peak_detector_1 = require("./peak-detector");
const metrics_calculator_1 = require("./metrics-calculator");
const logger_1 = require("../utils/logger");
/**
 * Signal processing pipeline
 * Orchestrates the conversion of raw potentiometer values to breathing metrics
 */
class ProcessingPipeline {
    peakDetector;
    metricsCalculator;
    deviceStates;
    constructor() {
        this.peakDetector = new peak_detector_1.PeakDetector();
        this.metricsCalculator = new metrics_calculator_1.MetricsCalculator();
        this.deviceStates = new Map();
    }
    /**
     * Process a new raw sample
     */
    process(sample) {
        // Get or create device state
        let state = this.deviceStates.get(sample.deviceId);
        if (!state) {
            state = this.createInitialState(sample.deviceId);
            this.deviceStates.set(sample.deviceId, state);
        }
        // Add sample to buffer
        state.sampleBuffer.push(sample);
        // Trim buffer to max size
        while (state.sampleBuffer.length > config_1.config.processing.sampleBufferSize) {
            state.sampleBuffer.shift();
        }
        // Need minimum samples to process
        if (state.sampleBuffer.length < 10) {
            return this.createEmptyResult(state);
        }
        // Detect peaks in buffer
        const { peaks } = this.peakDetector.detect(state.sampleBuffer);
        // Calculate metrics
        const metrics = this.metricsCalculator.calculate(peaks, state.sampleBuffer, this.getTimeWindowSeconds(state.sampleBuffer));
        // Update last breath timestamp
        if (peaks.length > 0) {
            const latestPeak = peaks.reduce((a, b) => a.timestamp > b.timestamp ? a : b);
            state.lastBreathTimestamp = latestPeak.timestamp;
        }
        // Determine apnea risk
        const apneaRisk = this.evaluateApneaRisk(state, metrics);
        logger_1.logger.debug('Processing complete', {
            deviceId: sample.deviceId,
            peaksDetected: peaks.length,
            breathingRate: metrics.breathingRate,
            signalQuality: metrics.signalQuality,
            apneaRisk,
        });
        return {
            metrics,
            apneaRisk,
            lastBreathTimestamp: state.lastBreathTimestamp,
        };
    }
    /**
     * Evaluate apnea risk level
     */
    evaluateApneaRisk(state, metrics) {
        const now = Date.now() / 1000; // Current time in seconds
        // If signal quality is too low, can't reliably detect apnea
        if (metrics.signalQuality < config_1.config.processing.minSignalQuality) {
            return 'MEDIUM'; // Uncertain due to poor signal
        }
        // Check time since last breath
        if (state.lastBreathTimestamp) {
            const timeSinceLastBreath = (now - state.lastBreathTimestamp) * 1000; // ms
            if (timeSinceLastBreath > config_1.config.processing.apneaThresholdMs) {
                return 'HIGH';
            }
            if (timeSinceLastBreath > config_1.config.processing.apneaThresholdMs * 0.7) {
                return 'MEDIUM';
            }
        }
        // Check breathing rate
        if (metrics.breathingRate < config_1.config.processing.minBreathingRate) {
            return 'MEDIUM';
        }
        return 'LOW';
    }
    /**
     * Create initial state for a device
     */
    createInitialState(deviceId) {
        return {
            deviceId,
            sampleBuffer: [],
            lastBreathTimestamp: null,
            breathIntervals: [],
        };
    }
    /**
     * Create empty result when not enough data
     */
    createEmptyResult(state) {
        return {
            metrics: {
                breathingRate: 0,
                breathLengthMs: 0,
                variability: 0,
                signalQuality: 0,
            },
            apneaRisk: 'LOW',
            lastBreathTimestamp: state.lastBreathTimestamp,
        };
    }
    /**
     * Get time window in seconds from sample buffer
     */
    getTimeWindowSeconds(samples) {
        if (samples.length < 2)
            return 0;
        const sorted = [...samples].sort((a, b) => a.timestamp - b.timestamp);
        return sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
    }
    /**
     * Clear state for a device
     */
    clearDeviceState(deviceId) {
        this.deviceStates.delete(deviceId);
    }
    /**
     * Get current state for a device (for debugging)
     */
    getDeviceState(deviceId) {
        return this.deviceStates.get(deviceId);
    }
}
exports.ProcessingPipeline = ProcessingPipeline;
// Singleton instance
exports.processingPipeline = new ProcessingPipeline();
//# sourceMappingURL=pipeline.js.map