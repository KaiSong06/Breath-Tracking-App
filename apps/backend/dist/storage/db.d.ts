import { Pool, PoolClient } from 'pg';
/**
 * Initialize database connection pool
 */
export declare function initDatabase(): Promise<void>;
/**
 * Get database pool
 */
export declare function getPool(): Pool;
/**
 * Execute a query
 */
export declare function query<T>(text: string, params?: unknown[]): Promise<T[]>;
/**
 * Execute a single-row query
 */
export declare function queryOne<T>(text: string, params?: unknown[]): Promise<T | null>;
/**
 * Execute a transaction
 */
export declare function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
/**
 * Check database health
 */
export declare function checkDatabaseHealth(): Promise<boolean>;
/**
 * Close database connection pool
 */
export declare function closeDatabase(): Promise<void>;
/**
 * Initialize database schema
 * In production, use proper migrations
 */
export declare function initSchema(): Promise<void>;
//# sourceMappingURL=db.d.ts.map