import type { RawBreathSample, ProcessedBreathingSample, Alert } from '../types';
/**
 * Main service for breathing data processing
 */
declare class BreathingService {
    /**
     * Process a new raw breath sample
     * This is the main entry point for incoming device data
     */
    processRawSample(sample: RawBreathSample): Promise<{
        processed: ProcessedBreathingSample | null;
        alert: Alert | null;
    }>;
    /**
     * Get the latest processed sample
     */
    getLatestSample(deviceId?: string): Promise<ProcessedBreathingSample | null>;
    /**
     * Get historical processed samples
     */
    getHistory(options: {
        deviceId?: string;
        from?: number;
        to?: number;
        limit?: number;
    }): Promise<{
        samples: ProcessedBreathingSample[];
        total: number;
    }>;
    /**
     * Get raw samples for a device (for debugging/analysis)
     */
    getRawSamples(deviceId: string, limit?: number): Promise<RawBreathSample[]>;
}
export declare const breathingService: BreathingService;
export {};
//# sourceMappingURL=breathing.service.d.ts.map