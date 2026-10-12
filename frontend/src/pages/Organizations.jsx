import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ShieldCheck, Building, Globe, Mail, Phone, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../api/client';

export const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const data = await api.listOrganizations({
        search: search || undefined,
        kind: kind || undefined
      });
      setOrganizations(data || []);
    } catch (err) {
      console.warn('Orgs load note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, [kind]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="blue" size="sm">INSTITUTIONAL DIRECTORY</Badge>
        <h1 className="text-3xl font-extrabold font-display text-sports-navy">
          Sports Academies, Clubs & Tournament Organizers
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Discover verified training facilities, state sports associations, and grassroots organizations scouting across India.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by academy name, club, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
          >
            <option value="">All Institution Types</option>
            <option value="academy">Training Academies</option>
            <option value="club">Sports Clubs</option>
            <option value="school">Schools & Colleges</option>
            <option value="organizer">Tournament Organizers</option>
          </select>
          <Button variant="primary" onClick={loadOrgs}>
            Search
          </Button>
        </div>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <LoadingSpinner text="Loading sports organizations..." />
      ) : organizations.length === 0 ? (
        <EmptyState
          title="No organizations found"
          description="Try broadening your search or choosing another type."
          actionText="Clear Filters"
          onAction={() => { setSearch(''); setKind(''); loadOrgs(); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xl text-slate-700 shadow-sm border border-slate-200">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building className="w-7 h-7 text-sports-blue" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-bold font-display text-sports-navy">
                        {org.name}
                      </h3>
                      {org.is_verified && (
                        <ShieldCheck className="w-4 h-4 text-sports-emerald fill-emerald-50" title="Verified Organization" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{[org.city, org.state].filter(Boolean).join(', ') || 'India'}</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="blue" size="sm">
                        {org.kind?.toUpperCase() || 'ACADEMY'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {org.description && (
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {org.description}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  {org.address && (
                    <div className="text-[11px] text-slate-400 truncate">
                      {org.address}
                    </div>
                  )}
                  {org.website && (
                    <div className="flex items-center gap-1 text-sports-blue">
                      <Globe className="w-3.5 h-3.5" />
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {org.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-sports-emerald flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Org
                </span>
                <Link to={`/organizations/${org.id}`}>
                  <Button size="sm" variant="outline" icon={ArrowRight}>
                    View Profile
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
