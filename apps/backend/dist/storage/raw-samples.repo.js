"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawSamplesRepo = void 0;
const uuid_1 = require("uuid");
const db_1 = require("./db");
/**
 * Repository for raw breath sample storage
 */
exports.rawSamplesRepo = {
    /**
     * Insert a new raw sample
     */
    async insert(sample) {
        const id = (0, uuid_1.v4)();
        await (0, db_1.query)(`INSERT INTO raw_breath_samples (id, device_id, timestamp, raw_value)
       VALUES ($1, $2, $3, $4)`, [id, sample.deviceId, sample.timestamp, sample.rawValue]);
        return id;
    },
    /**
     * Get recent raw samples for a device
     */
    async getRecent(deviceId, limit = 50) {
        const rows = await (0, db_1.query)(`SELECT device_id, timestamp, raw_value
       FROM raw_breath_samples
       WHERE device_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`, [deviceId, limit]);
        return rows.map(row => ({
            deviceId: row.device_id,
            timestamp: parseInt(row.timestamp, 10),
            rawValue: row.raw_value,
        }));
    },
    /**
     * Get raw samples in a time range
     */
    async getByTimeRange(deviceId, fromTimestamp, toTimestamp) {
        const rows = await (0, db_1.query)(`SELECT device_id, timestamp, raw_value
       FROM raw_breath_samples
       WHERE device_id = $1 AND timestamp >= $2 AND timestamp <= $3
       ORDER BY timestamp ASC`, [deviceId, fromTimestamp, toTimestamp]);
        return rows.map(row => ({
            deviceId: row.device_id,
            timestamp: parseInt(row.timestamp, 10),
            rawValue: row.raw_value,
        }));
    },
    /**
     * Delete old samples (data retention)
     */
    async deleteOlderThan(timestampThreshold) {
        const result = await (0, db_1.query)(`WITH deleted AS (
         DELETE FROM raw_breath_samples
         WHERE timestamp < $1
         RETURNING 1
       )
       SELECT COUNT(*) as count FROM deleted`, [timestampThreshold]);
        return parseInt(result[0]?.count || '0', 10);
    },
};
//# sourceMappingURL=raw-samples.repo.js.map