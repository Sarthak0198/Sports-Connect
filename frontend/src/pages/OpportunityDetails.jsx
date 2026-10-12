import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Calendar,
  Clock,
  Building,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Send,
  AlertCircle,
  ArrowLeft,
  Users,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ApplicationModal } from '../components/opportunities/ApplicationModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchOpp = async () => {
      try {
        const data = await api.getOpportunityById(id);
        setOpportunity(data);
      } catch (err) {
        console.warn('Opportunity fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpp();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading opportunity details..." />;
  if (!opportunity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-sports-navy">Opportunity Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested trial or event could not be found.</p>
        <Link to="/opportunities" className="mt-4 inline-block">
          <Button variant="primary">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    category,
    city,
    state,
    venue_address,
    starts_on,
    ends_on,
    registration_deadline,
    eligibility,
    min_age,
    max_age,
    skill_level,
    available_positions,
    application_fee,
    instructions,
    sports,
    sport,
    organizations,
    organization
  } = opportunity;

  const sportName = sports?.name || sport?.name || 'Athletics';
  const orgObj = organizations || organization || {};

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save opportunities');
      return;
    }
    if (isSaved) {
      await api.unsaveOpportunity(id).catch(() => {});
      setIsSaved(false);
    } else {
      await api.saveOpportunity(id).catch(() => {});
      setIsSaved(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Back button */}
      <Link
        to="/opportunities"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Opportunities
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="md">
              {category?.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="emerald" size="md">
              {sportName}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={isSaved ? BookmarkCheck : Bookmark}
              onClick={handleSaveToggle}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Send}
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in or create an athlete account to apply.');
                  navigate('/login');
                } else {
                  setShowApplyModal(true);
                }
              }}
            >
              Apply Now
            </Button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-sports-navy mb-4">
          {title}
        </h1>

        {/* Organizer Row */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600">
            {orgObj.logo_url ? (
              <img src={orgObj.logo_url} alt={orgObj.name} className="w-full h-full object-cover" />
            ) : (
              <Building className="w-5 h-5 text-sports-blue" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              {orgObj.name || 'Sports Organization'}
              <ShieldCheck className="w-4 h-4 text-sports-emerald" title="Verified Organizer" />
            </div>
            <span className="text-xs text-slate-400">
              {[city, state].filter(Boolean).join(', ') || 'India'}
            </span>
          </div>
        </div>

        {/* Key Attributes Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 bg-slate-50/60 rounded-2xl p-4 my-6">
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Application Fee</span>
            <span className="text-base font-extrabold text-sports-emerald">{application_fee || 'Free'}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registration Closes</span>
            <span className="text-base font-extrabold text-sports-navy">
              {registration_deadline ? new Date(registration_deadline).toLocaleDateString() : 'Rolling'}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Dates</span>
            <span className="text-base font-extrabold text-sports-navy">
              {starts_on ? new Date(starts_on).toLocaleDateString() : 'TBA'}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eligibility Range</span>
            <span className="text-base font-extrabold text-sports-navy">
              {min_age && max_age ? `${min_age}-${max_age} Years` : 'Open'}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold font-display text-sports-navy uppercase tracking-wider mb-2">
              Event Overview & Details
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Eligibility Criteria */}
          {eligibility && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
              <h4 className="text-xs font-bold text-sports-navy uppercase tracking-wider mb-1">
                Eligibility Requirements
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{eligibility}</p>
            </div>
          )}

          {/* Positions / Roles */}
          {available_positions && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Available Positions / Slots
              </h4>
              <p className="text-sm text-slate-800 font-semibold">{available_positions}</p>
            </div>
          )}

          {/* Instructions */}
          {instructions && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Instructions for Reporting Athletes
              </h4>
              <p className="text-xs text-amber-950 leading-relaxed">{instructions}</p>
            </div>
          )}

          {/* Venue & Location */}
          <div>
            <h3 className="text-base font-bold font-display text-sports-navy uppercase tracking-wider mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sports-blue" />
              Venue & Reporting Location
            </h3>
            <p className="text-sm text-slate-700">
              {venue_address || `${city}, ${state}`}
            </p>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <ApplicationModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          opportunity={opportunity}
          onSuccess={() => {
            alert('Your application was submitted successfully!');
          }}
        />
      )}

    </div>
  );
};
