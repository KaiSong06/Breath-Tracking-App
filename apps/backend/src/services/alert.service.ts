import { v4 as uuidv4 } from 'uuid';
import type { 
  Alert, 
  AlertType, 
  AlertSeverity, 
  ProcessedBreathingSample,
  ApneaRiskLevel 
} from '../types';
import { logger } from '../utils/logger';

/**
 * Service for evaluating alert conditions and creating alerts
 */
class AlertService {
  private lastAlertByDevice: Map<string, { type: AlertType; timestamp: number }>;
  private readonly alertCooldownMs = 30000; // 30 seconds between same alert type

  constructor() {
    this.lastAlertByDevice = new Map();
  }

  /**
   * Evaluate if an alert should be triggered based on processed sample
   */
  evaluate(sample: ProcessedBreathingSample): Alert | null {
    // Check for high apnea risk
    if (sample.apneaRisk === 'HIGH') {
      return this.createAlertIfNotCooldown(
        sample.deviceId,
        'APNEA_DETECTED',
        'CRITICAL',
        'Breathing has stopped - immediate attention required',
        { breathingRate: sample.breathingRate, breathDepth: sample.breathDepth }
      );
    }

    // Check for very shallow breathing (low breath depth)
    // Less than 50 ADC units indicates very shallow breaths or sensor issue
    if (sample.breathDepth < 50 && sample.breathDepth > 0) {
      return this.createAlertIfNotCooldown(
        sample.deviceId,
        'LOW_SIGNAL_QUALITY',
        'WARNING',
        'Very shallow breathing detected - check sensor placement',
        { breathDepth: sample.breathDepth }
      );
    }

    // Check for irregular breathing (high variability)
    if (sample.variability > 0.5 && sample.breathDepth > 100) {
      return this.createAlertIfNotCooldown(
        sample.deviceId,
        'IRREGULAR_BREATHING',
        'INFO',
        'Irregular breathing pattern detected',
        { variability: sample.variability, breathingRate: sample.breathingRate }
      );
    }

    return null;
  }

  /**
   * Create alert if not in cooldown period
   */
  private createAlertIfNotCooldown(
    deviceId: string,
    type: AlertType,
    severity: AlertSeverity,
    message: string,
    metadata?: Record<string, unknown>
  ): Alert | null {
    const key = `${deviceId}:${type}`;
    const lastAlert = this.lastAlertByDevice.get(key);
    const now = Date.now();

    // Check cooldown
    if (lastAlert && (now - lastAlert.timestamp) < this.alertCooldownMs) {
      return null;
    }

    // Update last alert time
    this.lastAlertByDevice.set(key, { type, timestamp: now });

    const alert: Alert = {
      id: uuidv4(),
      deviceId,
      timestamp: Math.floor(now / 1000),
      type,
      severity,
      message,
      metadata,
    };

    logger.info('Alert triggered', { 
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
  getSeverityForRisk(risk: ApneaRiskLevel): AlertSeverity {
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
  clearCooldown(deviceId: string): void {
    for (const key of this.lastAlertByDevice.keys()) {
      if (key.startsWith(deviceId)) {
        this.lastAlertByDevice.delete(key);
      }
    }
  }
}

export const alertService = new AlertService();

