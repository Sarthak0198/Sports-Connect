/**
 * Sports Connect - Extended User Seeder
 * Adds additional realistic Athletes, Coaches, and Sports Clubs to live Supabase Cloud.
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

async function addUsers() {
  console.log('🚀 Adding new athletes, coaches, and academies to Supabase...');

  // Fetch sports mapping
  const { data: sports } = await supabase.from('sports').select('id, name, slug');
  const getSportId = (slugOrName) => {
    const s = sports?.find(item =>
      item.slug.toLowerCase() === slugOrName.toLowerCase() ||
      item.name.toLowerCase().includes(slugOrName.toLowerCase())
    );
    return s?.id || 1;
  };

  // Helper to ensure user
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

    if (!userId) throw new Error(`Could not find ID for ${email}`);

    await supabase.from('profiles').upsert({
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

    return userId;
  }

  // 1. New Athletes
  const athleteData = [
    {
      email: 'rohan.football@sportsconnect.in',
      role: 'athlete',
      full_name: 'Rohan Fernandes',
      city: 'Panaji',
      state: 'Goa',
      bio: 'Lethal left-footed forward and winger. Top scorer in Goa U-19 League 2025. Known for explosive burst speed and clinical finishing inside the box.',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      phone: '+91 98221 44556',
      profile: {
        primary_sport_id: getSportId('football'),
        position: 'Forward / Left Winger',
        playing_level: 'state',
        current_team: 'Goa Youth United U-19',
        height_cm: 178,
        weight_kg: 71,
        dominant_hand: 'left',
        date_of_birth: '2006-03-12',
        education: 'St. Xavier College Goa',
        highlight_video_url: 'https://youtube.com/watch?v=demo_rohan_goals',
        bio_extended: 'Clocking top sprint speed of 33.4 km/h with 18 goals in 22 competitive appearances.',
        profile_completion_pct: 95
      },
      achievements: [
        {
          title: 'Golden Boot - Top Scorer',
          competition_name: 'Goa State Youth Premier League',
          year: 2025,
          medal: 'gold',
          description: 'Scored 18 goals in 22 matches leading the team to championship finals.'
        }
      ],
      stats: [
        { metric_name: 'Goals Scored', metric_value: '18', metric_unit: 'goals', season_or_year: '2024-25' },
        { metric_name: 'Top Sprint Speed', metric_value: '33.4', metric_unit: 'km/h', season_or_year: '2025' }
      ]
    },
    {
      email: 'meera.swimming@sportsconnect.in',
      role: 'athlete',
      full_name: 'Meera Nair',
      city: 'Kochi',
      state: 'Kerala',
      bio: 'National Junior Medalist in 100m & 200m Freestyle. High aerobic threshold and consistent stroke mechanics targeting national team trials.',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      phone: '+91 94471 22334',
      profile: {
        primary_sport_id: getSportId('swimming'),
        position: 'Freestyle & Butterfly Specialist',
        playing_level: 'national',
        current_team: 'Kerala State Aquatics Academy',
        height_cm: 174,
        weight_kg: 62,
        dominant_hand: 'right',
        date_of_birth: '2005-09-18',
        education: 'St. Teresa College Ernakulam',
        highlight_video_url: 'https://youtube.com/watch?v=demo_meera_swim',
        bio_extended: 'Personal best 58.2s in 100m freestyle. National Aquatic Games finalist.',
        profile_completion_pct: 90
      },
      achievements: [
        {
          title: 'Bronze Medal - 100m Freestyle',
          competition_name: 'National Junior Aquatic Championship',
          year: 2025,
          medal: 'bronze',
          description: 'Clocked sub-59s finish in senior division heats.'
        }
      ],
      stats: [
        { metric_name: '100m Freestyle PB', metric_value: '58.2', metric_unit: 'seconds', season_or_year: '2025' }
      ]
    },
    {
      email: 'kavita.boxing@sportsconnect.in',
      role: 'athlete',
      full_name: 'Kavita Singh',
      city: 'Rohtak',
      state: 'Haryana',
      bio: 'Aggressive southpaw featherweight boxer (57kg). National Youth Silver Medalist known for relentless footwork and rapid counter-punching.',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      phone: '+91 98120 77889',
      profile: {
        primary_sport_id: getSportId('boxing'),
        position: 'Featherweight (57kg)',
        playing_level: 'national',
        current_team: 'Haryana Boxing Center of Excellence',
        height_cm: 166,
        weight_kg: 57,
        dominant_hand: 'left',
        date_of_birth: '2006-11-04',
        education: 'Maharshi Dayanand University',
        highlight_video_url: 'https://youtube.com/watch?v=demo_kavita_boxing',
        bio_extended: 'Record of 24 wins, 3 losses. Trained under national boxing coaches.',
        profile_completion_pct: 92
      },
      achievements: [
        {
          title: 'Silver Medal - Featherweight',
          competition_name: 'All-India Youth National Boxing Championship',
          year: 2025,
          medal: 'silver',
          description: 'Reached finals defeating top state seeds.'
        }
      ],
      stats: [
        { metric_name: 'Bout Record', metric_value: '24-3', metric_unit: 'W-L', season_or_year: 'Career' }
      ]
    },
    {
      email: 'arjun.basketball@sportsconnect.in',
      role: 'athlete',
      full_name: 'Arjun Reddy',
      city: 'Hyderabad',
      state: 'Telangana',
      bio: 'Dynamic point guard with high basketball IQ, pinpoint court vision, and deadly perimeter shooting. Captain of Telangana Youth Basketball Squad.',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      phone: '+91 98490 33445',
      profile: {
        primary_sport_id: getSportId('basketball'),
        position: 'Point Guard',
        playing_level: 'state',
        current_team: 'Hyderabad Cagers Club',
        height_cm: 188,
        weight_kg: 79,
        dominant_hand: 'right',
        date_of_birth: '2005-07-29',
        education: 'Osmania University',
        highlight_video_url: 'https://youtube.com/watch?v=demo_arjun_highlights',
        bio_extended: 'Averaging 21.4 PPG and 7.2 APG in State Championship.',
        profile_completion_pct: 88
      },
      achievements: [
        {
          title: 'State Championship Most Valuable Player (MVP)',
          competition_name: 'Telangana State Junior Basketball League',
          year: 2025,
          medal: 'winner',
          description: 'Led Hyderabad team to an undefeated 10-0 tournament run.'
        }
      ],
      stats: [
        { metric_name: 'Points Per Game', metric_value: '21.4', metric_unit: 'PPG', season_or_year: '2025' },
        { metric_name: 'Assists Per Game', metric_value: '7.2', metric_unit: 'APG', season_or_year: '2025' }
      ]
    }
  ];

  for (const a of athleteData) {
    const userId = await ensureUser({
      email: a.email,
      role: a.role,
      full_name: a.full_name,
      city: a.city,
      state: a.state,
      bio: a.bio,
      avatar_url: a.avatar_url,
      phone: a.phone
    });

    // Upsert athlete profile
    await supabase.from('athlete_profiles').upsert({
      id: userId,
      ...a.profile
    }, { onConflict: 'id' });

    // Achievements
    for (const ach of a.achievements) {
      await supabase.from('athlete_achievements').upsert({
        athlete_id: userId,
        sport_id: a.profile.primary_sport_id,
        ...ach
      });
    }

    // Stats
    for (const st of a.stats) {
      await supabase.from('athlete_statistics').upsert({
        athlete_id: userId,
        sport_id: a.profile.primary_sport_id,
        ...st
      });
    }

    console.log(`✓ Added Athlete: ${a.full_name} (${a.city})`);
  }

  // 2. New Coaches
  const coachData = [
    {
      email: 'coach.marcus@sportsconnect.in',
      role: 'coach',
      full_name: 'Coach Marcus Silva',
      city: 'Bengaluru',
      state: 'Karnataka',
      bio: 'AFC "A" Licensed Football Coach with 12+ years developing young Indian talent into I-League and ISL squad members.',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      phone: '+91 98450 99887',
      coachProfile: {
        primary_sport_id: getSportId('football'),
        specializations: ['Positional Play & Tactics', 'Striker Finishing', 'Pressing & Transition Drills'],
        qualifications: ['AFC "A" License', 'AIFF Youth Elite Coach', 'UEFA Grassroots Diploma'],
        experience_years: 12,
        coaching_level: 'Professional / Elite',
        hourly_rate: 2000,
        philosophy: 'High-intensity tactical awareness paired with fearless technical expression.',
        is_accepting_trainees: true
      },
      program: {
        title: 'Elite Youth Football Striker & Tactical Mastery Program',
        description: '8-week specialized attacking clinic focusing on movement off the ball, clinical finishing inside the 18-yard box, and high-speed match transitions.',
        sport_id: getSportId('football'),
        duration_weeks: 8,
        price: 14000,
        location: 'Bengaluru Football Stadium, Ashok Nagar, Bengaluru',
        schedule: 'Tue, Thu, Sat (5:00 PM - 7:30 PM)',
        max_trainees: 16,
        status: 'active'
      }
    },
    {
      email: 'coach.deepali@sportsconnect.in',
      role: 'coach',
      full_name: 'Coach Deepali Sen',
      city: 'Kolkata',
      state: 'West Bengal',
      bio: 'Former Asian Games Swimmer and FINA Certified Master Coach. Specialist in aerobic stroke mechanics and race day pacing.',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      phone: '+91 98300 11445',
      coachProfile: {
        primary_sport_id: getSportId('swimming'),
        specializations: ['Freestyle Biomechanics', 'Underwater Dolphin Kicks', 'Turn & Tumble Technique'],
        qualifications: ['FINA Level 2 Certified', 'NIS Gold Medalist in Aquatics', 'Former National Record Holder'],
        experience_years: 11,
        coaching_level: 'National / Advanced',
        hourly_rate: 1400,
        philosophy: 'Water dynamics reward relaxed efficiency over brute force. Precision creates velocity.',
        is_accepting_trainees: true
      },
      program: {
        title: 'Competitive Swimming Stroke & Race Prep Clinic',
        description: '6-week intensive video analysis, underwater cadence optimization, and race pacing clinic for state and national aspirants.',
        sport_id: getSportId('swimming'),
        duration_weeks: 6,
        price: 9500,
        location: 'Subhas Sarobar Swimming Complex, Salt Lake, Kolkata',
        schedule: 'Mon, Wed, Fri (6:00 AM - 8:30 AM)',
        max_trainees: 10,
        status: 'active'
      }
    },
    {
      email: 'coach.gurmeet@sportsconnect.in',
      role: 'coach',
      full_name: 'Coach Gurmeet Singh',
      city: 'Sonipat',
      state: 'Haryana',
      bio: 'Senior Wrestling Coach and Physical Conditioning Mentor. Trained multiple Commonwealth & National Games champions in freestyle wrestling.',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      phone: '+91 98130 55667',
      coachProfile: {
        primary_sport_id: getSportId('boxing'), // combat sports / wrestling
        specializations: ['Mat Agility & Takedowns', 'Explosive Core Conditioning', 'Weight Cut & Match Recovery'],
        qualifications: ['NIS Certified Senior Wrestling Coach', 'Former Asian Championship Medalist'],
        experience_years: 16,
        coaching_level: 'Elite / National',
        hourly_rate: 1800,
        philosophy: 'Unbreakable mental endurance and relentless discipline create champions on the mat.',
        is_accepting_trainees: true
      },
      program: {
        title: 'Wrestling & Combat Power Conditioning Clinic',
        description: 'Comprehensive 8-week mat work, explosive takedown mastery, core stability, and tactical counter-grappling training.',
        sport_id: getSportId('boxing'),
        duration_weeks: 8,
        price: 11000,
        location: 'Chhotu Ram Wrestling Stadium, Sonipat, Haryana',
        schedule: 'Mon, Wed, Fri, Sat (6:00 AM - 8:30 AM)',
        max_trainees: 18,
        status: 'active'
      }
    }
  ];

  for (const c of coachData) {
    const userId = await ensureUser({
      email: c.email,
      role: c.role,
      full_name: c.full_name,
      city: c.city,
      state: c.state,
      bio: c.bio,
      avatar_url: c.avatar_url,
      phone: c.phone
    });

    // Coach profile
    await supabase.from('coach_profiles').upsert({
      id: userId,
      ...c.coachProfile
    }, { onConflict: 'id' });

    // Coaching program
    const { data: existingProg } = await supabase
      .from('coaching_programs')
      .select('id')
      .eq('coach_id', userId)
      .eq('title', c.program.title)
      .maybeSingle();

    if (existingProg) {
      await supabase.from('coaching_programs').update(c.program).eq('id', existingProg.id);
    } else {
      await supabase.from('coaching_programs').insert({
        coach_id: userId,
        ...c.program
      });
    }

    console.log(`✓ Added Coach: ${c.full_name} (${c.coachProfile.coaching_level})`);
  }

  // 3. New Sports Clubs / Academies
  const clubData = [
    {
      email: 'admin@bengalurufootball.in',
      role: 'club',
      full_name: 'Bengaluru Youth Football Foundation',
      city: 'Bengaluru',
      state: 'Karnataka',
      bio: 'Leading youth football academy affiliated with state associations, producing elite collegiate and professional footballers.',
      avatar_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
      phone: '+91 80 2554 1122',
      org: {
        name: 'Bengaluru Youth Football Foundation',
        slug: 'bengaluru-youth-football',
        kind: 'academy',
        description: 'Elite European-standard turf facilities, UEFA-certified coaches, and year-round residential academy training.',
        logo_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
        city: 'Bengaluru',
        state: 'Karnataka',
        address: 'Kanteerava Stadium Precinct, Bengaluru 560001'
      }
    }
  ];

  for (const cl of clubData) {
    const userId = await ensureUser({
      email: cl.email,
      role: cl.role,
      full_name: cl.full_name,
      city: cl.city,
      state: cl.state,
      bio: cl.bio,
      avatar_url: cl.avatar_url,
      phone: cl.phone
    });

    const { data: existingOrg } = await supabase.from('organizations').select('id').eq('slug', cl.org.slug).maybeSingle();
    if (existingOrg) {
      await supabase.from('organizations').update({
        ...cl.org,
        created_by: userId,
        is_verified: true
      }).eq('id', existingOrg.id);
    } else {
      await supabase.from('organizations').insert({
        ...cl.org,
        created_by: userId,
        is_verified: true
      });
    }

    console.log(`✓ Added Organization: ${cl.org.name}`);
  }

  console.log('\n✅ Successfully seeded all new athletes, coaches, and sports clubs!');
}

addUsers().catch(err => {
  console.error('Failed to add users:', err);
  process.exit(1);
});
