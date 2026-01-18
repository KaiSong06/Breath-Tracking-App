"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processedSamplesRepo = void 0;
const uuid_1 = require("uuid");
const db_1 = require("./db");
/**
 * Convert database row to domain type
 */
function rowToSample(row) {
    return {
        id: row.id,
        deviceId: row.device_id,
        timestamp: parseInt(row.timestamp, 10),
        breathingRate: parseFloat(row.breathing_rate),
        breathLengthMs: row.breath_length_ms,
        variability: parseFloat(row.variability),
        signalQuality: parseFloat(row.signal_quality),
        apneaRisk: row.apnea_risk,
    };
}
/**
 * Repository for processed breath sample storage
 */
exports.processedSamplesRepo = {
    /**
     * Insert a new processed sample
     */
    async insert(sample) {
        const id = (0, uuid_1.v4)();
        await (0, db_1.query)(`INSERT INTO processed_breath_samples 
       (id, device_id, timestamp, breathing_rate, breath_length_ms, variability, signal_quality, apnea_risk)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            id,
            sample.deviceId,
            sample.timestamp,
            sample.breathingRate,
            sample.breathLengthMs,
            sample.variability,
            sample.signalQuality,
            sample.apneaRisk,
        ]);
        return { id, ...sample };
    },
    /**
     * Get the latest processed sample for a device
     */
    async getLatest(deviceId) {
        const whereClause = deviceId ? 'WHERE device_id = $1' : '';
        const params = deviceId ? [deviceId] : [];
        const row = await (0, db_1.queryOne)(`SELECT * FROM processed_breath_samples
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT 1`, params);
        return row ? rowToSample(row) : null;
    },
    /**
     * Get processed samples in a time range
     */
    async getHistory(options) {
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (options.deviceId) {
            conditions.push(`device_id = $${paramIndex++}`);
            params.push(options.deviceId);
        }
        if (options.from) {
            conditions.push(`timestamp >= $${paramIndex++}`);
            params.push(options.from);
        }
        if (options.to) {
            conditions.push(`timestamp <= $${paramIndex++}`);
            params.push(options.to);
        }
        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';
        const limit = options.limit || 100;
        params.push(limit);
        const rows = await (0, db_1.query)(`SELECT * FROM processed_breath_samples
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $${paramIndex}`, params);
        return rows.map(rowToSample);
    },
    /**
     * Get sample count for pagination
     */
    async getCount(options) {
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (options.deviceId) {
            conditions.push(`device_id = $${paramIndex++}`);
            params.push(options.deviceId);
        }
        if (options.from) {
            conditions.push(`timestamp >= $${paramIndex++}`);
            params.push(options.from);
        }
        if (options.to) {
            conditions.push(`timestamp <= $${paramIndex++}`);
            params.push(options.to);
        }
        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';
        const result = await (0, db_1.queryOne)(`SELECT COUNT(*) as count FROM processed_breath_samples ${whereClause}`, params);
        return parseInt(result?.count || '0', 10);
    },
    /**
     * Delete old samples (data retention)
     */
    async deleteOlderThan(timestampThreshold) {
        const result = await (0, db_1.query)(`WITH deleted AS (
         DELETE FROM processed_breath_samples
         WHERE timestamp < $1
         RETURNING 1
       )
       SELECT COUNT(*) as count FROM deleted`, [timestampThreshold]);
        return parseInt(result[0]?.count || '0', 10);
    },
};
//# sourceMappingURL=processed-samples.repo.js.map