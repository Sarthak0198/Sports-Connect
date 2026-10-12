import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Target,
  Clock,
  Bookmark,
  FileText,
  UserCheck,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { api } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AthleteDashboard = ({ profile }) => {
  const [applications, setApplications] = useState([]);
  const [savedOpps, setSavedOpps] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [appsData, savedData, oppsData] = await Promise.all([
          api.getMyApplications().catch(() => []),
          api.getMySavedOpportunities().catch(() => []),
          api.listOpportunities({ limit: 4 }).catch(() => [])
        ]);
        setApplications(appsData || []);
        setSavedOpps(savedData || []);
        setOpportunities(oppsData || []);
      } catch (err) {
        console.warn('Dashboard fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const completionPct = profile?.completion_pct || 85;

  const statusColors = {
    submitted: 'blue',
    under_review: 'amber',
    shortlisted: 'emerald',
    accepted: 'emerald',
    rejected: 'rose',
    withdrawn: 'default'
  };

  if (loading) return <LoadingSpinner text="Loading Athlete Dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Welcome & Profile Completion Banner */}
      <div className="bg-gradient-to-r from-sports-navy to-sports-navyLight rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="blue" size="sm" className="mb-3 bg-blue-500/20 text-sports-cyan border-blue-400/30">
            ATHLETE HEADQUARTERS
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Your athletic digital résumé is live for selectors and academies across India.
          </p>

          {/* Completion Meter */}
          <div className="mt-6 pt-6 border-t border-slate-700/60 max-w-md">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Sports Profile Completion</span>
              <span className="text-sports-cyan">{completionPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sports-blue to-sports-cyan rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {completionPct < 100 && (
              <div className="mt-3 flex items-center gap-3">
                <Link
                  to="/profile/edit"
                  className="text-xs font-bold text-sports-cyan hover:underline inline-flex items-center gap-1"
                >
                  Add more stats & video drills <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Decorative graphic */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Trophy className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-sports-blue flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">{applications.length}</div>
            <div className="text-xs font-medium text-slate-500">Applications Sent</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-sports-emerald flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">
              {applications.filter(a => a.status === 'shortlisted' || a.status === 'accepted').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Shortlisted / Accepted</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">{savedOpps.length}</div>
            <div className="text-xs font-medium text-slate-500">Saved Opportunities</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">Active</div>
            <div className="text-xs font-medium text-slate-500">Scout Visibility</div>
          </div>
        </Card>
      </div>

      {/* Grid: Active Applications & Saved Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sports-blue" />
              <h3 className="text-lg font-bold font-display text-sports-navy">Application Tracker</h3>
            </div>
            <Link to="/applications" className="text-xs font-bold text-sports-blue hover:underline">
              View All ({applications.length})
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 mb-3">You have not applied to any trials or camps yet.</p>
              <Link to="/opportunities">
                <Button size="sm" variant="primary">Explore Trials</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {app.opportunity?.title || 'Selection Opportunity'}
                    </h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={statusColors[app.status] || 'default'} size="sm">
                    {app.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recommended Opportunities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sports-emerald" />
              <h3 className="text-lg font-bold font-display text-sports-navy">Recommended For You</h3>
            </div>
            <Link to="/opportunities" className="text-xs font-bold text-sports-blue hover:underline">
              Browse Marketplace
            </Link>
          </div>

          <div className="space-y-3">
            {opportunities.slice(0, 3).map((opp) => (
              <div key={opp.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase text-sports-blue block">
                    {opp.category?.replace('_', ' ')} · {opp.sports?.name || 'Sport'}
                  </span>
                  <Link to={`/opportunities/${opp.id}`} className="text-xs font-bold text-slate-800 hover:text-sports-blue line-clamp-1">
                    {opp.title}
                  </Link>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {opp.city}, {opp.state} · Fee: {opp.application_fee || 'Free'}
                  </span>
                </div>
                <Link to={`/opportunities/${opp.id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};
