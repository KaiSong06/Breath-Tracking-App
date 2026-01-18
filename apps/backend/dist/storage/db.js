"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getPool = getPool;
exports.query = query;
exports.queryOne = queryOne;
exports.transaction = transaction;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.closeDatabase = closeDatabase;
exports.initSchema = initSchema;
const pg_1 = require("pg");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
/**
 * PostgreSQL connection pool
 */
let pool = null;
/**
 * Initialize database connection pool
 */
async function initDatabase() {
    pool = new pg_1.Pool({
        connectionString: config_1.config.databaseUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    // Test connection
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger_1.logger.info('Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('Database connection failed', { error });
        throw error;
    }
    // Handle pool errors
    pool.on('error', (err) => {
        logger_1.logger.error('Unexpected database pool error', { error: err });
    });
}
/**
 * Get database pool
 */
function getPool() {
    if (!pool) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return pool;
}
/**
 * Execute a query
 */
async function query(text, params) {
    const pool = getPool();
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger_1.logger.debug('Executed query', { text, duration, rows: result.rowCount });
        return result.rows;
    }
    catch (error) {
        logger_1.logger.error('Query failed', { text, error });
        throw error;
    }
}
/**
 * Execute a single-row query
 */
async function queryOne(text, params) {
    const rows = await query(text, params);
    return rows[0] || null;
}
/**
 * Execute a transaction
 */
async function transaction(callback) {
    const pool = getPool();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Check database health
 */
async function checkDatabaseHealth() {
    try {
        await query('SELECT 1');
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Close database connection pool
 */
async function closeDatabase() {
    if (pool) {
        await pool.end();
        pool = null;
        logger_1.logger.info('Database connection closed');
    }
}
/**
 * Initialize database schema
 * In production, use proper migrations
 */
async function initSchema() {
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
    logger_1.logger.info('Database schema initialized');
}
//# sourceMappingURL=db.js.map