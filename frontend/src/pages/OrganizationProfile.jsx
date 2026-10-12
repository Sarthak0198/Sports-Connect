import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, Globe, Mail, Phone, ShieldCheck, ArrowLeft, Trophy, Calendar } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { api } from '../api/client';

export const OrganizationProfile = () => {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const data = await api.getOrganizationById(id);
        setOrg(data);
      } catch (err) {
        console.warn('Org fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading organization details..." />;
  if (!org) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-sports-navy">Organization Not Found</h2>
        <Link to="/organizations" className="mt-4 inline-block">
          <Button variant="primary">Browse Organizations</Button>
        </Link>
      </div>
    );
  }

  const opportunities = org.opportunities || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/organizations"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Organizations
      </Link>

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-2xl text-slate-700 shadow-sm border border-slate-200">
            {org.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
            ) : (
              <Building className="w-8 h-8 text-sports-blue" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
                {org.name}
              </h1>
              {org.is_verified && (
                <ShieldCheck className="w-6 h-6 text-sports-emerald fill-emerald-50" title="Verified Organization" />
              )}
              <Badge variant="blue" size="md">
                {org.kind?.toUpperCase() || 'ACADEMY'}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{[org.city, org.state].filter(Boolean).join(', ') || 'India'}</span>
              </div>
              {org.website && (
                <div className="flex items-center gap-1 text-sports-blue">
                  <Globe className="w-4 h-4" />
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {org.website.replace('https://', '')}
                  </a>
                </div>
              )}
            </div>

            {org.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                {org.description}
              </p>
            )}
          </div>
        </div>

        {/* Address and details */}
        {org.address && (
          <div className="pt-4 text-xs text-slate-500">
            <strong>Headquarters / Stadium:</strong> {org.address}
          </div>
        )}
      </div>

      {/* Published Opportunities by this Organization */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display text-sports-navy flex items-center gap-2">
          <Trophy className="w-5 h-5 text-sports-blue" />
          Opportunities Hosted by {org.name} ({opportunities.length})
        </h3>

        {opportunities.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No published opportunities currently active.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={{ ...opp, organization: org }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
