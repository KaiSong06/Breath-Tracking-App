"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeakDetector = void 0;
const config_1 = require("../config");
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
class PeakDetector {
    minProminence;
    minDistanceMs;
    constructor(minProminence = config_1.config.processing.peakProminence, minDistanceMs = config_1.config.processing.minPeakDistanceMs) {
        this.minProminence = minProminence;
        this.minDistanceMs = minDistanceMs;
    }
    /**
     * Detect peaks in a buffer of samples
     */
    detect(samples) {
        if (samples.length < 3) {
            return { peaks: [], valleys: [] };
        }
        // Sort by timestamp
        const sorted = [...samples].sort((a, b) => a.timestamp - b.timestamp);
        // Apply simple moving average smoothing
        const smoothed = this.smooth(sorted.map(s => s.rawValue), 3);
        // Find all local maxima and minima
        const rawPeaks = this.findLocalMaxima(smoothed, sorted);
        const rawValleys = this.findLocalMinima(smoothed, sorted);
        // Calculate prominence and filter
        const peaks = this.filterByProminence(rawPeaks, smoothed);
        const valleys = this.filterByProminence(rawValleys, smoothed);
        // Filter by minimum distance
        const filteredPeaks = this.filterByDistance(peaks);
        return { peaks: filteredPeaks, valleys };
    }
    /**
     * Simple moving average smoothing
     */
    smooth(values, windowSize) {
        const result = [];
        const halfWindow = Math.floor(windowSize / 2);
        for (let i = 0; i < values.length; i++) {
            let sum = 0;
            let count = 0;
            for (let j = Math.max(0, i - halfWindow); j <= Math.min(values.length - 1, i + halfWindow); j++) {
                sum += values[j];
                count++;
            }
            result.push(sum / count);
        }
        return result;
    }
    /**
     * Find local maxima
     */
    findLocalMaxima(values, samples) {
        const peaks = [];
        for (let i = 1; i < values.length - 1; i++) {
            if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
                peaks.push({
                    index: i,
                    timestamp: samples[i].timestamp,
                    value: values[i],
                    prominence: 0, // Calculated later
                });
            }
        }
        return peaks;
    }
    /**
     * Find local minima
     */
    findLocalMinima(values, samples) {
        const valleys = [];
        for (let i = 1; i < values.length - 1; i++) {
            if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
                valleys.push({
                    index: i,
                    timestamp: samples[i].timestamp,
                    value: values[i],
                    prominence: 0,
                });
            }
        }
        return valleys;
    }
    /**
     * Calculate prominence and filter peaks
     */
    filterByProminence(peaks, values) {
        return peaks
            .map(peak => {
            // Simple prominence: difference from average of surrounding minima
            const leftMin = this.findMinBefore(values, peak.index);
            const rightMin = this.findMinAfter(values, peak.index);
            const baseLevel = (leftMin + rightMin) / 2;
            const prominence = peak.value - baseLevel;
            return { ...peak, prominence };
        })
            .filter(peak => peak.prominence >= this.minProminence);
    }
    /**
     * Find minimum value before index
     */
    findMinBefore(values, index) {
        let min = values[index];
        for (let i = index - 1; i >= 0 && i >= index - 10; i--) {
            min = Math.min(min, values[i]);
        }
        return min;
    }
    /**
     * Find minimum value after index
     */
    findMinAfter(values, index) {
        let min = values[index];
        for (let i = index + 1; i < values.length && i <= index + 10; i++) {
            min = Math.min(min, values[i]);
        }
        return min;
    }
    /**
     * Filter peaks by minimum distance
     */
    filterByDistance(peaks) {
        if (peaks.length === 0)
            return [];
        const sorted = [...peaks].sort((a, b) => a.timestamp - b.timestamp);
        const filtered = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            const lastPeak = filtered[filtered.length - 1];
            const timeDiff = (sorted[i].timestamp - lastPeak.timestamp) * 1000; // Convert to ms
            if (timeDiff >= this.minDistanceMs) {
                filtered.push(sorted[i]);
            }
            else if (sorted[i].prominence > lastPeak.prominence) {
                // Replace with higher prominence peak
                filtered[filtered.length - 1] = sorted[i];
            }
        }
        return filtered;
    }
}
exports.PeakDetector = PeakDetector;
//# sourceMappingURL=peak-detector.js.map