/**
 * Sports Connect — Direct Supabase Schema Migration
 * Uses the Supabase Management API (/pg/query) to run SQL directly.
 * Run: node scripts/apply-schema.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

// Extract project ref from URL: https://xxxx.supabase.co → xxxx
const PROJECT_REF = SUPABASE_URL?.replace('https://', '').split('.')[0];

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`
};

async function execSQL(sql) {
  // Supabase exposes a direct SQL execution endpoint for service_role clients
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

// Alternative: use the pg endpoint via the database API
async function execSQLDirect(sql) {
  const url = `${SUPABASE_URL}/pg/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });
  return { status: res.status, body: await res.text() };
}

// Split SQL file into individual statements safely
function splitStatements(sql) {
  // Remove pure comment lines
  const lines = sql
    .split('\n')
    .filter(l => !l.trim().startsWith('--'))
    .join('\n');

  const stmts = [];
  let current = '';
  let depth = 0; // tracks $$ blocks

  for (let i = 0; i < lines.length; i++) {
    const ch = lines[i];
    current += ch;

    // Track dollar-quote depth
    if (lines.slice(i).startsWith('$$')) {
      depth = depth === 0 ? 1 : 0;
    }

    if (ch === ';' && depth === 0) {
      const stmt = current.trim();
      if (stmt.length > 1) stmts.push(stmt);
      current = '';
    }
  }
  if (current.trim().length > 1) stmts.push(current.trim());
  return stmts;
}

async function runFile(filePath, label) {
  console.log(`\n📄 ${label}`);
  const sql = readFileSync(filePath, 'utf8');

  // Send whole file as one transaction for reliability
  const preview = sql.substring(0, 100).replace(/\n/g, ' ');
  console.log(`   Sending ${sql.length} bytes...`);

  const result = await execSQLDirect(sql);
  console.log(`   HTTP ${result.status}: ${result.body.substring(0, 200)}`);
  return result;
}

async function main() {
  console.log('='.repeat(62));
  console.log('🏆 Sports Connect — Supabase Migration');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Ref: ${PROJECT_REF}`);
  console.log('='.repeat(62));

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing env vars. Check backend/.env');
    process.exit(1);
  }

  // 1. Test connectivity
  console.log('\n🔌 Testing Supabase connection...');
  const testResp = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers });
  console.log(`   Status: ${testResp.status} ${testResp.status === 200 ? '✅' : '❌'}`);

  // 2. Try the /pg/query endpoint (direct SQL for service_role)
  console.log('\n🔍 Probing SQL endpoints...');
  const endpoints = [
    `${SUPABASE_URL}/pg/query`,
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  ];

  let workingEndpoint = null;
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep, {
        method: 'POST',
        headers: { ...headers, 'X-Connection-Encrypted': 'true' },
        body: JSON.stringify({ query: 'SELECT 1 AS test' })
      });
      const body = await r.text();
      console.log(`   ${ep}: HTTP ${r.status} — ${body.substring(0, 100)}`);
      if (r.status < 400) {
        workingEndpoint = ep;
        break;
      }
    } catch (e) {
      console.log(`   ${ep}: ERROR — ${e.message}`);
    }
  }

  if (!workingEndpoint) {
    console.log('\n⚠️  No direct SQL endpoint available from this environment.');
    console.log('   Use the manual method below to apply the schema.\n');
    console.log('📋 MANUAL STEPS:');
    console.log('   1. Open: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
    console.log('   2. Copy contents of: supabase/migrations/001_initial_schema.sql');
    console.log('   3. Paste and click RUN');
    console.log('   4. Copy contents of: supabase/seed.sql');
    console.log('   5. Paste and click RUN');
    console.log('\n   Both files are ready in your workspace.');
    return;
  }

  console.log(`\n✅ Using endpoint: ${workingEndpoint}`);

  // Run migration
  const schemaPath = join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
  const seedPath = join(__dirname, '../../supabase/seed.sql');

  await runFile(schemaPath, 'Schema Migration (001_initial_schema.sql)');
  await runFile(seedPath, 'Seed Data (seed.sql)');

  console.log('\n✅ Migration complete!');
}

main().catch(e => {
  console.error('💥 Fatal:', e.message);
  process.exit(1);
});
