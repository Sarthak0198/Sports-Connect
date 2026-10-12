import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../api/client';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApps = async () => {
    try {
      const data = await api.getMyApplications();
      setApplications(data || []);
    } catch (err) {
      console.warn('Apps fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.withdrawApplication(appId);
      loadApps();
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
    }
  };

  const statusConfigs = {
    submitted: { variant: 'blue', label: 'SUBMITTED' },
    under_review: { variant: 'amber', label: 'UNDER REVIEW' },
    shortlisted: { variant: 'emerald', label: 'SHORTLISTED' },
    accepted: { variant: 'emerald', label: 'ACCEPTED' },
    rejected: { variant: 'rose', label: 'NOT SHORTLISTED' },
    withdrawn: { variant: 'default', label: 'WITHDRAWN' }
  };

  if (loading) return <LoadingSpinner text="Loading your applications..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
          My Applications ({applications.length})
        </h1>
        <p className="text-xs text-slate-500">
          Track real-time selection updates from trial organizers and state academies.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications submitted yet"
          description="Find selection trials and submit your digital sports résumé."
          actionText="Explore Trials"
          onAction={() => window.location.href = '/opportunities'}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const opp = app.opportunity || {};
            const conf = statusConfigs[app.status] || statusConfigs.submitted;

            return (
              <Card key={app.id} className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        {opp.category?.replace('_', ' ') || 'OPPORTUNITY'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-sports-blue">
                        {opp.sports?.name || 'Athletics'}
                      </span>
                    </div>

                    <Link to={`/opportunities/${app.opportunity_id || opp.id}`} className="text-base font-bold text-slate-800 hover:text-sports-blue">
                      {opp.title || 'Trial Opportunity'}
                    </Link>

                    <div className="text-xs text-slate-500 mt-1">
                      Venue: {[opp.city, opp.state].filter(Boolean).join(', ') || 'India'} · Submitted: {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={conf.variant} size="md">
                      {conf.label}
                    </Badge>
                    {app.status === 'submitted' && (
                      <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => handleWithdraw(app.id)}>
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>

                {/* Application Notes or Status Explanation */}
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Status Update: {new Date(app.updated_at || app.created_at).toLocaleDateString()}</span>
                  </div>
                  {app.message && (
                    <div className="italic text-slate-400 truncate max-w-sm">
                      Note: "{app.message}"
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
