"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
/**
 * Application configuration
 * All values have sensible defaults for development
 */
exports.config = {
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
        apneaThresholdMs: parseInt(process.env.APNEA_THRESHOLD_MS || '10000', 10),
        /** Minimum signal quality to consider readings valid (0-1) */
        minSignalQuality: parseFloat(process.env.MIN_SIGNAL_QUALITY || '0.3'),
        /** Number of samples to keep in rolling buffer */
        sampleBufferSize: parseInt(process.env.SAMPLE_BUFFER_SIZE || '50', 10),
        /** Minimum peak prominence to detect a breath */
        peakProminence: parseInt(process.env.PEAK_PROMINENCE || '100', 10),
        /** Minimum time between peaks (ms) - prevents double-counting */
        minPeakDistanceMs: parseInt(process.env.MIN_PEAK_DISTANCE_MS || '1500', 10),
        /** Maximum expected breathing rate (breaths/min) */
        maxBreathingRate: parseInt(process.env.MAX_BREATHING_RATE || '40', 10),
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
};
/**
 * Validate required configuration in production
 */
function validateConfig() {
    if (exports.config.nodeEnv === 'production') {
        if (exports.config.deviceApiKey === 'dev-api-key-change-in-production') {
            throw new Error('DEVICE_API_KEY must be set in production');
        }
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL must be set in production');
        }
    }
}
//# sourceMappingURL=index.js.map