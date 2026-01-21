import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 * All values have sensible defaults for development
 */
export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/breath_monitor',
  
  // Authentication
  deviceApiKey: process.env.DEVICE_API_KEY || 'dev-api-key-change-in-production',
  
  // Signal Processing
  processing: {
    /** Time without breath detection to trigger HIGH apnea risk (ms) */
    apneaThresholdMs: parseInt(process.env.APNEA_THRESHOLD_MS || '6000', 10),
    
    /** Minimum signal quality to consider readings valid (0-1) */
    minSignalQuality: parseFloat(process.env.MIN_SIGNAL_QUALITY || '0.3'),
    
    /** Number of samples to keep in rolling buffer */
    sampleBufferSize: parseInt(process.env.SAMPLE_BUFFER_SIZE || '40', 10),
    
    /** Minimum peak prominence to detect a breath (ADC units, higher = less sensitive) */
    peakProminence: parseInt(process.env.PEAK_PROMINENCE || '200', 10),
    
    /** Minimum time between peaks (ms) - 2000ms = max 30 breaths/min */
    minPeakDistanceMs: parseInt(process.env.MIN_PEAK_DISTANCE_MS || '2000', 10),
    
    /** Maximum expected breathing rate (breaths/min) - normal adult is 12-20 */
    maxBreathingRate: parseInt(process.env.MAX_BREATHING_RATE || '30', 10),
    
    /** Minimum expected breathing rate (breaths/min) */
    minBreathingRate: parseInt(process.env.MIN_BREATHING_RATE || '4', 10),
  },
  
  // API
  api: {
    /** API version prefix */
    version: 'v1',
    
    /** Maximum request body size */
    maxBodySize: '1mb',
    
    /** CORS origins (comma-separated) */
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  },
  
  // WebSocket
  websocket: {
    /** WebSocket path */
    path: '/ws/v1/breathing',
    
    /** Ping interval (ms) */
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '30000', 10),
  },
} as const;

/**
 * Validate required configuration in production
 */
export function validateConfig(): void {
  if (config.nodeEnv === 'production') {
    if (config.deviceApiKey === 'dev-api-key-change-in-production') {
      throw new Error('DEVICE_API_KEY must be set in production');
    }
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set in production');
    }
  }
}

export type Config = typeof config;

