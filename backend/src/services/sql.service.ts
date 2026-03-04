/**
 * sql.service.ts
 *
 * Provides low-level SQL execution against the Supabase Postgres database
 * using a direct pg connection (service-role / superadmin access).
 *
 * Intended for trusted server-side scripts only (e.g. migrations, run-sql).
 * Never import this service in user-facing API handlers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { Client, QueryResult } from 'pg';

// ── Types ──────────────────────────────────────────────────────────────────

export interface SqlFileResult {
  filePath: string;
  sql: string;
  results: QueryResult[];
}

export interface SqlServiceOptions {
  /** Postgres connection string. Defaults to process.env.SUPABASE_DB_URL */
  connectionString?: string;
  /** Disable SSL verification (required for Supabase pooler). Default: true */
  rejectUnauthorized?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Resolves a raw (possibly relative) path to an absolute path anchored at cwd.
 */
export function resolveFilePath(raw: string): string {
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

/**
 * Reads and validates a SQL file.
 * @throws if the file does not exist or is empty.
 */
export function readSqlFile(absolutePath: string): string {
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const sql = fs.readFileSync(absolutePath, 'utf8').trim();

  if (!sql) {
    throw new Error(`SQL file is empty: ${absolutePath}`);
  }

  return sql;
}

/**
 * Executes a raw SQL string against the configured Postgres database.
 *
 * @param sql            - The SQL to execute (may contain multiple statements).
 * @param options        - Connection options.
 * @returns              - Array of QueryResult objects (one per statement).
 */
export async function executeSql(
  sql: string,
  options: SqlServiceOptions = {}
): Promise<QueryResult[]> {
  const connectionString =
    options.connectionString ?? process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    throw new Error(
      'SUPABASE_DB_URL is not set.\n' +
        'Get it from: Supabase Dashboard → Project Settings → Database → URI\n' +
        'It looks like: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres'
    );
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: options.rejectUnauthorized ?? false },
  });

  try {
    await client.connect();
    const raw = await client.query(sql);
    // pg returns a single QueryResult for one statement, or an array for multiple
    return Array.isArray(raw) ? raw : [raw];
  } finally {
    await client.end();
  }
}

/**
 * Convenience wrapper: resolves, reads, and executes a SQL file end-to-end.
 *
 * @param rawFilePath - Absolute or cwd-relative path to the .sql file.
 * @param options     - Connection options forwarded to executeSql.
 * @returns           - Resolved file path, raw SQL, and query results.
 */
export async function runSqlFile(
  rawFilePath: string,
  options: SqlServiceOptions = {}
): Promise<SqlFileResult> {
  const filePath = resolveFilePath(rawFilePath);
  const sql = readSqlFile(filePath);
  const results = await executeSql(sql, options);
  return { filePath, sql, results };
}
