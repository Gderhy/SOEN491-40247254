/**
 * Base Model Interface
 * Common fields and types used across all database models
 */

/**
 * Base database entity with common timestamp fields
 */
export interface BaseEntity {
  id: string; // uuid primary key
  created_at: Date; // timestamptz not null default now()
  updated_at: Date; // timestamptz not null default now()
}

/**
 * Base creation payload (omits auto-generated fields)
 */
export interface BaseCreatePayload {
  // Excludes id, created_at, updated_at - these are auto-generated
}

/**
 * Base update payload (omits immutable fields)
 */
export interface BaseUpdatePayload {
  // Excludes id, created_at - these should not be updated
  // updated_at is handled automatically
}

/**
 * Pagination options for queries
 */
export interface PaginationOptions {
  page?: number; // default 1
  limit?: number; // default 20, max 100
  offset?: number; // calculated from page and limit
}

/**
 * Sort options for queries
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Base query options
 */
export interface QueryOptions {
  pagination?: PaginationOptions;
  sort?: SortOptions[];
}

/**
 * Database operation result
 */
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * Common database error types
 */
export enum DatabaseError {
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  CHECK_VIOLATION = 'CHECK_VIOLATION',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
