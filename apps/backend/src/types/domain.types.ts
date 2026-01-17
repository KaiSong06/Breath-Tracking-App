/**
 * Core domain types for the breathing monitoring system
 */

/**
 * Raw breath sample received from Raspberry Pi
 * The device only sends potentiometer values - all processing happens server-side
 */
export interface RawBreathSample {
  deviceId: string;
  timestamp: number; // Unix seconds
  rawValue: number;  // Potentiometer value (0-1023 typical range)
}

/**
 * Processed breathing sample with calculated metrics
 */
export interface ProcessedBreathingSample {
  id: string;
  deviceId: string;
  timestamp: number;
  breathingRate: number;      // Breaths per minute
  breathLengthMs: number;     // Average breath length in milliseconds
  variability: number;        // Coefficient of variation (0-1)
  signalQuality: number;      // Signal quality score (0-1)
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

