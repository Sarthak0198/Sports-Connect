import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, User } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SportsResume } from '../components/profile/SportsResume';
import { api } from '../api/client';

export const ApplicantDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const data = await api.getApplicationDetails(id);
        setApplication(data);
        setStatus(data?.status || 'submitted');
      } catch (err) {
        console.warn('App details fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await api.updateApplicationStatus(id, newStatus, `Status updated to ${newStatus}`);
      setStatus(newStatus);
      alert(`Applicant marked as ${newStatus}`);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading applicant file..." />;
  if (!application) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-display text-sports-navy">Application File Not Found</h2>
        <Link to="/opportunities/manage" className="mt-4 inline-block">
          <Button variant="primary">Return to Management</Button>
        </Link>
      </div>
    );
  }

  const applicant = application.applicant || {};
  const history = application.history || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          to={`/opportunities/${application.opportunity_id}/applications`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applicants List
        </Link>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={updating}
            onClick={() => handleStatusChange('shortlisted')}
          >
            Shortlist Candidate
          </Button>
          <Button
            size="sm"
            variant="emerald"
            disabled={updating}
            onClick={() => handleStatusChange('accepted')}
          >
            Accept Candidate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50"
            disabled={updating}
            onClick={() => handleStatusChange('rejected')}
          >
            Reject
          </Button>
        </div>
      </div>

      {/* Applicant Audit Box */}
      <Card className="p-6 bg-slate-50 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current Application Status</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-extrabold text-sports-navy capitalize">{status.replace('_', ' ')}</span>
            <Badge variant="blue" size="sm">AUDITED</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Applied for: <strong>{application.opportunity?.title}</strong> on {new Date(application.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200">
          <div>Phone: <strong>{application.contact_phone || applicant.phone}</strong></div>
          <div>Email: <strong>{application.contact_email || applicant.email}</strong></div>
        </div>
      </Card>

      {/* Applicant Digital Sports Resume */}
      <SportsResume athlete={applicant} isOwner={false} />

    </div>
  );
};
