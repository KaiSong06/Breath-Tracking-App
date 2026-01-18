import { config } from '../config';
import type { RawBreathSample } from '../types';
import type { Peak, BreathingMetrics } from './types';

/**
 * Calculate breathing metrics from detected peaks
 */
export class MetricsCalculator {
  /**
   * Calculate all breathing metrics
   */
  calculate(
    peaks: Peak[],
    samples: RawBreathSample[],
    timeWindowSeconds: number = 60
  ): BreathingMetrics {
    const breathingRate = this.calculateBreathingRate(peaks, timeWindowSeconds);
    const breathLengthMs = this.calculateAverageBreathLength(peaks);
    const variability = this.calculateVariability(peaks);
    const breathDepth = this.calculateBreathDepth(samples, peaks);

    return {
      breathingRate,
      breathLengthMs,
      variability,
      breathDepth,
    };
  }

  /**
   * Calculate breathing rate (breaths per minute)
   */
  private calculateBreathingRate(peaks: Peak[], timeWindowSeconds: number): number {
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
    return Math.min(
      Math.max(rate, 0),
      config.processing.maxBreathingRate
    );
  }

  /**
   * Calculate average breath length (time between peaks) in milliseconds
   */
  private calculateAverageBreathLength(peaks: Peak[]): number {
    if (peaks.length < 2) {
      return 0;
    }

    const sorted = [...peaks].sort((a, b) => a.timestamp - b.timestamp);
    const intervals: number[] = [];

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
  private calculateVariability(peaks: Peak[]): number {
    if (peaks.length < 3) {
      return 0;
    }

    const sorted = [...peaks].sort((a, b) => a.timestamp - b.timestamp);
    const intervals: number[] = [];

    for (let i = 1; i < sorted.length; i++) {
      const intervalMs = (sorted[i].timestamp - sorted[i - 1].timestamp) * 1000;
      intervals.push(intervalMs);
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    if (mean === 0) return 0;

    const squaredDiffs = intervals.map(i => Math.pow(i - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (normalized)
    const cv = stdDev / mean;
    
    // Clamp to 0-1 range
    return Math.min(Math.max(cv, 0), 1);
  }

  /**
   * Calculate breath depth (average peak-to-valley amplitude)
   * Returns the amplitude in ADC units (0-1023 range)
   * Higher values indicate deeper breaths
   */
  private calculateBreathDepth(samples: RawBreathSample[], peaks: Peak[]): number {
    if (samples.length < 10) {
      return 0;
    }

    const values = samples.map(s => s.rawValue);
    
    // Calculate overall range as a simple measure of breath depth
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    // If we have detected peaks, calculate average peak prominence for more accuracy
    if (peaks.length >= 2) {
      const avgProminence = peaks.reduce((sum, p) => sum + p.prominence, 0) / peaks.length;
      // Use the larger of range or 2x average prominence
      return Math.round(Math.max(range, avgProminence * 2));
    }

    return Math.round(range);
  }
}

