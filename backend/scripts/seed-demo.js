/**
 * Sports Connect - Fictional Demo Data Seeder for Supabase Cloud
 * Run with:
 * SUPABASE_URL=... SUPABASE_SECRET_KEY=... DEMO_PASSWORD=... node backend/scripts/seed-demo.js
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const pw = process.env.DEMO_PASSWORD || 'SportsDemo2026!';

if (!url || !key) {
  console.error('Error: Please provide SUPABASE_URL and SUPABASE_SECRET_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function seed() {
  console.log('🌱 Starting Sports Connect demonstration seed on Supabase Cloud...');

  // 1. Create Demo Users in auth.users
  async function ensureUser(email, role, name, city, state) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: pw,
      email_confirm: true,
      user_metadata: { role, full_name: name }
    });

    let userId = data?.user?.id;
    if (error) {
      if (/already/i.test(error.message)) {
        const { data: users } = await supabase.auth.admin.listUsers();
        userId = users.users.find(u => u.email === email)?.id;
      } else {
        throw error;
      }
    }

    // Upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: name,
      role,
      city,
      state,
      bio: `Fictional demo ${role} profile for Sports Connect.`,
      visibility: 'public',
      is_verified: true
    });

    return userId;
  }

  const athleteId = await ensureUser('athlete.demo@sportsconnect.in', 'athlete', 'Aarav Sharma (Demo)', 'Pune', 'Maharashtra');
  const coachId = await ensureUser('coach.vikram@sportsconnect.in', 'coach', 'Coach Vikram Rathore (Demo)', 'Mumbai', 'Maharashtra');
  const orgAdminId = await ensureUser('academy.admin@sportsconnect.in', 'club', 'Satara Sports Admin (Demo)', 'Satara', 'Maharashtra');

  console.log('✓ Demo accounts verified in auth.users');

  // 2. Fetch Sports ID
  const { data: sports } = await supabase.from('sports').select('id, name');
  const getSportId = (name) => sports?.find(s => s.name.toLowerCase().includes(name.toLowerCase()))?.id || 1;

  // 3. Create Organization
  const { data: org, error: orgErr } = await supabase.from('organizations').upsert({
    name: 'Satara District Kabaddi Association (Demo)',
    slug: 'satara-kabaddi-demo',
    kind: 'academy',
    city: 'Satara',
    state: 'Maharashtra',
    created_by: orgAdminId,
    description: 'Fictional demo academy training district champions.'
  }).select().single();

  if (orgErr) console.warn('Org insert notice:', orgErr.message);

  // 4. Create Opportunities
  if (org?.id) {
    const opps = [
      {
        org_id: org.id,
        created_by: orgAdminId,
        title: 'U-19 Maharashtra Kabaddi Trials (Demo)',
        sport_id: getSportId('Kabaddi'),
        category: 'trial',
        city: 'Satara',
        state: 'Maharashtra',
        starts_on: '2026-11-20',
        registration_deadline: '2026-11-10',
        eligibility: 'Ages 15-19. Weight Under 70kg.',
        status: 'published',
        description: 'Open selection trial for district and state squads.'
      },
      {
        org_id: org.id,
        created_by: orgAdminId,
        title: 'All-India Athletics Sprint Combine (Demo)',
        sport_id: getSportId('Athletics'),
        category: 'camp',
        city: 'Pune',
        state: 'Maharashtra',
        starts_on: '2026-12-05',
        registration_deadline: '2026-11-25',
        eligibility: 'Ages 14-22. Open to all.',
        status: 'published',
        description: 'Elite speed conditioning camp and scholarship selection.'
      }
    ];

    const { error: oppsErr } = await supabase.from('opportunities').upsert(opps);
    if (oppsErr) console.warn('Opps insert notice:', oppsErr.message);
  }

  console.log('✅ Demonstration seed completed successfully!');
  console.log('You can now log in with the demo accounts using password:', pw);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
