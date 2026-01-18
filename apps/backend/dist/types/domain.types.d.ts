/**
 * Core domain types for the breathing monitoring system
 */
/**
 * Raw breath sample received from Raspberry Pi
 * The device only sends potentiometer values - all processing happens server-side
 */
export interface RawBreathSample {
    deviceId: string;
    timestamp: number;
    rawValue: number;
}
/**
 * Processed breathing sample with calculated metrics
 */
export interface ProcessedBreathingSample {
    id: string;
    deviceId: string;
    timestamp: number;
    breathingRate: number;
    breathLengthMs: number;
    variability: number;
    signalQuality: number;
    apneaRisk: ApneaRiskLevel;
}
/**
 * Apnea risk levels
 */
export type ApneaRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
/**
 * Alert triggered by the system
 */
export interface Alert {
    id: string;
    deviceId: string;
    timestamp: number;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    metadata?: Record<string, unknown>;
}
export type AlertType = 'APNEA_DETECTED' | 'LOW_SIGNAL_QUALITY' | 'IRREGULAR_BREATHING';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
/**
 * Device information (for future expansion)
 */
export interface Device {
    id: string;
    apiKey: string;
    name: string;
    lastSeen: number;
    isActive: boolean;
}
/**
 * Internal processing state for a device
 */
export interface DeviceProcessingState {
    deviceId: string;
    sampleBuffer: RawBreathSample[];
    lastBreathTimestamp: number | null;
    breathIntervals: number[];
    lastProcessedSample: ProcessedBreathingSample | null;
}
//# sourceMappingURL=domain.types.d.ts.map