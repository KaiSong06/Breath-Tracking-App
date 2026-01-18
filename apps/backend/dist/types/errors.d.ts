/**
 * Custom error classes for the API
 */
/**
 * Base API error class
 */
export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: Record<string, unknown>;
    constructor(message: string, statusCode: number, code: string, details?: Record<string, unknown>);
}
/**
 * 400 Bad Request - Invalid input
 */
export declare class ValidationError extends ApiError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * 401 Unauthorized - Missing or invalid authentication
 */
export declare class AuthenticationError extends ApiError {
    constructor(message?: string);
}
/**
 * 403 Forbidden - Valid auth but insufficient permissions
 */
export declare class AuthorizationError extends ApiError {
    constructor(message?: string);
}
/**
 * 404 Not Found - Resource doesn't exist
 */
export declare class NotFoundError extends ApiError {
    constructor(resource?: string);
}
/**
 * 409 Conflict - Resource already exists or state conflict
 */
export declare class ConflictError extends ApiError {
    constructor(message: string);
}
/**
 * 500 Internal Server Error - Unexpected server error
 */
export declare class InternalError extends ApiError {
    constructor(message?: string);
}
/**
 * 503 Service Unavailable - Database or external service down
 */
export declare class ServiceUnavailableError extends ApiError {
    constructor(service?: string);
}
//# sourceMappingURL=errors.d.ts.map