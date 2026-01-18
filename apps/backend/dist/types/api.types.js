"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryQuerySchema = exports.RawBreathSampleSchema = void 0;
const zod_1 = require("zod");
/**
 * API Request/Response types and validation schemas
 */
// ============ Request Schemas ============
/**
 * Schema for raw breath sample input
 */
exports.RawBreathSampleSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1).max(64),
    timestamp: zod_1.z.number().int().positive(),
    rawValue: zod_1.z.number().int().min(0).max(4095), // 12-bit ADC range
});
/**
 * Schema for history query parameters
 */
exports.HistoryQuerySchema = zod_1.z.object({
    from: zod_1.z.coerce.number().int().positive().optional(),
    to: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(1000).default(100),
    deviceId: zod_1.z.string().optional(),
});
//# sourceMappingURL=api.types.js.map