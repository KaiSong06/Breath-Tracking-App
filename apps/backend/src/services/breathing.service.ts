import type { 
  RawBreathSample, 
  ProcessedBreathingSample, 
  Alert 
} from '../types';
import { rawSamplesRepo, processedSamplesRepo } from '../storage';
import { processingPipeline } from '../processing';
import { alertService } from './alert.service';
import { wsServer } from '../websocket/server';
import { logger } from '../utils/logger';

/**
 * Main service for breathing data processing
 */
class BreathingService {
  /**
   * Process a new raw breath sample
   * This is the main entry point for incoming device data
   */
  async processRawSample(sample: RawBreathSample): Promise<{
    processed: ProcessedBreathingSample | null;
    alert: Alert | null;
  }> {
    logger.debug('Processing raw sample', { 
      deviceId: sample.deviceId, 
      timestamp: sample.timestamp,
      rawValue: sample.rawValue 
    });

    // 1. Store raw sample
    await rawSamplesRepo.insert(sample);

    // 2. Run through processing pipeline
    const result = processingPipeline.process(sample);

    // 3. Create processed sample
    const processedSample: Omit<ProcessedBreathingSample, 'id'> = {
      deviceId: sample.deviceId,
      timestamp: sample.timestamp,
      breathingRate: Math.round(result.metrics.breathingRate * 100) / 100,
      breathLengthMs: result.metrics.breathLengthMs,
      variability: Math.round(result.metrics.variability * 10000) / 10000,
      signalQuality: Math.round(result.metrics.signalQuality * 100) / 100,
      apneaRisk: result.apneaRisk,
    };

    // 4. Store processed sample
    const saved = await processedSamplesRepo.insert(processedSample);

    // 5. Evaluate alert conditions
    const alert = alertService.evaluate(saved);

    // 6. Emit WebSocket events
    wsServer.broadcastProcessedSample(saved);
    
    if (alert) {
      wsServer.broadcastAlert(alert);
    }

    return { processed: saved, alert };
  }

  /**
   * Get the latest processed sample
   */
  async getLatestSample(deviceId?: string): Promise<ProcessedBreathingSample | null> {
    return processedSamplesRepo.getLatest(deviceId);
  }

  /**
   * Get historical processed samples
   */
  async getHistory(options: {
    deviceId?: string;
    from?: number;
    to?: number;
    limit?: number;
  }): Promise<{ samples: ProcessedBreathingSample[]; total: number }> {
    const [samples, total] = await Promise.all([
      processedSamplesRepo.getHistory(options),
      processedSamplesRepo.getCount(options),
    ]);

    return { samples, total };
  }

  /**
   * Get raw samples for a device (for debugging/analysis)
   */
  async getRawSamples(
    deviceId: string, 
    limit: number = 100
  ): Promise<RawBreathSample[]> {
    return rawSamplesRepo.getRecent(deviceId, limit);
  }
}

export const breathingService = new BreathingService();

