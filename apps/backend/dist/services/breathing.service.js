"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.breathingService = void 0;
const storage_1 = require("../storage");
const processing_1 = require("../processing");
const alert_service_1 = require("./alert.service");
const server_1 = require("../websocket/server");
const logger_1 = require("../utils/logger");
/**
 * Main service for breathing data processing
 */
class BreathingService {
    /**
     * Process a new raw breath sample
     * This is the main entry point for incoming device data
     */
    async processRawSample(sample) {
        logger_1.logger.debug('Processing raw sample', {
            deviceId: sample.deviceId,
            timestamp: sample.timestamp,
            rawValue: sample.rawValue
        });
        // 1. Store raw sample
        await storage_1.rawSamplesRepo.insert(sample);
        // 2. Run through processing pipeline
        const result = processing_1.processingPipeline.process(sample);
        // 3. Create processed sample
        const processedSample = {
            deviceId: sample.deviceId,
            timestamp: sample.timestamp,
            breathingRate: Math.round(result.metrics.breathingRate * 100) / 100,
            breathLengthMs: result.metrics.breathLengthMs,
            variability: Math.round(result.metrics.variability * 10000) / 10000,
            signalQuality: Math.round(result.metrics.signalQuality * 100) / 100,
            apneaRisk: result.apneaRisk,
        };
        // 4. Store processed sample
        const saved = await storage_1.processedSamplesRepo.insert(processedSample);
        // 5. Evaluate alert conditions
        const alert = alert_service_1.alertService.evaluate(saved);
        // 6. Emit WebSocket events
        server_1.wsServer.broadcastProcessedSample(saved);
        if (alert) {
            server_1.wsServer.broadcastAlert(alert);
        }
        return { processed: saved, alert };
    }
    /**
     * Get the latest processed sample
     */
    async getLatestSample(deviceId) {
        return storage_1.processedSamplesRepo.getLatest(deviceId);
    }
    /**
     * Get historical processed samples
     */
    async getHistory(options) {
        const [samples, total] = await Promise.all([
            storage_1.processedSamplesRepo.getHistory(options),
            storage_1.processedSamplesRepo.getCount(options),
        ]);
        return { samples, total };
    }
    /**
     * Get raw samples for a device (for debugging/analysis)
     */
    async getRawSamples(deviceId, limit = 100) {
        return storage_1.rawSamplesRepo.getRecent(deviceId, limit);
    }
}
exports.breathingService = new BreathingService();
//# sourceMappingURL=breathing.service.js.map