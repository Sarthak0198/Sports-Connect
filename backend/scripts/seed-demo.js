/**
 * Sports Connect - Comprehensive Demo Data Seeder for Supabase Cloud
 * Seeds demo accounts, complete coach profiles, athlete profiles,
 * organizations, and opportunities (including training camps).
 *
 * Usage:
 * node --env-file=.env scripts/seed-demo.js
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
  console.log('🌱 Starting comprehensive Sports Connect demonstration seed on Supabase Cloud...');

  // 1. Ensure reference sports exist
  const sportsCatalog = [
    { name: 'Cricket', slug: 'cricket', category: 'Team Sports', icon: 'Award', is_popular: true },
    { name: 'Football', slug: 'football', category: 'Team Sports', icon: 'Trophy', is_popular: true },
    { name: 'Badminton', slug: 'badminton', category: 'Racket Sports', icon: 'Zap', is_popular: true },
    { name: 'Kabaddi', slug: 'kabaddi', category: 'Contact Sports', icon: 'Flame', is_popular: true },
    { name: 'Athletics', slug: 'athletics', category: 'Individual Sports', icon: 'Timer', is_popular: true },
    { name: 'Field Hockey', slug: 'field-hockey', category: 'Team Sports', icon: 'Shield', is_popular: true },
    { name: 'Basketball', slug: 'basketball', category: 'Team Sports', icon: 'Activity', is_popular: true },
    { name: 'Volleyball', slug: 'volleyball', category: 'Team Sports', icon: 'Users', is_popular: true },
    { name: 'Tennis', slug: 'tennis', category: 'Racket Sports', icon: 'Target', is_popular: true },
    { name: 'Swimming', slug: 'swimming', category: 'Aquatics', icon: 'Droplets', is_popular: true },
    { name: 'Boxing', slug: 'boxing', category: 'Combat Sports', icon: 'Swords', is_popular: true }
  ];

  const { data: existingSports } = await supabase.from('sports').select('id, name, slug');
  const existingSlugs = new Set((existingSports || []).map(s => s.slug));
  const missingSports = sportsCatalog.filter(s => !existingSlugs.has(s.slug));
  if (missingSports.length > 0) {
    await supabase.from('sports').insert(missingSports);
  }
  const { data: allSports } = await supabase.from('sports').select('id, name, slug');
  const getSportId = (slugOrName) => {
    const s = allSports?.find(item =>
      item.slug.toLowerCase() === slugOrName.toLowerCase() ||
      item.name.toLowerCase().includes(slugOrName.toLowerCase())
    );
    return s?.id || 1;
  };
  console.log(`✓ Sports catalog verified (${allSports?.length || 0} active sports)`);

  // 2. Helper to ensure user in auth.users and public.profiles
  async function ensureUser({ email, role, full_name, city, state, bio, avatar_url, phone }) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: pw,
      email_confirm: true,
      user_metadata: { role, full_name }
    });

    let userId = data?.user?.id;
    if (error) {
      if (/already/i.test(error.message)) {
        const { data: users } = await supabase.auth.admin.listUsers({ perPage: 100 });
        userId = users.users.find(u => u.email.toLowerCase() === email.toLowerCase())?.id;
      } else {
        throw error;
      }
    }

    if (!userId) {
      throw new Error(`Could not obtain user ID for ${email}`);
    }

    // Upsert into public.profiles
    const { error: profErr } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name,
      role,
      city,
      state,
      bio,
      avatar_url,
      phone,
      visibility: 'public',
      is_verified: true
    }, { onConflict: 'id' });

    if (profErr) {
      console.warn(`Profile upsert note for ${email}:`, profErr.message);
    }

    return userId;
  }

  // 3. Create demo users across roles
  const athlete1Id = await ensureUser({
    email: 'athlete.demo@sportsconnect.in',
    role: 'athlete',
    full_name: 'Aarav Sharma (Demo Athlete)',
    city: 'Pune',
    state: 'Maharashtra',
    bio: 'Dedicated fast bowler and athletic all-rounder representing Maharashtra U-19 circuit. Passionate about peak sports fitness and high-pressure match performance.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+91 98230 11223'
  });

  const athlete2Id = await ensureUser({
    email: 'priya.sprinter@sportsconnect.in',
    role: 'athlete',
    full_name: 'Priya Deshmukh',
    city: 'Bengaluru',
    state: 'Karnataka',
    bio: 'State Gold Medalist in 100m and 200m sprint. Training for National Inter-State Senior Athletics Championships.',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    phone: '+91 98765 43210'
  });

  const coach1Id = await ensureUser({
    email: 'coach.vikram@sportsconnect.in',
    role: 'coach',
    full_name: 'Coach Vikram Rathore',
    city: 'Mumbai',
    state: 'Maharashtra',
    bio: 'BCCI Level-2 Certified High Performance Cricket Coach with 14+ years of domestic and academy coaching experience.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    phone: '+91 98200 44556'
  });

  const coach2Id = await ensureUser({
    email: 'coach.ananya@sportsconnect.in',
    role: 'coach',
    full_name: 'Coach Ananya Roy',
    city: 'Hyderabad',
    state: 'Telangana',
    bio: 'Former International Badminton Player and Certified Coach. Specialize in youth agility, stroke consistency, and tournament mental conditioning.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    phone: '+91 94400 12345'
  });

  const orgAdmin1Id = await ensureUser({
    email: 'academy.admin@sportsconnect.in',
    role: 'club',
    full_name: 'Satara District Kabaddi Association Admin',
    city: 'Satara',
    state: 'Maharashtra',
    bio: 'Premier grassroots Kabaddi and Athletics development foundation training district and state title contenders.',
    avatar_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
    phone: '+91 2162 234567'
  });

  const orgAdmin2Id = await ensureUser({
    email: 'organizer.delhi@sportsconnect.in',
    role: 'organizer',
    full_name: 'Delhi Youth Sports Foundation Admin',
    city: 'New Delhi',
    state: 'Delhi',
    bio: 'Official organizer of Inter-School, College, and All-India Youth Tournaments and National Summer Camps across Olympic disciplines.',
    avatar_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80',
    phone: '+91 11 2678 9900'
  });

  console.log('✓ All 6 demo user accounts and profiles verified in Auth & Profiles');

  // 4. Upsert Coach Profiles
  const coachProfiles = [
    {
      id: coach1Id,
      primary_sport_id: getSportId('cricket'),
      specializations: ['Fast Bowling Biomechanics', 'Match Tactics', 'Mental Conditioning'],
      qualifications: ['BCCI Level 2 Certified Coach', 'NSNIS Diploma in Sports Coaching', 'First Aid & CPR'],
      experience_years: 14,
      coaching_level: 'Professional / Elite',
      hourly_rate: 1500,
      philosophy: 'Disciplined technique creates fearless execution under match pressure.',
      is_accepting_trainees: true
    },
    {
      id: coach2Id,
      primary_sport_id: getSportId('badminton'),
      specializations: ['Footwork & Agility', 'Tactical Strokeplay', 'Tournament Readiness'],
      qualifications: ['BWF Level 1 Certified', 'Former National Sub-Junior Champion', 'Sports Nutrition Certified'],
      experience_years: 8,
      coaching_level: 'Intermediate & Advanced',
      hourly_rate: 1200,
      philosophy: 'Agility, mental poise, and relentless consistency define champions on the court.',
      is_accepting_trainees: true
    }
  ];

  for (const cp of coachProfiles) {
    const { error: cpErr } = await supabase.from('coach_profiles').upsert(cp, { onConflict: 'id' });
    if (cpErr) console.warn('Coach profile upsert note:', cpErr.message);
  }
  console.log('✓ Demo Coach Profiles populated with qualifications & specializations');

  // 5. Upsert Coaching Programs
  const coachingPrograms = [
    {
      coach_id: coach1Id,
      title: 'Elite Pace Bowling & Match Tactics Academy',
      description: 'Comprehensive 8-week fast bowling biomechanics, speed enhancement, line & length mastery, and match simulation program.',
      sport_id: getSportId('cricket'),
      duration_weeks: 8,
      price: 12000,
      location: 'Shivaji Park & Wankhede Net Complex, Mumbai',
      schedule: 'Tue, Thu, Sat (6:30 AM - 9:00 AM)',
      max_trainees: 15,
      status: 'active'
    },
    {
      coach_id: coach2Id,
      title: 'Youth Badminton High-Performance Clinic',
      description: 'Intensive 6-week court movement, deceptive strokecraft, and tournament mental conditioning clinic for competitive shuttlers.',
      sport_id: getSportId('badminton'),
      duration_weeks: 6,
      price: 8500,
      location: 'Gachibowli Badminton Arena, Hyderabad',
      schedule: 'Mon, Wed, Fri (4:30 PM - 7:00 PM)',
      max_trainees: 12,
      status: 'active'
    }
  ];

  for (const prog of coachingPrograms) {
    // Check if exists by coach_id and title
    const { data: existingProg } = await supabase
      .from('coaching_programs')
      .select('id')
      .eq('coach_id', prog.coach_id)
      .eq('title', prog.title)
      .maybeSingle();

    if (existingProg) {
      await supabase.from('coaching_programs').update(prog).eq('id', existingProg.id);
    } else {
      await supabase.from('coaching_programs').insert(prog);
    }
  }
  console.log('✓ Demo Coaching Programs populated');

  // 6. Upsert Athlete Profiles
  const athleteProfiles = [
    {
      id: athlete1Id,
      primary_sport_id: getSportId('cricket'),
      position: 'Right-Arm Fast Bowler / Middle Order',
      playing_level: 'state',
      current_team: 'Maharashtra Youth Cricket Club',
      height_cm: 182,
      weight_kg: 74,
      dominant_hand: 'right',
      date_of_birth: '2006-08-14',
      education: 'B.Sc Sports Science (1st Year)',
      highlight_video_url: 'https://youtube.com/watch?v=demo_aarav_bowling',
      bio_extended: 'Clocking regular speeds of 135+ kmph with sharp away swing. Trained at MCA Academy Pune.',
      profile_completion_pct: 92
    },
    {
      id: athlete2Id,
      primary_sport_id: getSportId('athletics'),
      position: '100m & 200m Sprinter',
      playing_level: 'national',
      current_team: 'Karnataka Sprint Syndicate',
      height_cm: 168,
      weight_kg: 56,
      dominant_hand: 'right',
      date_of_birth: '2005-04-22',
      education: 'St. Joseph College of Commerce',
      highlight_video_url: 'https://youtube.com/watch?v=demo_priya_sprint',
      bio_extended: 'Personal best: 11.78s in 100m. Winner of Junior National Athletics Meet.',
      profile_completion_pct: 88
    }
  ];

  for (const ap of athleteProfiles) {
    const { error: apErr } = await supabase.from('athlete_profiles').upsert(ap, { onConflict: 'id' });
    if (apErr) console.warn('Athlete profile upsert note:', apErr.message);
  }
  console.log('✓ Demo Athlete Profiles populated');

  // 7. Upsert Organizations
  async function ensureOrg({ name, slug, kind, description, city, state, created_by, logo_url }) {
    const { data: existing } = await supabase.from('organizations').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      await supabase.from('organizations').update({
        name,
        kind,
        description,
        city,
        state,
        created_by,
        logo_url,
        is_verified: true
      }).eq('id', existing.id);
      return existing.id;
    } else {
      const { data: created, error } = await supabase.from('organizations').insert({
        name,
        slug,
        kind,
        description,
        city,
        state,
        created_by,
        logo_url,
        is_verified: true
      }).select().single();
      if (error) throw error;
      return created.id;
    }
  }

  const org1Id = await ensureOrg({
    name: 'Satara District Kabaddi Association',
    slug: 'satara-kabaddi-academy',
    kind: 'academy',
    description: 'Nurturing grassroots champions with mat facilities, athletic conditioning, and tournament exposure across Western Maharashtra.',
    city: 'Satara',
    state: 'Maharashtra',
    created_by: orgAdmin1Id,
    logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80'
  });

  const org2Id = await ensureOrg({
    name: 'Delhi Youth Sports Foundation',
    slug: 'delhi-youth-sports',
    kind: 'organizer',
    description: 'Organizing competitive championships, scholarships, summer training camps, and scouting combines across North India.',
    city: 'New Delhi',
    state: 'Delhi',
    created_by: orgAdmin2Id,
    logo_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80'
  });

  console.log('✓ Demo Organizations verified');

  // 8. Upsert Opportunities (TRAINING CAMPS, TRIALS, TOURNAMENTS)
  const oppsData = [
    {
      title: 'All-India National Athletics Summer Camp & Scholarship Combine',
      category: 'camp', // TRAINING CAMP
      org_id: org2Id,
      created_by: orgAdmin2Id,
      sport_id: getSportId('athletics'),
      city: 'New Delhi',
      state: 'Delhi',
      venue_address: 'Thyagaraj Sports Complex, INA Colony, New Delhi',
      starts_on: '2026-12-01',
      ends_on: '2026-12-28',
      registration_deadline: '2026-11-20',
      eligibility: 'Boys and Girls aged 14 to 22 with prior participation in district or state school meets.',
      min_age: 14,
      max_age: 22,
      skill_level: 'All competitive levels',
      available_positions: 'Sprints (100m, 200m, 400m), Long Jump, High Jump',
      application_fee: '₹250 (Waived for BPL card holders)',
      instructions: 'Upload your latest competition timing certificate or school athletic record.',
      description: 'Four-week intensive sprint, hurdle, and jump conditioning camp hosted by national selectors. Top 5 performers receive full sports equipment grant and 1-year training scholarship.',
      status: 'published'
    },
    {
      title: 'Western Maharashtra Elite Kabaddi High-Altitude Training Camp',
      category: 'camp', // TRAINING CAMP
      org_id: org1Id,
      created_by: orgAdmin1Id,
      sport_id: getSportId('kabaddi'),
      city: 'Satara',
      state: 'Maharashtra',
      venue_address: 'Sahyadri Sports Complex, Satara',
      starts_on: '2026-11-25',
      ends_on: '2026-12-10',
      registration_deadline: '2026-11-15',
      eligibility: 'Ages 16-23. Must be active district or club level player.',
      min_age: 16,
      max_age: 23,
      skill_level: 'District / State',
      available_positions: 'Corners, Covers, Raiders',
      application_fee: 'Free',
      instructions: 'Bring standard mat shoes, gym kit, and physician fitness clearance.',
      description: 'Two-week rigorous stamina, mat agility, core endurance, and recovery conditioning camp supervised by Pro Kabaddi coaches.',
      status: 'published'
    },
    {
      title: 'High Performance Fast Bowlers Summer Conditioning Camp 2026',
      category: 'camp', // TRAINING CAMP
      org_id: org1Id,
      created_by: orgAdmin1Id,
      sport_id: getSportId('cricket'),
      city: 'Mumbai',
      state: 'Maharashtra',
      venue_address: 'Oval Maidan Grounds & MCA Gymkhana, Mumbai',
      starts_on: '2026-12-05',
      ends_on: '2026-12-24',
      registration_deadline: '2026-11-25',
      eligibility: 'Ages 16-21. Fast bowlers clocking 125+ kmph.',
      min_age: 16,
      max_age: 21,
      skill_level: 'Advanced / State',
      available_positions: 'Right-Arm Fast, Left-Arm Fast, All-Rounders',
      application_fee: '₹500',
      instructions: 'Cricket whites mandatory. Bring match spikes and running shoes.',
      description: 'Intensive pace bowling biomechanics, workload monitoring, reverse swing workshop, and fitness testing camp conducted by former Ranji pace spearheads.',
      status: 'published'
    },
    {
      title: 'Junior Grassroots Badminton Development Camp & Coaching',
      category: 'camp', // TRAINING CAMP
      org_id: org2Id,
      created_by: orgAdmin2Id,
      sport_id: getSportId('badminton'),
      city: 'Hyderabad',
      state: 'Telangana',
      venue_address: 'Gachibowli Indoor Stadium, Hyderabad',
      starts_on: '2026-12-15',
      ends_on: '2026-12-30',
      registration_deadline: '2026-11-30',
      eligibility: 'U-15 and U-17 boys and girls.',
      min_age: 12,
      max_age: 17,
      skill_level: 'Intermediate to Advanced',
      available_positions: 'Singles, Doubles',
      application_fee: 'Free',
      instructions: 'Bring personal non-marking court shoes and competition racquets.',
      description: 'Two-week high intensity agility, shuttle placement, deceptive drops, and tournament simulation camp under international coach supervision.',
      status: 'published'
    },
    {
      title: 'U-19 Maharashtra Kabaddi State Selection Trials 2026',
      category: 'trial', // SELECTION TRIAL
      org_id: org1Id,
      created_by: orgAdmin1Id,
      sport_id: getSportId('kabaddi'),
      city: 'Satara',
      state: 'Maharashtra',
      venue_address: 'Chhatrapati Shivaji Krida Sankul, Satara',
      starts_on: '2026-11-15',
      ends_on: '2026-11-18',
      registration_deadline: '2026-11-05',
      eligibility: 'Boys born between Jan 1, 2007 and Dec 31, 2010. Weight limit: Under 70 kg.',
      min_age: 15,
      max_age: 19,
      skill_level: 'District / State',
      available_positions: 'Corners, Covers, Raiders',
      application_fee: 'Free',
      instructions: 'Bring original Aadhaar card, age proof certificate, and standard sports kit.',
      description: 'Official open scouting and trial camp to select talented defenders and raiders for the upcoming Western India Junior State League. Lodging and dietary support provided to shortlisted athletes.',
      status: 'published'
    },
    {
      title: 'Mumbai Premier Junior Cricket Trophy — Scouting Championship',
      category: 'tournament', // TOURNAMENT
      org_id: org1Id,
      created_by: orgAdmin1Id,
      sport_id: getSportId('cricket'),
      city: 'Mumbai',
      state: 'Maharashtra',
      venue_address: 'Oval Maidan Grounds, Churchgate, Mumbai',
      starts_on: '2026-11-25',
      ends_on: '2026-12-05',
      registration_deadline: '2026-11-10',
      eligibility: 'Ages 16-21. Must have played division or collegiate cricket.',
      min_age: 16,
      max_age: 21,
      skill_level: 'Advanced',
      available_positions: 'Pace Bowlers, Spinners, Top-Order Batsmen',
      application_fee: 'Free',
      instructions: 'Report in whites at 7:30 AM sharp with personal kit.',
      description: 'Selection trials for Mumbai and Pune suburban fast bowlers and wicket-keepers for the 2026 Invitational Summer Cup.',
      status: 'published'
    },
    {
      title: 'Badminton Excellence Academy Admissions & Talent Search',
      category: 'academy_admission', // ACADEMY INTAKE
      org_id: org2Id,
      created_by: orgAdmin2Id,
      sport_id: getSportId('badminton'),
      city: 'Hyderabad',
      state: 'Telangana',
      venue_address: 'Gachibowli Indoor Stadium, Hyderabad',
      starts_on: '2026-12-10',
      ends_on: '2026-12-12',
      registration_deadline: '2026-11-25',
      eligibility: 'U-15 and U-17 boys and girls.',
      min_age: 12,
      max_age: 17,
      skill_level: 'Intermediate to Advanced',
      available_positions: 'Singles, Doubles',
      application_fee: 'Free',
      instructions: 'Submit state ranking details and tournament records.',
      description: 'Residential academy intake for promising sub-junior and junior singles players. World-class conditioning and international coach mentoring.',
      status: 'published'
    }
  ];

  for (const opp of oppsData) {
    const { data: existingOpp } = await supabase
      .from('opportunities')
      .select('id')
      .eq('title', opp.title)
      .maybeSingle();

    if (existingOpp) {
      await supabase.from('opportunities').update(opp).eq('id', existingOpp.id);
    } else {
      const { error: oppErr } = await supabase.from('opportunities').insert(opp);
      if (oppErr) console.warn(`Opportunity insert note (${opp.title}):`, oppErr.message);
    }
  }

  console.log(`✓ Demo Opportunities populated (${oppsData.length} records including 4 Training Camps)`);

  console.log('\n======================================================');
  console.log('🎉 DEMONSTRATION SEED COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Active Demo Accounts (password: ' + pw + '):');
  console.log(' - Athlete 1: athlete.demo@sportsconnect.in');
  console.log(' - Athlete 2: priya.sprinter@sportsconnect.in');
  console.log(' - Coach 1:   coach.vikram@sportsconnect.in (Cricket - Fast Bowling)');
  console.log(' - Coach 2:   coach.ananya@sportsconnect.in (Badminton - Agility & Tactics)');
  console.log(' - Academy:   academy.admin@sportsconnect.in (Satara District Kabaddi Association)');
  console.log(' - Organizer: organizer.delhi@sportsconnect.in (Delhi Youth Sports Foundation)');
  console.log('======================================================\n');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
