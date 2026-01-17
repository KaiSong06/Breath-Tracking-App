import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from './db';
import type { RawBreathSample } from '../types';

/**
 * Database row type for raw samples
 */
interface RawSampleRow {
  id: string;
  device_id: string;
  timestamp: string;
  raw_value: number;
  created_at: Date;
}

/**
 * Repository for raw breath sample storage
 */
export const rawSamplesRepo = {
  /**
   * Insert a new raw sample
   */
  async insert(sample: RawBreathSample): Promise<string> {
    const id = uuidv4();
    
    await query(
      `INSERT INTO raw_breath_samples (id, device_id, timestamp, raw_value)
       VALUES ($1, $2, $3, $4)`,
      [id, sample.deviceId, sample.timestamp, sample.rawValue]
    );
    
    return id;
  },

  /**
   * Get recent raw samples for a device
   */
  async getRecent(deviceId: string, limit: number = 50): Promise<RawBreathSample[]> {
    const rows = await query<RawSampleRow>(
      `SELECT device_id, timestamp, raw_value
       FROM raw_breath_samples
       WHERE device_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [deviceId, limit]
    );
    
    return rows.map(row => ({
      deviceId: row.device_id,
      timestamp: parseInt(row.timestamp, 10),
      rawValue: row.raw_value,
    }));
  },

  /**
   * Get raw samples in a time range
   */
  async getByTimeRange(
    deviceId: string,
    fromTimestamp: number,
    toTimestamp: number
  ): Promise<RawBreathSample[]> {
    const rows = await query<RawSampleRow>(
      `SELECT device_id, timestamp, raw_value
       FROM raw_breath_samples
       WHERE device_id = $1 AND timestamp >= $2 AND timestamp <= $3
       ORDER BY timestamp ASC`,
      [deviceId, fromTimestamp, toTimestamp]
    );
    
    return rows.map(row => ({
      deviceId: row.device_id,
      timestamp: parseInt(row.timestamp, 10),
      rawValue: row.raw_value,
    }));
  },

  /**
   * Delete old samples (data retention)
   */
  async deleteOlderThan(timestampThreshold: number): Promise<number> {
    const result = await query<{ count: string }>(
      `WITH deleted AS (
         DELETE FROM raw_breath_samples
         WHERE timestamp < $1
         RETURNING 1
       )
       SELECT COUNT(*) as count FROM deleted`,
      [timestampThreshold]
    );
    
    return parseInt(result[0]?.count || '0', 10);
  },
};

