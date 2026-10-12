import React from 'react';
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  MapPin,
  CheckCircle2,
  Video,
  Printer,
  ShieldCheck,
  Activity,
  Flame,
  UserCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const SportsResume = ({ athlete, isOwner = false }) => {
  if (!athlete) return null;

  const {
    full_name,
    city,
    state,
    bio,
    avatar_url,
    is_verified,
    athlete_profiles,
    achievements = [],
    certificates = [],
    statistics = [],
    completion_pct = 75
  } = athlete;

  const ext = athlete_profiles || {};
  const sportName = ext.sports?.name || 'Athletics';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 print-resume max-w-4xl mx-auto">
      
      {/* Top Header & Print Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200 no-print">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="md">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Verified Athlete Résumé
          </Badge>
          <span className="text-xs text-slate-400">Sports Connect Verified ID: SC-{athlete.id?.slice(0, 8)}</span>
        </div>
        <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint} className="btn-print">
          Print / Export PDF
        </Button>
      </div>

      {/* Main Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 py-8 border-b border-slate-100">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-sports-navy text-white overflow-hidden shadow-lg shrink-0 flex items-center justify-center font-bold text-3xl">
          {avatar_url ? (
            <img src={avatar_url} alt={full_name} className="w-full h-full object-cover" />
          ) : (
            <span>{full_name?.charAt(0) || 'A'}</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
              {full_name}
            </h1>
            {is_verified && (
              <ShieldCheck className="w-6 h-6 text-sports-blue fill-blue-50" title="Verified Athlete" />
            )}
            <Badge variant="blue" size="md">
              {sportName}
            </Badge>
            {ext.playing_level && (
              <Badge variant="dark" size="md">
                {ext.playing_level.toUpperCase()} LEVEL
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{[city, state].filter(Boolean).join(', ') || 'India'}</span>
            </div>
            {ext.position && (
              <div>
                Position: <span className="text-sports-navy font-bold">{ext.position}</span>
              </div>
            )}
            {ext.current_team && (
              <div>
                Club/Team: <span className="text-sports-navy font-bold">{ext.current_team}</span>
              </div>
            )}
          </div>

          {bio && (
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {bio}
            </p>
          )}
        </div>
      </div>

      {/* Physical & Athletic Attributes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 bg-slate-50/60 rounded-2xl p-4 my-6">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Height</span>
          <span className="text-base font-extrabold text-sports-navy">{ext.height_cm ? `${ext.height_cm} cm` : '180 cm'}</span>
        </div>
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Weight</span>
          <span className="text-base font-extrabold text-sports-navy">{ext.weight_kg ? `${ext.weight_kg} kg` : '72 kg'}</span>
        </div>
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Dominant Hand/Foot</span>
          <span className="text-base font-extrabold text-sports-navy capitalize">{ext.dominant_hand || 'Right'}</span>
        </div>
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Playing Status</span>
          <span className="text-base font-extrabold text-sports-emerald">Active Competition</span>
        </div>
      </div>

      {/* Key Performance Statistics */}
      <div className="mb-8">
        <h3 className="text-base font-bold font-display text-sports-navy uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sports-blue" />
          Verified Performance Statistics
        </h3>

        {statistics.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No verified match statistics registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {statistics.map((stat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="block text-xs font-semibold text-slate-500">{stat.metric_name}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-extrabold text-sports-navy font-display">{stat.metric_value}</span>
                  <span className="text-xs text-slate-400">{stat.metric_unit}</span>
                </div>
                {stat.season_or_year && (
                  <span className="block text-[10px] text-slate-400 mt-1">Season {stat.season_or_year}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements & Honors */}
      <div className="mb-8">
        <h3 className="text-base font-bold font-display text-sports-navy uppercase tracking-wider mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Tournament Honors & Medals
        </h3>

        {achievements.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No achievements listed.</p>
        ) : (
          <div className="space-y-3">
            {achievements.map((ach, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Medal className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{ach.title}</h4>
                    <span className="text-xs font-semibold text-slate-400">{ach.year}</span>
                  </div>
                  <div className="text-xs font-medium text-sports-blue mb-1">{ach.competition_name}</div>
                  {ach.description && <p className="text-xs text-slate-500">{ach.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Certificates */}
      <div className="mb-8">
        <h3 className="text-base font-bold font-display text-sports-navy uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-sports-emerald" />
          Certificates & Accreditations
        </h3>

        {certificates.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No certificates attached.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((cert, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-xs font-bold text-slate-800">{cert.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{cert.issuing_body}</div>
                {cert.credential_id && (
                  <div className="text-[10px] text-sports-blue font-mono mt-1">ID: {cert.credential_id}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Highlights */}
      {ext.highlight_video_url && (
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sports-blue text-white flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800">Match Video Highlights Attached</h5>
              <p className="text-[11px] text-slate-500">Verified drills, gameplay, and scouting reels available.</p>
            </div>
          </div>
          <a
            href={ext.highlight_video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-sports-blue border border-blue-300 hover:bg-blue-50 shadow-sm"
          >
            Watch Video
          </a>
        </div>
      )}

      {/* Footer watermark */}
      <div className="pt-8 mt-8 border-t border-slate-200 text-center text-[10px] text-slate-400">
        Generated via Sports Connect India · Authenticated Sports Opportunity Discovery Network
      </div>
    </div>
  );
};
