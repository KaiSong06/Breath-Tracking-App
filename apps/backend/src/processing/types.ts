import type { RawBreathSample, ApneaRiskLevel } from '../types';

/**
 * Processing pipeline types
 */

/**
 * Result of peak detection
 */
export interface PeakDetectionResult {
  peaks: Peak[];
  valleys: Peak[];
}

/**
 * A detected peak or valley in the signal
 */
export interface Peak {
  index: number;
  timestamp: number;
  value: number;
  prominence: number;
}

/**
 * Breath interval between peaks
 */
export interface BreathInterval {
  startTimestamp: number;
  endTimestamp: number;
  durationMs: number;
}

/**
 * Calculated breathing metrics
 */
export interface BreathingMetrics {
  breathingRate: number;      // breaths per minute
  breathLengthMs: number;     // average breath length
  variability: number;        // coefficient of variation
  breathDepth: number;        // average peak-to-valley amplitude (ADC units, 0-1023)
}

/**
 * Processing state for a device
 */
export interface ProcessingState {
  deviceId: string;
  sampleBuffer: RawBreathSample[];
  lastBreathTimestamp: number | null;
  breathIntervals: number[];
}

/**
 * Full processing result
 */
export interface ProcessingResult {
  metrics: BreathingMetrics;
  apneaRisk: ApneaRiskLevel;
  lastBreathTimestamp: number | null;
}

