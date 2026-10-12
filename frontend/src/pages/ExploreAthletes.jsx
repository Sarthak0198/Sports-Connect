import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Trophy, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../api/client';

export const ExploreAthletes = () => {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [level, setLevel] = useState('');

  const loadAthletes = async () => {
    setLoading(true);
    try {
      const data = await api.listAthletes({
        search: search || undefined,
        state: state || undefined,
        level: level || undefined
      });
      setAthletes(data || []);
    } catch (err) {
      console.warn('Athletes load note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAthletes();
  }, [state, level]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAthletes();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <Badge variant="blue" size="sm">TALENT DIRECTORY</Badge>
        <h1 className="text-3xl font-extrabold font-display text-sports-navy">
          Explore Talented Athletes Across India
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Discover verified youth athletes, sprinters, bowlers, and defenders ready for academy trials and state combines.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by athlete name, city, or sports role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="State (e.g. Maharashtra)"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
          />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
          >
            <option value="">All Playing Levels</option>
            <option value="grassroots">Grassroots</option>
            <option value="school">School / College</option>
            <option value="district">District Level</option>
            <option value="state">State Level</option>
            <option value="national">National Level</option>
          </select>

          <Button type="submit" variant="primary">
            Search
          </Button>
        </div>
      </form>

      {/* Athlete Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Searching verified athletes..." />
      ) : athletes.length === 0 ? (
        <EmptyState
          title="No athletes found"
          description="Try clearing your search query or state filter to view all athletes."
          actionText="Reset Filters"
          onAction={() => { setSearch(''); setState(''); setLevel(''); loadAthletes(); }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map((ath) => {
            const ext = ath.athlete_profiles || {};
            const sportName = ext.sports?.name || 'Athletics';

            return (
              <Card key={ath.id} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-sports-navy text-white overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl shadow-md">
                      {ath.avatar_url ? (
                        <img src={ath.avatar_url} alt={ath.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{ath.full_name?.charAt(0) || 'A'}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-bold font-display text-sports-navy line-clamp-1">
                          {ath.full_name}
                        </h3>
                        {ath.is_verified && (
                          <ShieldCheck className="w-4 h-4 text-sports-blue fill-blue-50" title="Verified Athlete" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{[ath.city, ath.state].filter(Boolean).join(', ') || 'India'}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <Badge variant="blue" size="sm">{sportName}</Badge>
                        {ext.playing_level && (
                          <Badge variant="emerald" size="sm">{ext.playing_level.toUpperCase()}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {ext.position && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-3">
                      Role / Position: <strong>{ext.position}</strong>
                    </div>
                  )}

                  {ath.bio && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {ath.bio}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Completion: {ext.profile_completion_pct || 85}%
                  </span>
                  <Link to={`/athletes/${ath.id}`}>
                    <Button size="sm" variant="outline" icon={ArrowRight}>
                      View Résumé
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
