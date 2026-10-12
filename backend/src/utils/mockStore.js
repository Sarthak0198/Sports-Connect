// In-memory mock data store simulating Supabase tables when live Supabase is not yet connected
export const mockSports = [
  { id: 1, name: 'Cricket', slug: 'cricket', category: 'Team Sports', icon: 'Award', is_popular: true },
  { id: 2, name: 'Football', slug: 'football', category: 'Team Sports', icon: 'Trophy', is_popular: true },
  { id: 3, name: 'Badminton', slug: 'badminton', category: 'Racket Sports', icon: 'Zap', is_popular: true },
  { id: 4, name: 'Kabaddi', slug: 'kabaddi', category: 'Contact Sports', icon: 'Flame', is_popular: true },
  { id: 5, name: 'Athletics (Track & Field)', slug: 'athletics', category: 'Individual Sports', icon: 'Timer', is_popular: true },
  { id: 6, name: 'Field Hockey', slug: 'field-hockey', category: 'Team Sports', icon: 'Shield', is_popular: true },
  { id: 7, name: 'Basketball', slug: 'basketball', category: 'Team Sports', icon: 'Activity', is_popular: true },
  { id: 8, name: 'Volleyball', slug: 'volleyball', category: 'Team Sports', icon: 'Users', is_popular: true },
  { id: 9, name: 'Tennis', slug: 'tennis', category: 'Racket Sports', icon: 'Target', is_popular: true },
  { id: 10, name: 'Table Tennis', slug: 'table-tennis', category: 'Racket Sports', icon: 'Compass', is_popular: false },
  { id: 11, name: 'Swimming', slug: 'swimming', category: 'Aquatics', icon: 'Droplets', is_popular: true },
  { id: 12, name: 'Boxing', slug: 'boxing', category: 'Combat Sports', icon: 'Swords', is_popular: true },
  { id: 13, name: 'Wrestling', slug: 'wrestling', category: 'Combat Sports', icon: 'Medal', is_popular: true },
  { id: 14, name: 'Shooting', slug: 'shooting', category: 'Precision Sports', icon: 'Crosshair', is_popular: false },
  { id: 15, name: 'Archery', slug: 'archery', category: 'Precision Sports', icon: 'Disc', is_popular: false },
  { id: 16, name: 'Chess', slug: 'chess', category: 'Mind Sports', icon: 'Brain', is_popular: false }
];

export const mockUsers = [
  {
    id: 'usr-athlete-1',
    email: 'athlete.demo@sportsconnect.in',
    full_name: 'Aarav Sharma',
    role: 'athlete',
    city: 'Pune',
    state: 'Maharashtra',
    bio: 'Dedicated fast bowler and all-rounder representing Maharashtra U-19 circuit. Passionate about peak athletic fitness and high-pressure match performance.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+91 98230 11223',
    visibility: 'public',
    is_verified: true,
    created_at: new Date('2025-01-10').toISOString()
  },
  {
    id: 'usr-athlete-2',
    email: 'priya.sprinter@sportsconnect.in',
    full_name: 'Priya Deshmukh',
    role: 'athlete',
    city: 'Bengaluru',
    state: 'Karnataka',
    bio: 'State Gold Medalist in 100m and 200m sprint. Training for National Inter-State Senior Championships.',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    phone: '+91 98765 43210',
    visibility: 'public',
    is_verified: true,
    created_at: new Date('2025-02-15').toISOString()
  },
  {
    id: 'usr-coach-1',
    email: 'coach.vikram@sportsconnect.in',
    full_name: 'Coach Vikram Rathore',
    role: 'coach',
    city: 'Mumbai',
    state: 'Maharashtra',
    bio: 'BCCI Level-2 Certified High Performance Cricket Coach with 14+ years of domestic and academy coaching experience.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    phone: '+91 98200 44556',
    visibility: 'public',
    is_verified: true,
    created_at: new Date('2024-11-01').toISOString()
  },
  {
    id: 'usr-coach-2',
    email: 'coach.ananya@sportsconnect.in',
    full_name: 'Ananya Roy',
    role: 'coach',
    city: 'Hyderabad',
    state: 'Telangana',
    bio: 'Former International Badminton Player and Certified Coach. Specialize in youth agility, stroke consistency, and match temperament.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    phone: '+91 94400 12345',
    visibility: 'public',
    is_verified: true,
    created_at: new Date('2024-12-05').toISOString()
  },
  {
    id: 'usr-org-1',
    email: 'satara.academy@sportsconnect.in',
    full_name: 'Satara District Kabaddi Association',
    role: 'club',
    city: 'Satara',
    state: 'Maharashtra',
    bio: 'Premier grassroots Kabaddi and Athletics development foundation training district and state title contenders.',
    avatar_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
    phone: '+91 2162 234567',
    visibility: 'public',
    is_verified: true,
    created_at: new Date('2024-09-01').toISOString()
  },
  {
    id: 'usr-org-2',
    email: 'organizer.delhi@sportsconnect.in',
    full_name: 'Delhi Youth Sports Foundation',
    role: 'organizer',
    city: 'New Delhi',
    state: 'Delhi',
    bio: 'Official organizer of Inter-School, College, and All-India Youth Tournaments across Olympic disciplines.',
    avatar_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80',
    phone: '+91 11 2678 9900',
    visibility: 'public',
    is_verified: true,
    created_at: new Date('2024-10-15').toISOString()
  }
];

export const mockAthleteProfiles = [
  {
    id: 'usr-athlete-1',
    primary_sport_id: 1, // Cricket
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
    id: 'usr-athlete-2',
    primary_sport_id: 5, // Athletics
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

export const mockCoachProfiles = [
  {
    id: 'usr-coach-1',
    primary_sport_id: 1, // Cricket
    specializations: ['Fast Bowling Biomechanics', 'Match Tactics', 'Mental Conditioning'],
    qualifications: ['BCCI Level 2 Certified Coach', 'NSNIS Diploma in Sports Coaching', 'First Aid & CPR'],
    experience_years: 14,
    coaching_level: 'Professional / Elite',
    hourly_rate: 1500,
    philosophy: 'Disciplined technique creates fearless execution under match pressure.',
    is_accepting_trainees: true
  },
  {
    id: 'usr-coach-2',
    primary_sport_id: 3, // Badminton
    specializations: ['Footwork & Agility', 'Tactical Strokeplay', 'Tournament Readiness'],
    qualifications: ['BWF Level 1 Certified', 'Former National Sub-Junior Champion'],
    experience_years: 8,
    coaching_level: 'Intermediate & Advanced',
    hourly_rate: 1200,
    philosophy: 'Agility, mental poise, and relentless consistency define champions on the court.',
    is_accepting_trainees: true
  }
];

export const mockOrganizations = [
  {
    id: 'org-satara-1',
    name: 'Satara District Kabaddi Association',
    slug: 'satara-kabaddi-academy',
    kind: 'academy',
    description: 'Nurturing grassroots champions with world-class mat facilities, athletic conditioning, and tournament exposure across Western Maharashtra.',
    logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
    website: 'https://satara-kabaddi.example.com',
    email: 'contact@satara-kabaddi.org',
    phone: '+91 2162 234567',
    city: 'Satara',
    state: 'Maharashtra',
    address: 'Shivaji Stadium Complex, Powai Naka, Satara 415001',
    is_verified: true,
    created_by: 'usr-org-1',
    created_at: new Date('2024-09-01').toISOString()
  },
  {
    id: 'org-delhi-1',
    name: 'Delhi Youth Sports Foundation',
    slug: 'delhi-youth-sports',
    kind: 'organizer',
    description: 'Organizing competitive championships, scholarships, and scouting combines across North India to empower under-resourced young athletes.',
    logo_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80',
    website: 'https://delhisports.example.org',
    email: 'info@delhisports.example.org',
    phone: '+91 11 2678 9900',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Jawaharlal Nehru Stadium Gate 4, New Delhi 110003',
    is_verified: true,
    created_by: 'usr-org-2',
    created_at: new Date('2024-10-15').toISOString()
  }
];

export const mockOpportunities = [
  {
    id: 'opp-1',
    org_id: 'org-satara-1',
    created_by: 'usr-org-1',
    title: 'U-19 Maharashtra Kabaddi State Trials 2026',
    description: 'Official open scouting and trial camp to select talented defenders and raiders for the upcoming Western India Junior State League. Lodging and dietary support provided to shortlisted athletes.',
    sport_id: 4, // Kabaddi
    category: 'trial',
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
    instructions: 'Bring original Aadhaar card, age proof certificate, and standard sports kit (mat shoes compulsory).',
    status: 'published',
    created_at: new Date('2026-09-01').toISOString(),
    organization: {
      id: 'org-satara-1',
      name: 'Satara District Kabaddi Association',
      city: 'Satara',
      state: 'Maharashtra',
      logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80'
    },
    sport: { id: 4, name: 'Kabaddi' }
  },
  {
    id: 'opp-2',
    org_id: 'org-delhi-1',
    created_by: 'usr-org-2',
    title: 'All-India National Athletics Summer Camp & Scholarship Combine',
    description: 'Four-week intensive sprint, hurdle, and jump conditioning camp hosted by national selectors. Top 5 performers receive full sports equipment grant and 1-year training scholarship.',
    sport_id: 5, // Athletics
    category: 'camp',
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
    status: 'published',
    created_at: new Date('2026-09-10').toISOString(),
    organization: {
      id: 'org-delhi-1',
      name: 'Delhi Youth Sports Foundation',
      city: 'New Delhi',
      state: 'Delhi',
      logo_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80'
    },
    sport: { id: 5, name: 'Athletics (Track & Field)' }
  },
  {
    id: 'opp-3',
    org_id: 'org-satara-1',
    created_by: 'usr-org-1',
    title: 'Mumbai Premier Junior Cricket Trophy — Scouting Trials',
    description: 'Selection trials for Mumbai and Pune suburban fast bowlers and wicket-keepers for the 2026 Invitational Summer Cup.',
    sport_id: 1, // Cricket
    category: 'tournament',
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
    status: 'published',
    created_at: new Date('2026-09-15').toISOString(),
    organization: {
      id: 'org-satara-1',
      name: 'Satara District Kabaddi Association',
      city: 'Satara',
      state: 'Maharashtra',
      logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80'
    },
    sport: { id: 1, name: 'Cricket' }
  },
  {
    id: 'opp-4',
    org_id: 'org-delhi-1',
    created_by: 'usr-org-2',
    title: 'Badminton Excellence Academy Admissions & Talent Search',
    description: 'Residential academy intake for promising sub-junior and junior singles players. World-class conditioning and international coach mentoring.',
    sport_id: 3, // Badminton
    category: 'academy_admission',
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
    status: 'published',
    created_at: new Date('2026-09-20').toISOString(),
    organization: {
      id: 'org-delhi-1',
      name: 'Delhi Youth Sports Foundation',
      city: 'New Delhi',
      state: 'Delhi',
      logo_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=80'
    },
    sport: { id: 3, name: 'Badminton' }
  }
];

export const mockApplications = [
  {
    id: 'app-1',
    opportunity_id: 'opp-1',
    applicant_id: 'usr-athlete-1',
    status: 'under_review',
    message: 'I am a dedicated fast bowler with peak aerobic endurance and previous district kabaddi experience at school level.',
    resume_url: null,
    contact_phone: '+91 98230 11223',
    contact_email: 'athlete.demo@sportsconnect.in',
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date('2026-09-25').toISOString(),
    opportunity: mockOpportunities[0],
    applicant: mockUsers[0]
  }
];

export const mockApplicationHistory = [
  {
    id: 'hist-1',
    application_id: 'app-1',
    status: 'submitted',
    notes: 'Application initially submitted by applicant',
    changed_by: 'usr-athlete-1',
    created_at: new Date('2026-09-25T10:00:00Z').toISOString()
  },
  {
    id: 'hist-2',
    application_id: 'app-1',
    status: 'under_review',
    notes: 'Profile and statistics under review by selection committee',
    changed_by: 'usr-org-1',
    created_at: new Date('2026-09-26T14:30:00Z').toISOString()
  }
];

export const mockSavedOpportunities = [
  {
    id: 'save-1',
    user_id: 'usr-athlete-1',
    opportunity_id: 'opp-2',
    created_at: new Date().toISOString()
  }
];

export const mockAchievements = [
  {
    id: 'ach-1',
    athlete_id: 'usr-athlete-1',
    title: 'Player of the Tournament & Best Bowler',
    competition_name: 'Maharashtra Youth Trophy 2025',
    year: 2025,
    sport_id: 1,
    medal: 'winner',
    description: 'Took 19 wickets in 5 matches at an economy rate of 3.84.',
    verification_url: 'https://mca.example.com/tournaments/2025/youth',
    created_at: new Date().toISOString()
  },
  {
    id: 'ach-2',
    athlete_id: 'usr-athlete-1',
    title: 'State Gold Medal (4x100m Relay)',
    competition_name: 'Inter-District Athletic Meet',
    year: 2024,
    sport_id: 5,
    medal: 'gold',
    description: 'Anchored the winning Pune district relay team.',
    verification_url: null,
    created_at: new Date().toISOString()
  }
];

export const mockCertificates = [
  {
    id: 'cert-1',
    athlete_id: 'usr-athlete-1',
    title: 'High Performance Athletic Conditioning Certificate',
    issuing_body: 'Sports Authority of India (SAI) Regional Center',
    issue_date: '2024-06-15',
    expiry_date: null,
    certificate_url: 'https://sai.gov.in/certs/verify/112233',
    credential_id: 'SAI-HPC-2024-8891',
    is_verified: true,
    created_at: new Date().toISOString()
  }
];

export const mockStatistics = [
  {
    id: 'stat-1',
    athlete_id: 'usr-athlete-1',
    sport_id: 1,
    metric_name: 'Bowling Speed (Top)',
    metric_value: '138.4',
    metric_unit: 'km/h',
    season_or_year: '2025-26',
    notes: 'Clocked via Stalker radar gun during zonal trials',
    created_at: new Date().toISOString()
  },
  {
    id: 'stat-2',
    athlete_id: 'usr-athlete-1',
    sport_id: 1,
    metric_name: 'Wickets (Season 2024-25)',
    metric_value: '42',
    metric_unit: 'wickets in 14 matches',
    season_or_year: '2024-25',
    notes: 'Average 14.2, 3 five-wicket hauls',
    created_at: new Date().toISOString()
  },
  {
    id: 'stat-3',
    athlete_id: 'usr-athlete-1',
    sport_id: 5,
    metric_name: 'Yo-Yo Test Score',
    metric_value: '19.8',
    metric_unit: 'level',
    season_or_year: '2025',
    notes: 'Top tier athletic cardiovascular conditioning',
    created_at: new Date().toISOString()
  }
];

export const mockConnections = [
  {
    id: 'conn-1',
    requester_id: 'usr-athlete-1',
    receiver_id: 'usr-coach-1',
    status: 'accepted',
    created_at: new Date('2025-02-01').toISOString(),
    other_user: mockUsers[2]
  }
];

export const mockInquiries = [
  {
    id: 'inq-1',
    coach_id: 'usr-coach-1',
    user_id: 'usr-athlete-1',
    sport_id: 1,
    message: 'Hello Coach Vikram, I would like to join your off-season pace bowling biomechanics program. Could you share details regarding slot availability?',
    status: 'replied',
    reply: 'Hello Aarav! I have reviewed your match clips and bowling stats. We have weekend batch slots open. Let us schedule an initial assessment this Saturday at 4 PM.',
    created_at: new Date('2026-09-18').toISOString(),
    coach: mockUsers[2],
    athlete: mockUsers[0]
  }
];

export const mockNotifications = [
  {
    id: 'notif-1',
    user_id: 'usr-athlete-1',
    title: 'Application Under Review',
    message: 'Your application for U-19 Maharashtra Kabaddi State Trials 2026 is now Under Review.',
    type: 'application_status',
    link: '/applications',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'usr-athlete-1',
    title: 'Coach Reply Received',
    message: 'Coach Vikram Rathore replied to your coaching inquiry regarding pace bowling biomechanics.',
    type: 'inquiry',
    link: '/inquiries',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];
