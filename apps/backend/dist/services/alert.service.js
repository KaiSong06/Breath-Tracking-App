"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertService = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
/**
 * Service for evaluating alert conditions and creating alerts
 */
class AlertService {
    lastAlertByDevice;
    alertCooldownMs = 30000; // 30 seconds between same alert type
    constructor() {
        this.lastAlertByDevice = new Map();
    }
    /**
     * Evaluate if an alert should be triggered based on processed sample
     */
    evaluate(sample) {
        // Check for high apnea risk
        if (sample.apneaRisk === 'HIGH') {
            return this.createAlertIfNotCooldown(sample.deviceId, 'APNEA_DETECTED', 'CRITICAL', 'Breathing has stopped - immediate attention required', { breathingRate: sample.breathingRate, signalQuality: sample.signalQuality });
        }
        // Check for low signal quality
        if (sample.signalQuality < 0.3) {
            return this.createAlertIfNotCooldown(sample.deviceId, 'LOW_SIGNAL_QUALITY', 'WARNING', 'Sensor signal quality is low - check sensor placement', { signalQuality: sample.signalQuality });
        }
        // Check for irregular breathing (high variability)
        if (sample.variability > 0.5 && sample.signalQuality > 0.5) {
            return this.createAlertIfNotCooldown(sample.deviceId, 'IRREGULAR_BREATHING', 'INFO', 'Irregular breathing pattern detected', { variability: sample.variability, breathingRate: sample.breathingRate });
        }
        return null;
    }
    /**
     * Create alert if not in cooldown period
     */
    createAlertIfNotCooldown(deviceId, type, severity, message, metadata) {
        const key = `${deviceId}:${type}`;
        const lastAlert = this.lastAlertByDevice.get(key);
        const now = Date.now();
        // Check cooldown
        if (lastAlert && (now - lastAlert.timestamp) < this.alertCooldownMs) {
            return null;
        }
        // Update last alert time
        this.lastAlertByDevice.set(key, { type, timestamp: now });
        const alert = {
            id: (0, uuid_1.v4)(),
            deviceId,
            timestamp: Math.floor(now / 1000),
            type,
            severity,
            message,
            metadata,
        };
        logger_1.logger.info('Alert triggered', {
            alertId: alert.id,
            type,
            severity,
            deviceId
        });
        return alert;
    }
    /**
     * Get severity for apnea risk level
     */
    getSeverityForRisk(risk) {
        switch (risk) {
            case 'HIGH':
                return 'CRITICAL';
            case 'MEDIUM':
                return 'WARNING';
            case 'LOW':
            default:
                return 'INFO';
        }
    }
    /**
     * Clear alert cooldown for a device (for testing)
     */
    clearCooldown(deviceId) {
        for (const key of this.lastAlertByDevice.keys()) {
            if (key.startsWith(deviceId)) {
                this.lastAlertByDevice.delete(key);
            }
        }
    }
}
exports.alertService = new AlertService();
//# sourceMappingURL=alert.service.js.map