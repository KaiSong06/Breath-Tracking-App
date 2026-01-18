/**
 * Application configuration
 * All values have sensible defaults for development
 */
export declare const config: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly databaseUrl: string;
    readonly deviceApiKey: string;
    readonly processing: {
        /** Time without breath detection to trigger HIGH apnea risk (ms) */
        readonly apneaThresholdMs: number;
        /** Minimum signal quality to consider readings valid (0-1) */
        readonly minSignalQuality: number;
        /** Number of samples to keep in rolling buffer */
        readonly sampleBufferSize: number;
        /** Minimum peak prominence to detect a breath */
        readonly peakProminence: number;
        /** Minimum time between peaks (ms) - prevents double-counting */
        readonly minPeakDistanceMs: number;
        /** Maximum expected breathing rate (breaths/min) */
        readonly maxBreathingRate: number;
        /** Minimum expected breathing rate (breaths/min) */
        readonly minBreathingRate: number;
    };
    readonly api: {
        /** API version prefix */
        readonly version: "v1";
        /** Maximum request body size */
        readonly maxBodySize: "1mb";
        /** CORS origins (comma-separated) */
        readonly corsOrigins: string[];
    };
    readonly websocket: {
        /** WebSocket path */
        readonly path: "/ws/v1/breathing";
        /** Ping interval (ms) */
        readonly pingInterval: number;
    };
};
/**
 * Validate required configuration in production
 */
export declare function validateConfig(): void;
export type Config = typeof config;
//# sourceMappingURL=index.d.ts.map