import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Trophy, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const OpportunityCard = ({
  opportunity,
  isSaved = false,
  onSaveToggle,
  onApply
}) => {
  const {
    id,
    title,
    category,
    city,
    state,
    starts_on,
    registration_deadline,
    eligibility,
    sports,
    sport,
    organizations,
    organization,
    application_fee
  } = opportunity;

  const sportName = sports?.name || sport?.name || 'Multi-Sport';
  const orgName = organizations?.name || organization?.name || 'Sports Organization';
  const orgLogo = organizations?.logo_url || organization?.logo_url;

  // Format dates
  const deadlineStr = registration_deadline ? new Date(registration_deadline).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Rolling';

  const categoryLabels = {
    trial: { text: 'Selection Trial', variant: 'rose' },
    tournament: { text: 'Tournament', variant: 'blue' },
    camp: { text: 'Training Camp', variant: 'emerald' },
    scholarship: { text: 'Scholarship', variant: 'amber' },
    academy_admission: { text: 'Academy Intake', variant: 'purple' },
    coaching_program: { text: 'Coaching', variant: 'default' }
  };

  const catMeta = categoryLabels[category] || { text: category?.replace('_', ' '), variant: 'blue' };

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full border-slate-200">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={catMeta.variant} size="sm">
              {catMeta.text}
            </Badge>
            <Badge variant="default" size="sm">
              {sportName}
            </Badge>
          </div>
          {onSaveToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSaveToggle(id);
              }}
              className="text-slate-400 hover:text-sports-blue p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title={isSaved ? 'Remove Bookmark' : 'Save Opportunity'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-sports-blue fill-sports-blue" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Title */}
        <Link to={`/opportunities/${id}`} className="group">
          <h3 className="text-base font-bold text-sports-navy font-display line-clamp-2 group-hover:text-sports-blue transition-colors mb-2">
            {title}
          </h3>
        </Link>

        {/* Organization */}
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-600">
          <div className="w-6 h-6 rounded-md bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 font-bold text-[10px]">
            {orgLogo ? <img src={orgLogo} alt={orgName} className="w-full h-full object-cover" /> : orgName.charAt(0)}
          </div>
          <span className="truncate">{orgName}</span>
        </div>

        {/* Meta Details Grid */}
        <div className="space-y-2 text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{[city, state].filter(Boolean).join(', ') || 'Online / Pan-India'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Apply by: <strong className="text-slate-700">{deadlineStr}</strong></span>
          </div>
          {eligibility && (
            <div className="text-[11px] text-slate-500 line-clamp-1 italic">
              Eligibility: {eligibility}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
        <span className="text-xs font-bold text-sports-navy">
          Fee: <span className="text-sports-emerald">{application_fee || 'Free'}</span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            to={`/opportunities/${id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-sports-navy hover:bg-slate-100 transition-colors"
          >
            Details
          </Link>
          {onApply && (
            <button
              onClick={() => onApply(opportunity)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sports-blue text-white hover:bg-sports-blueHover transition-colors shadow-sm"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
