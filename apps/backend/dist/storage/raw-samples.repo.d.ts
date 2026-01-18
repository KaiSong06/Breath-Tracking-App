import type { RawBreathSample } from '../types';
/**
 * Repository for raw breath sample storage
 */
export declare const rawSamplesRepo: {
    /**
     * Insert a new raw sample
     */
    insert(sample: RawBreathSample): Promise<string>;
    /**
     * Get recent raw samples for a device
     */
    getRecent(deviceId: string, limit?: number): Promise<RawBreathSample[]>;
    /**
     * Get raw samples in a time range
     */
    getByTimeRange(deviceId: string, fromTimestamp: number, toTimestamp: number): Promise<RawBreathSample[]>;
    /**
     * Delete old samples (data retention)
     */
    deleteOlderThan(timestampThreshold: number): Promise<number>;
};
//# sourceMappingURL=raw-samples.repo.d.ts.map