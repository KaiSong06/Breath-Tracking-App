import type { RawBreathSample } from '../types';
import type { Peak, BreathingMetrics } from './types';
/**
 * Calculate breathing metrics from detected peaks
 */
export declare class MetricsCalculator {
    /**
     * Calculate all breathing metrics
     */
    calculate(peaks: Peak[], samples: RawBreathSample[], timeWindowSeconds?: number): BreathingMetrics;
    /**
     * Calculate breathing rate (breaths per minute)
     */
    private calculateBreathingRate;
    /**
     * Calculate average breath length (time between peaks) in milliseconds
     */
    private calculateAverageBreathLength;
    /**
     * Calculate variability (coefficient of variation of breath intervals)
     * 0 = perfectly regular, higher = more irregular
     */
    private calculateVariability;
    /**
     * Calculate signal quality (0-1)
     * Based on:
     * - Signal amplitude consistency
     * - Noise level
     * - Peak regularity
     */
    private calculateSignalQuality;
    /**
     * Calculate noise score (higher = less noise = better)
     */
    private calculateNoiseScore;
}
//# sourceMappingURL=metrics-calculator.d.ts.map