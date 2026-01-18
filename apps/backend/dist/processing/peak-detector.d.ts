import type { RawBreathSample } from '../types';
import type { PeakDetectionResult } from './types';
/**
 * Simple peak detection algorithm for breathing signal
 *
 * Algorithm:
 * 1. Apply smoothing to reduce noise
 * 2. Find local maxima (peaks = breath in)
 * 3. Filter peaks by prominence and minimum distance
 *
 * TODO: Replace with more sophisticated algorithm (e.g., wavelet-based) for production
 */
export declare class PeakDetector {
    private readonly minProminence;
    private readonly minDistanceMs;
    constructor(minProminence?: number, minDistanceMs?: number);
    /**
     * Detect peaks in a buffer of samples
     */
    detect(samples: RawBreathSample[]): PeakDetectionResult;
    /**
     * Simple moving average smoothing
     */
    private smooth;
    /**
     * Find local maxima
     */
    private findLocalMaxima;
    /**
     * Find local minima
     */
    private findLocalMinima;
    /**
     * Calculate prominence and filter peaks
     */
    private filterByProminence;
    /**
     * Find minimum value before index
     */
    private findMinBefore;
    /**
     * Find minimum value after index
     */
    private findMinAfter;
    /**
     * Filter peaks by minimum distance
     */
    private filterByDistance;
}
//# sourceMappingURL=peak-detector.d.ts.map