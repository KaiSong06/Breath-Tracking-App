import type { Alert, AlertSeverity, ProcessedBreathingSample, ApneaRiskLevel } from '../types';
/**
 * Service for evaluating alert conditions and creating alerts
 */
declare class AlertService {
    private lastAlertByDevice;
    private readonly alertCooldownMs;
    constructor();
    /**
     * Evaluate if an alert should be triggered based on processed sample
     */
    evaluate(sample: ProcessedBreathingSample): Alert | null;
    /**
     * Create alert if not in cooldown period
     */
    private createAlertIfNotCooldown;
    /**
     * Get severity for apnea risk level
     */
    getSeverityForRisk(risk: ApneaRiskLevel): AlertSeverity;
    /**
     * Clear alert cooldown for a device (for testing)
     */
    clearCooldown(deviceId: string): void;
}
export declare const alertService: AlertService;
export {};
//# sourceMappingURL=alert.service.d.ts.map