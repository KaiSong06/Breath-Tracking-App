import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * PostgreSQL connection pool
 */
let pool: Pool | null = null;

/**
 * Initialize database connection pool
 */
export async function initDatabase(): Promise<void> {
  pool = new Pool({
    connectionString: config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }

  // Handle pool errors
  pool.on('error', (err) => {
    logger.error('Unexpected database pool error', { error: err });
  });
}

/**
 * Get database pool
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

/**
 * Execute a query
 */
export async function query<T>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    
    return result.rows as T[];
  } catch (error) {
    logger.error('Query failed', { text, error });
    throw error;
  }
}

/**
 * Execute a single-row query
 */
export async function queryOne<T>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Close database connection pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection closed');
  }
}

/**
 * Initialize database schema
 * In production, use proper migrations
 */
export async function initSchema(): Promise<void> {
  const createTableQueries = [
    `
    CREATE TABLE IF NOT EXISTS raw_breath_samples (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_id VARCHAR(64) NOT NULL,
      timestamp BIGINT NOT NULL,
      raw_value INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS processed_breath_samples (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_id VARCHAR(64) NOT NULL,
      timestamp BIGINT NOT NULL,
      breathing_rate DECIMAL(5,2) NOT NULL,
      breath_length_ms INTEGER NOT NULL,
      variability DECIMAL(5,4) NOT NULL,
      signal_quality DECIMAL(3,2) NOT NULL,
      apnea_risk VARCHAR(10) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
    `,
    `
    CREATE INDEX IF NOT EXISTS idx_raw_device_timestamp 
      ON raw_breath_samples(device_id, timestamp DESC)
    `,
    `
    CREATE INDEX IF NOT EXISTS idx_processed_device_timestamp 
      ON processed_breath_samples(device_id, timestamp DESC)
    `,
  ];

  for (const sql of createTableQueries) {
    await query(sql);
  }
  
  logger.info('Database schema initialized');
}

