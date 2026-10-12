import React from 'react';
import { Trophy, ShieldCheck, Target, Users, Award, Heart, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

export const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Badge variant="blue" size="md">OUR MISSION</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-sports-navy">
          Bridging India's Sporting Potential with Opportunity
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          India is brimming with raw athletic talent in every district, taluka, and city. Sports Connect was founded to ensure no athlete's ambition is cut short simply because they weren't discovered.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 border-rose-100 bg-rose-50/20">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-rose-950 mb-2">The Grassroots Challenge</h3>
          <p className="text-xs text-slate-600 leading-relaxed space-y-2">
            Millions of young athletes in tier-2 and tier-3 towns struggle to learn about official selection trials, sports scholarships, and reputable coaching camps until after registration has already closed. Meanwhile, selectors lack centralized digital verification of an athlete's authentic match statistics and physical conditioning.
          </p>
        </Card>

        <Card className="p-8 border-blue-100 bg-blue-50/20">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-sports-blue flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-sports-navy mb-2">The Sports Connect Solution</h3>
          <p className="text-xs text-slate-600 leading-relaxed space-y-2">
            A unified sports-tech platform modeled for sports networking. Athletes build a tamper-resistant digital sports résumé with match statistics, video highlights, and certificates. Organizers publish opportunities, manage applications, and shortlist talent with complete transparency.
          </p>
        </Card>
      </div>

      {/* Platform Pillars */}
      <div>
        <h2 className="text-2xl font-bold font-display text-sports-navy text-center mb-10">
          Four Pillars of Sports Connect
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Discover',
              desc: 'Nationwide marketplace for selection trials, tournaments, scholarships, and camps.',
              icon: Target
            },
            {
              title: 'Showcase',
              desc: 'Digital sports résumés with performance metrics, verified medals, and drill videos.',
              icon: Award
            },
            {
              title: 'Network',
              desc: 'Direct inquiries and mentorship connections with certified coaches and academies.',
              icon: Users
            },
            {
              title: 'Safeguard',
              desc: 'Private contact protections and transparent verification standards for young athletes.',
              icon: ShieldCheck
            }
          ].map((pil, idx) => {
            const Icon = pil.icon;
            return (
              <Card key={idx} className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-sports-blue flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-sports-navy font-display mb-1">{pil.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{pil.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Youth Safeguarding Statement */}
      <div className="p-8 rounded-3xl bg-slate-100 border border-slate-200">
        <div className="flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-sports-emerald shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="text-base font-bold text-sports-navy font-display">Youth Safety & Safeguarding First</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We strictly protect minor athletes. Contact details (phone numbers and emails) are hidden by default from public view and only shared when an athlete deliberately submits an official application to an authenticated opportunity organizer.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
