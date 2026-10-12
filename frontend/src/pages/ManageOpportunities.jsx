import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, PlusCircle, ArrowLeft, Users, Eye, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { api } from '../api/client';

export const ManageOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOpps = async () => {
    try {
      const data = await api.listOpportunities({ limit: 50 });
      setOpportunities(data || []);
    } catch (err) {
      console.warn('Manage opps fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpps();
  }, []);

  const handleToggleStatus = async (oppId, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'closed' : 'published';
    try {
      await api.updateOpportunity(oppId, { status: nextStatus });
      loadOpps();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (oppId) => {
    if (!window.confirm('Delete this opportunity? This will remove all associated applications.')) return;
    try {
      await api.deleteOpportunity(oppId);
      loadOpps();
    } catch (err) {
      alert(err.message || 'Failed to delete opportunity');
    }
  };

  if (loading) return <LoadingSpinner text="Loading opportunities management..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <Link to="/opportunities/create">
          <Button variant="emerald" size="sm" icon={PlusCircle}>
            Create New Opportunity
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
          Manage Hosted Opportunities ({opportunities.length})
        </h1>
        <p className="text-xs text-slate-500">
          Control active registration status, update details, and review submissions.
        </p>
      </div>

      <div className="space-y-3">
        {opportunities.map((opp) => (
          <Card key={opp.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={opp.status === 'published' ? 'emerald' : 'default'} size="sm">
                  {opp.status?.toUpperCase()}
                </Badge>
                <span className="text-xs font-bold text-sports-blue capitalize">
                  {opp.category?.replace('_', ' ')} · {opp.sports?.name || 'Athletics'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800">{opp.title}</h3>

              <div className="text-xs text-slate-500 mt-1">
                Venue: {opp.city}, {opp.state} · Deadline: {opp.registration_deadline || 'Rolling'}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/opportunities/${opp.id}/applications`}>
                <Button size="sm" variant="primary" icon={Users}>
                  Applicants
                </Button>
              </Link>

              <Link to={`/opportunities/${opp.id}/edit`}>
                <Button size="sm" variant="outline" icon={Edit3}>
                  Edit
                </Button>
              </Link>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleStatus(opp.id, opp.status)}
              >
                {opp.status === 'published' ? 'Close Intake' : 'Publish'}
              </Button>

              <button
                onClick={() => handleDelete(opp.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Opportunity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
};
