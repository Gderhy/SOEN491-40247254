/**
 * run-sql.ts  —  Script controller
 *
 * Orchestrates CLI argument parsing, delegates all I/O and database work to
 * sql.service.ts, and formats the results for the terminal.
 *
 * Usage:
 *   npx tsx src/scripts/run-sql.ts <path-to-sql-file>
 *
 * Examples:
 *   npx tsx src/scripts/run-sql.ts src/database/migrations/001_create_assets_table.sql
 *   npx tsx src/scripts/run-sql.ts src/database/migrations/005_insert_sample_transactions.sql
 *
 * Required env vars (in backend/.env):
 *   SUPABASE_DB_URL  — postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *                      Find it in: Supabase Dashboard → Project Settings → Database → Connection string (URI)
 */

import 'dotenv/config';
import { QueryResult } from 'pg';
import { runSqlFile, SqlFileResult } from '../services/sql.service.js';

// ── Formatting helpers ─────────────────────────────────────────────────────

const PREVIEW_LIMIT = 800;

function printUsage(): never {
  console.error('Usage: npx tsx src/scripts/run-sql.ts <path-to-sql-file>');
  process.exit(1);
}

function printSqlPreview(sql: string): void {
  const preview =
    sql.length > PREVIEW_LIMIT
      ? sql.slice(0, PREVIEW_LIMIT) + '\n... (truncated)'
      : sql;

  console.log('─'.repeat(60));
  console.log(preview);
  console.log('─'.repeat(60) + '\n');
}

function printResults(results: QueryResult[]): void {
  for (const [i, r] of results.entries()) {
    const label = results.length > 1 ? `Statement ${i + 1}` : 'Result';

    if (r.command === 'SELECT' || (r.rows && r.rows.length > 0)) {
      console.log(`\n📊  ${label} — ${r.rowCount ?? r.rows.length} row(s) returned:`);
      console.table(r.rows);
    } else {
      console.log(
        `✅  ${label} — ${r.command} OK (${r.rowCount ?? 0} row(s) affected)`
      );
    }
  }
}

// ── Controller ─────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  // 1. Parse CLI args
  const [, , rawFilePath] = process.argv;
  if (!rawFilePath) {
    console.error('❌  No SQL file path provided.\n');
    printUsage();
  }

  // 2. Delegate to the SQL service
  let result: SqlFileResult;
  try {
    console.log('🔌  Connecting to database...');

    result = await runSqlFile(rawFilePath);

    console.log('✅  Connected.\n');
    console.log(`📄  File   : ${result.filePath}`);
    console.log(`📏  Size   : ${result.sql.length} characters\n`);

    console.log('▶️   Executing SQL...\n');
    printSqlPreview(result.sql);

    // 3. Display results
    printResults(result.results);

    console.log('\n✅  Script completed successfully.');
  } catch (err: any) {
    console.error('\n❌  run-sql failed:');
    console.error(`    ${err.message}`);
    if (err.detail)   console.error(`    Detail  : ${err.detail}`);
    if (err.hint)     console.error(`    Hint    : ${err.hint}`);
    if (err.position) console.error(`    Position: character ${err.position}`);
    process.exit(1);
  }
}

run();

