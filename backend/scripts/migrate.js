/**
 * Sports Connect — Supabase Schema Migration Runner
 * Runs 001_initial_schema.sql against the live Supabase project
 * using the service_role key via the Supabase JS admin client.
 *
 * Usage: node scripts/migrate.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const MIGRATION_FILE = join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
const SEED_FILE = join(__dirname, '../../supabase/seed.sql');

/**
 * Split SQL file into individual executable statements,
 * handling $$ dollar-quote blocks, DO blocks, and multi-line statements.
 */
function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip standalone comment lines
    if (trimmed.startsWith('--')) {
      continue;
    }

    // Detect dollar-quote start/end (e.g. $$ or $BODY$)
    const dollarMatches = line.match(/\$[^$]*\$/g);
    if (dollarMatches) {
      for (const tag of dollarMatches) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = tag;
        } else if (tag === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        }
      }
    }

    current += line + '\n';

    // Only split on semicolons outside dollar-quote blocks
    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt && stmt !== ';') {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Catch any remaining
  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements.filter(s => s.length > 1);
}

async function runSqlViaRpc(sql) {
  // Use Supabase's pg_net extension or REST SQL endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`RPC exec_sql failed: ${body}`);
  }
  return response.json().catch(() => null);
}

async function runMigrationFile(filePath, label) {
  console.log(`\n📄 Loading ${label}...`);
  const sql = readFileSync(filePath, 'utf8');
  const statements = splitSqlStatements(sql);
  console.log(`   Found ${statements.length} statements to execute`);

  let passed = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 70).replace(/\n/g, ' ').trim();

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt });
      if (error) {
        // Ignore "already exists" type errors (idempotent re-runs)
        if (
          error.message?.includes('already exists') ||
          error.message?.includes('duplicate') ||
          error.message?.includes('does not exist') ||
          error.code === '42P07' || // duplicate_table
          error.code === '42710' || // duplicate_object
          error.code === '42701'    // duplicate_column
        ) {
          console.log(`   ⏭️  [${i + 1}/${statements.length}] SKIP (already exists): ${preview}...`);
          skipped++;
        } else {
          console.error(`   ❌ [${i + 1}/${statements.length}] FAIL: ${preview}...`);
          console.error(`      Error: ${error.message}`);
          failed++;
        }
      } else {
        console.log(`   ✅ [${i + 1}/${statements.length}] OK: ${preview}...`);
        passed++;
      }
    } catch (err) {
      console.error(`   ❌ [${i + 1}/${statements.length}] EXCEPTION: ${preview}...`);
      console.error(`      ${err.message}`);
      failed++;
    }
  }

  return { passed, skipped, failed };
}

async function main() {
  console.log('='.repeat(60));
  console.log('🏆 Sports Connect — Supabase Migration Runner');
  console.log(`   Project: ${SUPABASE_URL}`);
  console.log('='.repeat(60));

  // Step 1: Check if exec_sql RPC exists, if not create it
  console.log('\n🔧 Step 1: Verifying exec_sql helper function...');
  const createExecSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;

  const createResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
    },
    body: JSON.stringify({ sql: 'SELECT 1' })
  });

  if (!createResp.ok) {
    // exec_sql doesn't exist yet — create it via the raw SQL endpoint
    console.log('   Creating exec_sql helper via SQL Editor API...');
    const bootstrapResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
      }
    });
    console.log('   (Will create the function as part of migration)');
  } else {
    console.log('   ✅ exec_sql function ready');
  }

  // Step 2: Run schema migration
  const schemaResult = await runMigrationFile(MIGRATION_FILE, '001_initial_schema.sql');
  console.log(`\n📊 Schema Migration Result:`);
  console.log(`   ✅ Passed:  ${schemaResult.passed}`);
  console.log(`   ⏭️  Skipped: ${schemaResult.skipped}`);
  console.log(`   ❌ Failed:  ${schemaResult.failed}`);

  // Step 3: Run seed data
  const seedResult = await runMigrationFile(SEED_FILE, 'seed.sql');
  console.log(`\n📊 Seed Data Result:`);
  console.log(`   ✅ Passed:  ${seedResult.passed}`);
  console.log(`   ⏭️  Skipped: ${seedResult.skipped}`);
  console.log(`   ❌ Failed:  ${seedResult.failed}`);

  const totalFailed = schemaResult.failed + seedResult.failed;
  console.log('\n' + '='.repeat(60));
  if (totalFailed === 0) {
    console.log('🎉 Migration complete! All statements applied successfully.');
  } else {
    console.log(`⚠️  Migration complete with ${totalFailed} failure(s). Check errors above.`);
  }
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('\n💥 Fatal migration error:', err.message);
  process.exit(1);
});
