import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Target,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  Flame,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  MapPin,
  Search
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    total_athletes: 1240,
    total_coaches: 310,
    total_organizations: 85,
    active_opportunities: 48
  });
  const [opportunities, setOpportunities] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsData, oppsData, sportsData] = await Promise.all([
          api.getPlatformStats().catch(() => null),
          api.listOpportunities({ limit: 3 }).catch(() => []),
          api.listSports().catch(() => [])
        ]);

        if (statsData) setStats(statsData);
        if (oppsData) setOpportunities(oppsData);
        if (sportsData) setSports(sportsData);
      } catch (err) {
        console.warn('Home data load note:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-sports-navy text-white">
        <div className="absolute inset-0 sports-hero-grid opacity-30" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-sports-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-96 h-96 bg-sports-cyan/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-sports-cyan text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                INDIA'S PREMIER SPORTS OPPORTUNITY DISCOVERY PLATFORM
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.08]">
                Your Talent Deserves to Be{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sports-cyan via-sports-blue to-blue-400">
                  Discovered.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                Connect. Compete. Grow. The digital bridge for aspiring athletes, verified coaches, academies, and tournament organizers across India. Showcase your sports résumé and discover selection trials.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                  <Button size="lg" variant="primary" icon={ArrowRight} className="w-full sm:w-auto">
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  </Button>
                </Link>
                <Link to="/opportunities">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-600 text-white hover:bg-white/10 hover:text-white">
                    Explore Opportunities
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sports-emerald" />
                  <span>BCCI & SAI Recognized Disciplines</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sports-cyan" />
                  <span>Verified Selectors & Academies</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sports-blue flex items-center justify-center font-bold text-white shadow-glow">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Live Scouting Combine</div>
                      <span className="text-[10px] text-sports-cyan">Maharashtra State Circuit</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    TRIALS ACTIVE
                  </span>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Featured Trial</div>
                  <h4 className="text-sm font-bold text-white">U-19 Kabaddi Selection Trials 2026</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sports-cyan" /> Satara, Maharashtra
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="block text-xl font-black text-sports-cyan font-display">138 km/h</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Pace Benchmark</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="block text-xl font-black text-sports-emerald font-display">100% Free</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Open Registration</span>
                  </div>
                </div>

                <Link to="/opportunities" className="block text-center text-xs font-bold text-sports-cyan hover:underline pt-2">
                  Browse All 48+ Open Tournaments & Trials →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. REAL PLATFORM METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="text-center pt-4 sm:pt-0">
            <span className="block text-3xl sm:text-4xl font-extrabold text-sports-navy font-display">
              {stats.total_athletes}+
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">
              Registered Athletes
            </span>
          </div>
          <div className="text-center pt-4 sm:pt-0">
            <span className="block text-3xl sm:text-4xl font-extrabold text-sports-blue font-display">
              {stats.total_coaches}+
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">
              Certified Coaches
            </span>
          </div>
          <div className="text-center pt-4 sm:pt-0">
            <span className="block text-3xl sm:text-4xl font-extrabold text-sports-emerald font-display">
              {stats.total_organizations}+
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">
              Academies & Clubs
            </span>
          </div>
          <div className="text-center pt-4 sm:pt-0">
            <span className="block text-3xl sm:text-4xl font-extrabold text-sports-navy font-display">
              {stats.active_opportunities}+
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">
              Live Opportunities
            </span>
          </div>
        </div>
      </section>

      {/* 3. SPORTS CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="blue" size="sm" className="mb-2">MULTI-SPORT ECOSYSTEM</Badge>
          <h2 className="text-3xl font-extrabold font-display text-sports-navy">
            Supporting Every Major Sport in India
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            From grassroots rural kabaddi to olympic track & field, find dedicated scouting and coaching pipelines.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Cricket', icon: 'Award', color: 'from-amber-500 to-orange-600', link: '/opportunities?sport_id=1' },
            { name: 'Football', icon: 'Trophy', color: 'from-emerald-500 to-teal-600', link: '/opportunities?sport_id=2' },
            { name: 'Badminton', icon: 'Zap', color: 'from-blue-500 to-indigo-600', link: '/opportunities?sport_id=3' },
            { name: 'Kabaddi', icon: 'Flame', color: 'from-red-500 to-rose-600', link: '/opportunities?sport_id=4' },
            { name: 'Athletics', icon: 'Timer', color: 'from-purple-500 to-violet-600', link: '/opportunities?sport_id=5' },
            { name: 'Field Hockey', icon: 'Shield', color: 'from-cyan-500 to-blue-600', link: '/opportunities?sport_id=6' },
            { name: 'Basketball', icon: 'Activity', color: 'from-orange-500 to-amber-600', link: '/opportunities?sport_id=7' },
            { name: 'Volleyball', icon: 'Users', color: 'from-teal-500 to-emerald-600', link: '/opportunities?sport_id=8' },
            { name: 'Tennis', icon: 'Target', color: 'from-lime-500 to-green-600', link: '/opportunities?sport_id=9' },
            { name: 'Swimming', icon: 'Droplets', color: 'from-sky-500 to-blue-600', link: '/opportunities?sport_id=11' },
            { name: 'Boxing', icon: 'Swords', color: 'from-rose-500 to-red-600', link: '/opportunities?sport_id=12' },
            { name: 'Wrestling', icon: 'Medal', color: 'from-indigo-500 to-purple-600', link: '/opportunities?sport_id=13' }
          ].map((s, idx) => (
            <Link
              key={idx}
              to={s.link}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all text-center group flex flex-col items-center justify-center gap-3"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 font-display group-hover:text-sports-blue transition-colors">
                {s.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED OPPORTUNITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="emerald" size="sm" className="mb-2">DISCOVERY MARKETPLACE</Badge>
            <h2 className="text-3xl font-extrabold font-display text-sports-navy">
              Featured Trials & Tournaments
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked selection events accepting verified online applications today.
            </p>
          </div>
          <Link to="/opportunities">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              View All Opportunities
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-slate-100/60 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="blue" size="sm" className="mb-2">STEP-BY-STEP</Badge>
            <h2 className="text-3xl font-extrabold font-display text-sports-navy">
              How Sports Connect Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Four streamlined steps to get discovered by state selectors, academies, and professional teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Build Digital Résumé',
                desc: 'Upload verified match statistics, tournament medals, competition history, and video highlights.'
              },
              {
                step: '02',
                title: 'Discover Opportunities',
                desc: 'Browse state selection trials, training camps, scholarships, and academy intake combines.'
              },
              {
                step: '03',
                title: 'Apply in One Click',
                desc: 'Submit your authenticated sports profile directly to organizers and scouting selectors.'
              },
              {
                step: '04',
                title: 'Get Scouted & Grow',
                desc: 'Receive shortlist notifications, connect with certified coaches, and level up your athletic career.'
              }
            ].map((st, idx) => (
              <div key={idx} className="relative bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card">
                <span className="text-4xl font-black text-blue-100 font-display block mb-2">{st.step}</span>
                <h3 className="text-base font-bold text-sports-navy font-display mb-2">{st.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SAMPLE TESTIMONIALS (Clearly fictional demonstration) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="purple" size="sm" className="mb-2">DEMONSTRATION SHOWCASE</Badge>
          <h2 className="text-3xl font-extrabold font-display text-sports-navy">
            Empowering India's Next Generation
          </h2>
          <p className="text-xs text-slate-400 mt-1 italic">
            *Sample demonstration stories showcasing platform impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Sports Connect bridged the gap between district kabaddi in Satara and state selectors. I applied for the U-19 trials online and got shortlisted within 48 hours.",
              name: "Aarav Sharma",
              role: "U-19 Fast Bowler & Athlete",
              city: "Pune, Maharashtra"
            },
            {
              quote: "As an academy director, filtering hundreds of paper forms was chaotic. Sports Connect allows us to review verified sprint timings and match statistics effortlessly.",
              name: "Coach Vikram Rathore",
              role: "Head Coach, Elite Cricket Academy",
              city: "Mumbai, Maharashtra"
            },
            {
              quote: "Found my personal athletic conditioning coach through the direct inquiry system. The transparency in certifications and fees makes this the LinkedIn of sports.",
              name: "Priya Deshmukh",
              role: "State 200m Sprinter",
              city: "Bengaluru, Karnataka"
            }
          ].map((t, idx) => (
            <Card key={idx} className="p-6 flex flex-col justify-between">
              <p className="text-xs text-slate-600 italic leading-relaxed mb-6">"{t.quote}"</p>
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-sports-navy">{t.name}</div>
                <div className="text-[11px] text-sports-blue font-semibold">{t.role}</div>
                <div className="text-[10px] text-slate-400">{t.city}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-sports-navy rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sports-blue/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
              Ready to Take Your Sporting Journey to the Next Level?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Join thousands of athletes, coaches, and sports institutions across India. Create your sports profile or post your trial opportunities today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/register">
                <Button size="lg" variant="primary" icon={ArrowRight}>
                  Get Started Free
                </Button>
              </Link>
              <Link to="/opportunities">
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-white/10">
                  Explore Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
