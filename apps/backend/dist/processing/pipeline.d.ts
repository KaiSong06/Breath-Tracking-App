import type { RawBreathSample } from '../types';
import type { ProcessingState, ProcessingResult } from './types';
/**
 * Signal processing pipeline
 * Orchestrates the conversion of raw potentiometer values to breathing metrics
 */
export declare class ProcessingPipeline {
    private readonly peakDetector;
    private readonly metricsCalculator;
    private readonly deviceStates;
    constructor();
    /**
     * Process a new raw sample
     */
    process(sample: RawBreathSample): ProcessingResult;
    /**
     * Evaluate apnea risk level
     */
    private evaluateApneaRisk;
    /**
     * Create initial state for a device
     */
    private createInitialState;
    /**
     * Create empty result when not enough data
     */
    private createEmptyResult;
    /**
     * Get time window in seconds from sample buffer
     */
    private getTimeWindowSeconds;
    /**
     * Clear state for a device
     */
    clearDeviceState(deviceId: string): void;
    /**
     * Get current state for a device (for debugging)
     */
    getDeviceState(deviceId: string): ProcessingState | undefined;
}
export declare const processingPipeline: ProcessingPipeline;
//# sourceMappingURL=pipeline.d.ts.map