import type { ProcessedBreathingSample } from '../types';
/**
 * Repository for processed breath sample storage
 */
export declare const processedSamplesRepo: {
    /**
     * Insert a new processed sample
     */
    insert(sample: Omit<ProcessedBreathingSample, "id">): Promise<ProcessedBreathingSample>;
    /**
     * Get the latest processed sample for a device
     */
    getLatest(deviceId?: string): Promise<ProcessedBreathingSample | null>;
    /**
     * Get processed samples in a time range
     */
    getHistory(options: {
        deviceId?: string;
        from?: number;
        to?: number;
        limit?: number;
    }): Promise<ProcessedBreathingSample[]>;
    /**
     * Get sample count for pagination
     */
    getCount(options: {
        deviceId?: string;
        from?: number;
        to?: number;
    }): Promise<number>;
    /**
     * Delete old samples (data retention)
     */
    deleteOlderThan(timestampThreshold: number): Promise<number>;
};
//# sourceMappingURL=processed-samples.repo.d.ts.map