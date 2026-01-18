import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from './db';
import type { ProcessedBreathingSample, ApneaRiskLevel } from '../types';

/**
 * Database row type for processed samples
 * Note: DB column is still named 'signal_quality' but we map it to breathDepth
 */
interface ProcessedSampleRow {
  id: string;
  device_id: string;
  timestamp: string;
  breathing_rate: string;
  breath_length_ms: number;
  variability: string;
  signal_quality: string;  // DB column name (stores breath depth value)
  apnea_risk: ApneaRiskLevel;
  created_at: Date;
}

/**
 * Convert database row to domain type
 */
function rowToSample(row: ProcessedSampleRow): ProcessedBreathingSample {
  return {
    id: row.id,
    deviceId: row.device_id,
    timestamp: parseInt(row.timestamp, 10),
    breathingRate: parseFloat(row.breathing_rate),
    breathLengthMs: row.breath_length_ms,
    variability: parseFloat(row.variability),
    breathDepth: parseFloat(row.signal_quality),  // Map DB column to breathDepth
    apneaRisk: row.apnea_risk,
  };
}

/**
 * Repository for processed breath sample storage
 */
export const processedSamplesRepo = {
  /**
   * Insert a new processed sample
   */
  async insert(sample: Omit<ProcessedBreathingSample, 'id'>): Promise<ProcessedBreathingSample> {
    const id = uuidv4();
    
    await query(
      `INSERT INTO processed_breath_samples 
       (id, device_id, timestamp, breathing_rate, breath_length_ms, variability, signal_quality, apnea_risk)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        sample.deviceId,
        sample.timestamp,
        sample.breathingRate,
        sample.breathLengthMs,
        sample.variability,
        sample.breathDepth,  // Stored in signal_quality column
        sample.apneaRisk,
      ]
    );
    
    return { id, ...sample };
  },

  /**
   * Get the latest processed sample for a device
   */
  async getLatest(deviceId?: string): Promise<ProcessedBreathingSample | null> {
    const whereClause = deviceId ? 'WHERE device_id = $1' : '';
    const params = deviceId ? [deviceId] : [];
    
    const row = await queryOne<ProcessedSampleRow>(
      `SELECT * FROM processed_breath_samples
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT 1`,
      params
    );
    
    return row ? rowToSample(row) : null;
  },

  /**
   * Get processed samples in a time range
   */
  async getHistory(options: {
    deviceId?: string;
    from?: number;
    to?: number;
    limit?: number;
  }): Promise<ProcessedBreathingSample[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
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

    const rows = await query<ProcessedSampleRow>(
      `SELECT * FROM processed_breath_samples
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $${paramIndex}`,
      params
    );
    
    return rows.map(rowToSample);
  },

  /**
   * Get sample count for pagination
   */
  async getCount(options: {
    deviceId?: string;
    from?: number;
    to?: number;
  }): Promise<number> {
    const conditions: string[] = [];
    const params: unknown[] = [];
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

    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM processed_breath_samples ${whereClause}`,
      params
    );
    
    return parseInt(result?.count || '0', 10);
  },

  /**
   * Delete old samples (data retention)
   */
  async deleteOlderThan(timestampThreshold: number): Promise<number> {
    const result = await query<{ count: string }>(
      `WITH deleted AS (
         DELETE FROM processed_breath_samples
         WHERE timestamp < $1
         RETURNING 1
       )
       SELECT COUNT(*) as count FROM deleted`,
      [timestampThreshold]
    );
    
    return parseInt(result[0]?.count || '0', 10);
  },
};

