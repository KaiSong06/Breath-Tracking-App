import { config } from '../config';
import type { RawBreathSample, ApneaRiskLevel } from '../types';
import type { ProcessingState, ProcessingResult } from './types';
import { PeakDetector } from './peak-detector';
import { MetricsCalculator } from './metrics-calculator';
import { logger } from '../utils/logger';

/**
 * Signal processing pipeline
 * Orchestrates the conversion of raw potentiometer values to breathing metrics
 */
export class ProcessingPipeline {
  private readonly peakDetector: PeakDetector;
  private readonly metricsCalculator: MetricsCalculator;
  private readonly deviceStates: Map<string, ProcessingState>;

  constructor() {
    this.peakDetector = new PeakDetector();
    this.metricsCalculator = new MetricsCalculator();
    this.deviceStates = new Map();
  }

  /**
   * Process a new raw sample
   */
  process(sample: RawBreathSample): ProcessingResult {
    // Get or create device state
    let state = this.deviceStates.get(sample.deviceId);
    if (!state) {
      state = this.createInitialState(sample.deviceId);
      this.deviceStates.set(sample.deviceId, state);
    }

    // Add sample to buffer
    state.sampleBuffer.push(sample);

    // Trim buffer to max size
    while (state.sampleBuffer.length > config.processing.sampleBufferSize) {
      state.sampleBuffer.shift();
    }

    // Need minimum samples to process
    if (state.sampleBuffer.length < 10) {
      return this.createEmptyResult(state);
    }

    // Detect peaks in buffer
    const { peaks } = this.peakDetector.detect(state.sampleBuffer);

    // Calculate metrics
    const metrics = this.metricsCalculator.calculate(
      peaks,
      state.sampleBuffer,
      this.getTimeWindowSeconds(state.sampleBuffer)
    );

    // Update last breath timestamp
    if (peaks.length > 0) {
      const latestPeak = peaks.reduce((a, b) => 
        a.timestamp > b.timestamp ? a : b
      );
      state.lastBreathTimestamp = latestPeak.timestamp;
    }

    // Determine apnea risk
    const apneaRisk = this.evaluateApneaRisk(state, metrics);

    logger.debug('Processing complete', {
      deviceId: sample.deviceId,
      peaksDetected: peaks.length,
      breathingRate: metrics.breathingRate,
      signalQuality: metrics.signalQuality,
      apneaRisk,
    });

    return {
      metrics,
      apneaRisk,
      lastBreathTimestamp: state.lastBreathTimestamp,
    };
  }

  /**
   * Evaluate apnea risk level
   */
  private evaluateApneaRisk(
    state: ProcessingState,
    metrics: { signalQuality: number; breathingRate: number }
  ): ApneaRiskLevel {
    const now = Date.now() / 1000; // Current time in seconds

    // If signal quality is too low, can't reliably detect apnea
    if (metrics.signalQuality < config.processing.minSignalQuality) {
      return 'MEDIUM'; // Uncertain due to poor signal
    }

    // Check time since last breath
    if (state.lastBreathTimestamp) {
      const timeSinceLastBreath = (now - state.lastBreathTimestamp) * 1000; // ms
      
      if (timeSinceLastBreath > config.processing.apneaThresholdMs) {
        return 'HIGH';
      }
      
      if (timeSinceLastBreath > config.processing.apneaThresholdMs * 0.7) {
        return 'MEDIUM';
      }
    }

    // Check breathing rate
    if (metrics.breathingRate < config.processing.minBreathingRate) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Create initial state for a device
   */
  private createInitialState(deviceId: string): ProcessingState {
    return {
      deviceId,
      sampleBuffer: [],
      lastBreathTimestamp: null,
      breathIntervals: [],
    };
  }

  /**
   * Create empty result when not enough data
   */
  private createEmptyResult(state: ProcessingState): ProcessingResult {
    return {
      metrics: {
        breathingRate: 0,
        breathLengthMs: 0,
        variability: 0,
        signalQuality: 0,
      },
      apneaRisk: 'LOW',
      lastBreathTimestamp: state.lastBreathTimestamp,
    };
  }

  /**
   * Get time window in seconds from sample buffer
   */
  private getTimeWindowSeconds(samples: RawBreathSample[]): number {
    if (samples.length < 2) return 0;
    const sorted = [...samples].sort((a, b) => a.timestamp - b.timestamp);
    return sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
  }

  /**
   * Clear state for a device
   */
  clearDeviceState(deviceId: string): void {
    this.deviceStates.delete(deviceId);
  }

  /**
   * Get current state for a device (for debugging)
   */
  getDeviceState(deviceId: string): ProcessingState | undefined {
    return this.deviceStates.get(deviceId);
  }
}

// Singleton instance
export const processingPipeline = new ProcessingPipeline();

