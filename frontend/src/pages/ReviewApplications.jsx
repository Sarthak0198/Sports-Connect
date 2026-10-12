import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ArrowLeft, CheckCircle2, Clock, XCircle, Search, UserCheck, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../api/client';

export const ReviewApplications = () => {
  const { id: opportunityId } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      const [opp, apps] = await Promise.all([
        api.getOpportunityById(opportunityId),
        api.getOpportunityApplications(opportunityId, {
          status: statusFilter || undefined
        })
      ]);
      setOpportunity(opp);
      setApplications(apps || []);
    } catch (err) {
      console.warn('Review apps load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [opportunityId, statusFilter]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.updateApplicationStatus(appId, newStatus, `Organizer updated status to ${newStatus}`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update applicant status');
    }
  };

  const statusColors = {
    submitted: 'blue',
    under_review: 'amber',
    shortlisted: 'emerald',
    accepted: 'emerald',
    rejected: 'rose',
    withdrawn: 'default'
  };

  if (loading) return <LoadingSpinner text="Loading applicants for review..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          to="/opportunities/manage"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hosted Opportunities
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
          Review Applicants: {opportunity?.title}
        </h1>
        <p className="text-xs text-slate-500">
          Filter and update applicant statuses. Shortlisted candidates receive automated in-app notifications.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {[
          { id: '', label: 'All Applicants' },
          { id: 'submitted', label: 'New Submitted' },
          { id: 'under_review', label: 'Under Review' },
          { id: 'shortlisted', label: 'Shortlisted' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'rejected', label: 'Rejected' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === f.id
                ? 'bg-sports-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants matching this status"
          description="Applications submitted by athletes will populate here."
          actionText="View All Applicants"
          onAction={() => setStatusFilter('')}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const applicant = app.applicant || {};
            const athExt = applicant.athlete_profiles || {};

            return (
              <Card key={app.id} className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sports-navy text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {applicant.full_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        {applicant.full_name}
                        <Badge variant={statusColors[app.status] || 'default'} size="sm">
                          {app.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Role: <strong>{athExt.position || 'Athlete'}</strong> · Playing Level: <span className="capitalize">{athExt.playing_level || 'State'}</span> · {applicant.city}, {applicant.state}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                    >
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant="emerald"
                      onClick={() => handleUpdateStatus(app.id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Link to={`/athletes/${applicant.id || app.applicant_id}`}>
                      <Button size="sm" variant="ghost" icon={ExternalLink}>
                        Résumé
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Athlete Note & Contact */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Applicant Message / Self-Pitch
                    </span>
                    <p className="italic">"{app.message || 'Ready for match trials.'}"</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Contact for Combine Reporting
                    </span>
                    <div>Phone: <strong className="text-slate-800">{app.contact_phone || applicant.phone || 'Available'}</strong></div>
                    <div>Email: <strong className="text-slate-800">{app.contact_email || applicant.email}</strong></div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
