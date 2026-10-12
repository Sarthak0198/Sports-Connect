import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  PlusCircle,
  FileCheck,
  Calendar,
  Eye,
  Settings,
  ArrowRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { api } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const OrganizationDashboard = ({ profile }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrgData = async () => {
      try {
        const [opps, orgs] = await Promise.all([
          api.listOpportunities({ limit: 20 }).catch(() => []),
          api.getMyOrganizations().catch(() => [])
        ]);
        setOpportunities(opps || []);
        setOrganizations(orgs || []);
      } catch (err) {
        console.warn('Org data notice:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrgData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Organizer Dashboard..." />;

  const currentOrg = organizations[0] || { name: 'Sports Academy & Organization' };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sports-navy via-sports-navyLight to-sports-blue rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <Badge variant="blue" size="sm" className="mb-3 bg-white/20 text-white border-white/30">
              ORGANIZATION PORTAL
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              {currentOrg.name}
            </h1>
            <p className="text-slate-200 text-sm mt-1 max-w-xl">
              Publish trials, camps, and tournaments. Review applicant talent résumés and track athlete onboarding.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/opportunities/create">
              <Button variant="emerald" size="md" icon={PlusCircle}>
                Post Opportunity
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-sports-blue flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">{opportunities.length}</div>
            <div className="text-xs font-medium text-slate-500">Live Opportunities</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-sports-emerald flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">12</div>
            <div className="text-xs font-medium text-slate-500">Total Applicants</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">4</div>
            <div className="text-xs font-medium text-slate-500">Pending Review</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">Active</div>
            <div className="text-xs font-medium text-slate-500">Intake Status</div>
          </div>
        </Card>
      </div>

      {/* Published Opportunities Management Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold font-display text-sports-navy">Manage Published Opportunities</h3>
            <p className="text-xs text-slate-500">Monitor deadlines, edit details, and review submissions.</p>
          </div>
          <Link to="/opportunities/manage">
            <Button size="sm" variant="outline">Detailed Table</Button>
          </Link>
        </div>

        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="blue" size="sm">
                    {opp.category?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-xs font-bold text-slate-400">· {opp.sports?.name || 'Sport'}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">{opp.title}</h4>
                <div className="text-xs text-slate-500 mt-1">
                  Venue: {opp.city}, {opp.state} · Deadline: {opp.registration_deadline || 'Rolling'}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/opportunities/${opp.id}/applications`}>
                  <Button size="sm" variant="primary" icon={Users}>
                    Review Applicants
                  </Button>
                </Link>
                <Link to={`/opportunities/${opp.id}`}>
                  <Button size="sm" variant="ghost" icon={Eye}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
