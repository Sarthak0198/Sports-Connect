import React, { useState, useEffect } from 'react';
import { Search, MapPin, Award, Star, MessageSquare, ShieldCheck, Clock, Send } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const FindCoaches = () => {
  const { isAuthenticated } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');

  // Inquiry modal state
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const data = await api.listCoaches({
        search: search || undefined,
        state: state || undefined
      });
      setCoaches(data || []);
    } catch (err) {
      console.warn('Coaches load note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, [state]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in or sign up as an athlete to contact coaches.');
      return;
    }
    setSending(true);
    setInquiryError('');

    try {
      await api.sendCoachingInquiry(selectedCoach.id, {
        message: inquiryMsg
      });
      setInquirySuccess(true);
      setTimeout(() => {
        setInquirySuccess(false);
        setSelectedCoach(null);
        setInquiryMsg('');
      }, 1500);
    } catch (err) {
      setInquiryError(err.message || 'Failed to send coaching inquiry');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="emerald" size="sm">COACHING ROSTER</Badge>
        <h1 className="text-3xl font-extrabold font-display text-sports-navy">
          Find Certified Sports Coaches & Trainers
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Connect with BCCI, BWF, SAI and NSNIS certified high-performance trainers for personalized drills and competition mentorship.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by coach name, specialization (e.g. Pace Bowling, Agility)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="State / City (e.g. Mumbai, Pune)"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
          />
          <Button variant="primary" onClick={loadCoaches}>
            Search
          </Button>
        </div>
      </div>

      {/* Coaches Grid */}
      {loading ? (
        <LoadingSpinner text="Finding certified coaches..." />
      ) : coaches.length === 0 ? (
        <EmptyState
          title="No coaches found"
          description="Try broadening your search term or region."
          actionText="Clear Filters"
          onAction={() => { setSearch(''); setState(''); loadCoaches(); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => {
            const ext = coach.coach_profiles || {};
            const sportName = ext.sports?.name || 'Multi-Sport';

            return (
              <Card key={coach.id} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-sports-navy text-white overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl shadow-md">
                      {coach.avatar_url ? (
                        <img src={coach.avatar_url} alt={coach.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{coach.full_name?.charAt(0) || 'C'}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-bold font-display text-sports-navy">
                          {coach.full_name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-sports-blue fill-blue-50" title="Certified Coach" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{[coach.city, coach.state].filter(Boolean).join(', ') || 'India'}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <Badge variant="blue" size="sm">{sportName}</Badge>
                        <Badge variant="emerald" size="sm">{ext.experience_years || 10}+ Yrs Exp</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  {ext.specializations && ext.specializations.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Focus Areas
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ext.specializations.map((spec, i) => (
                          <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {coach.bio && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {coach.bio}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Assessment Rate</span>
                    <span className="text-xs font-extrabold text-sports-navy">
                      {ext.hourly_rate ? `₹${ext.hourly_rate} / hr` : 'On Request'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={MessageSquare}
                    onClick={() => setSelectedCoach(coach)}
                  >
                    Contact Coach
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inquiry Modal */}
      <Modal
        isOpen={!!selectedCoach}
        onClose={() => { setSelectedCoach(null); setInquiryError(''); }}
        title={`Inquire: ${selectedCoach?.full_name}`}
      >
        {inquirySuccess ? (
          <div className="text-center py-6">
            <h4 className="text-base font-bold text-slate-800">Inquiry Sent Successfully!</h4>
            <p className="text-xs text-slate-500 mt-1">The coach will review your inquiry and reply via your dashboard.</p>
          </div>
        ) : (
          <form onSubmit={handleInquirySubmit} className="space-y-4">
            {inquiryError && <Alert type="error" message={inquiryError} />}

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              Inquiring for training in: <strong>{selectedCoach?.coach_profiles?.sports?.name || 'Sports Coaching'}</strong>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Message / Inquired Schedule
              </label>
              <textarea
                required
                rows={4}
                value={inquiryMsg}
                onChange={(e) => setInquiryMsg(e.target.value)}
                placeholder="Mention your age, current playing level, batch preference, and fitness goals..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setSelectedCoach(null)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={sending} icon={Send}>
                Send Inquiry
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
