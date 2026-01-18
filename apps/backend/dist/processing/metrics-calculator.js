"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCalculator = void 0;
const config_1 = require("../config");
/**
 * Calculate breathing metrics from detected peaks
 */
class MetricsCalculator {
    /**
     * Calculate all breathing metrics
     */
    calculate(peaks, samples, timeWindowSeconds = 60) {
        const breathingRate = this.calculateBreathingRate(peaks, timeWindowSeconds);
        const breathLengthMs = this.calculateAverageBreathLength(peaks);
        const variability = this.calculateVariability(peaks);
        const signalQuality = this.calculateSignalQuality(samples, peaks);
        return {
            breathingRate,
            breathLengthMs,
            variability,
            signalQuality,
        };
    }
    /**
     * Calculate breathing rate (breaths per minute)
     */
    calculateBreathingRate(peaks, timeWindowSeconds) {
        if (peaks.length < 2) {
            return 0;
        }
        // Sort peaks by timestamp
        const sorted = [...peaks].sort((a, b) => a.timestamp - b.timestamp);
        // Get the time span of detected peaks
        const firstPeak = sorted[0];
        const lastPeak = sorted[sorted.length - 1];
        const timeSpanSeconds = lastPeak.timestamp - firstPeak.timestamp;
        if (timeSpanSeconds <= 0) {
            return 0;
        }
        // Calculate rate and scale to per-minute
        const peaksInWindow = sorted.length;
        const rate = (peaksInWindow - 1) / timeSpanSeconds * 60;
        // Clamp to reasonable range
        return Math.min(Math.max(rate, 0), config_1.config.processing.maxBreathingRate);
    }
    /**
     * Calculate average breath length (time between peaks) in milliseconds
     */
    calculateAverageBreathLength(peaks) {
        if (peaks.length < 2) {
            return 0;
        }
        const sorted = [...peaks].sort((a, b) => a.timestamp - b.timestamp);
        const intervals = [];
        for (let i = 1; i < sorted.length; i++) {
            const intervalMs = (sorted[i].timestamp - sorted[i - 1].timestamp) * 1000;
            intervals.push(intervalMs);
        }
        const sum = intervals.reduce((a, b) => a + b, 0);
        return Math.round(sum / intervals.length);
    }
    /**
     * Calculate variability (coefficient of variation of breath intervals)
     * 0 = perfectly regular, higher = more irregular
     */
    calculateVariability(peaks) {
        if (peaks.length < 3) {
            return 0;
        }
        const sorted = [...peaks].sort((a, b) => a.timestamp - b.timestamp);
        const intervals = [];
        for (let i = 1; i < sorted.length; i++) {
            const intervalMs = (sorted[i].timestamp - sorted[i - 1].timestamp) * 1000;
            intervals.push(intervalMs);
        }
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        if (mean === 0)
            return 0;
        const squaredDiffs = intervals.map(i => Math.pow(i - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        // Coefficient of variation (normalized)
        const cv = stdDev / mean;
        // Clamp to 0-1 range
        return Math.min(Math.max(cv, 0), 1);
    }
    /**
     * Calculate signal quality (0-1)
     * Based on:
     * - Signal amplitude consistency
     * - Noise level
     * - Peak regularity
     */
    calculateSignalQuality(samples, peaks) {
        if (samples.length < 10) {
            return 0;
        }
        const values = samples.map(s => s.rawValue);
        // 1. Amplitude score: Check if signal has sufficient range
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        const amplitudeScore = Math.min(range / 500, 1); // Expect at least 500 units of range
        // 2. Noise score: Check signal-to-noise ratio
        const noiseScore = this.calculateNoiseScore(values);
        // 3. Peak regularity score
        const regularityScore = peaks.length >= 2
            ? 1 - this.calculateVariability(peaks)
            : 0.5;
        // 4. Peak detection score: Did we find reasonable number of peaks?
        const expectedPeaksMin = (samples.length / 50) * 0.5; // Rough estimate
        const peakScore = peaks.length >= expectedPeaksMin ? 1 : peaks.length / expectedPeaksMin;
        // Weighted average
        const quality = (amplitudeScore * 0.3 +
            noiseScore * 0.3 +
            regularityScore * 0.2 +
            peakScore * 0.2);
        return Math.min(Math.max(quality, 0), 1);
    }
    /**
     * Calculate noise score (higher = less noise = better)
     */
    calculateNoiseScore(values) {
        if (values.length < 3)
            return 0;
        // Calculate differences between consecutive samples
        const diffs = [];
        for (let i = 1; i < values.length; i++) {
            diffs.push(Math.abs(values[i] - values[i - 1]));
        }
        // High-frequency changes indicate noise
        const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const range = Math.max(...values) - Math.min(...values);
        if (range === 0)
            return 0;
        // Normalized noise ratio (lower is better)
        const noiseRatio = avgDiff / range;
        // Convert to score (higher is better)
        return Math.max(0, 1 - noiseRatio * 5);
    }
}
exports.MetricsCalculator = MetricsCalculator;
//# sourceMappingURL=metrics-calculator.js.map