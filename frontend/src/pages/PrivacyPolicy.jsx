import React from 'react';
import { ShieldCheck, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2">
        <Badge variant="emerald" size="sm">LEGAL & COMPLIANCE</Badge>
        <h1 className="text-3xl font-extrabold font-display text-sports-navy">
          Privacy Policy & Youth Safeguarding
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: October 2026 · Governing sports data protection across India
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-base font-bold text-sports-navy mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-sports-blue" /> 1. Commitment to Athletic Data Security
          </h2>
          <p>
            Sports Connect ("Platform") respects the privacy and safeguarding of athletes, coaches, and sports organizations. This policy explains what information is collected, how performance statistics are stored, and our strict safeguards regarding minors and student athletes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-sports-navy">2. Information Collected</h2>
          <p>
            When registering, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Account credentials: Full name, verified email, phone number, and physical city/state.</li>
            <li>Athletic data: Primary sports discipline, playing position, physical measurements, competitive level.</li>
            <li>Performance records: Competition honors, medals, certified match statistics, and verified training certificates.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-sports-navy">3. Minor Athlete Safeguarding</h2>
          <p>
            For athletes under 18 years of age, direct personal contact details (phone number, WhatsApp, residential address) are strictly protected. These details are never indexed by public search engines and are only disclosed to authenticated tournament organizers upon deliberate application submission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-sports-navy">4. Storage & Row Level Security</h2>
          <p>
            All application data is protected by Supabase PostgreSQL Row Level Security (RLS) policies. Private documents, certificates, and medical verification forms are stored in isolated encrypted storage buckets accessible solely to the user and authorized club selectors.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-sports-navy">5. Contact Information</h2>
          <p>
            For privacy inquiries or account data deletion requests, contact our Compliance Officer at <strong>compliance@sportsconnect.in</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};
