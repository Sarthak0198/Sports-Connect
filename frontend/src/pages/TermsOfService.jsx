import React from 'react';
import { Shield, FileText } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2">
        <Badge variant="blue" size="sm">USER AGREEMENT</Badge>
        <h1 className="text-3xl font-extrabold font-display text-sports-navy">
          Terms of Service & Code of Conduct
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: October 2026 · Standard terms for Indian sports platform
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-sports-navy">1. Acceptance of Terms</h2>
          <p>
            By accessing or registering with Sports Connect, you agree to comply with and be bound by these Terms of Service. If you do not agree, do not access or use the services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-sports-navy">2. User Conduct & Integrity of Statistics</h2>
          <p>
            Athletes and coaches warrant that all match scores, competition medals, timing records, and age credentials provided are accurate and truthful. Fabricating sports achievements or misrepresenting age categories constitutes immediate grounds for account revocation and blacklist from partner tournament combines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-sports-navy">3. Opportunity Publishing Rules</h2>
          <p>
            Organizers publishing trials, tournaments, or camps must clearly disclose:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Accurate age eligibility limits and verification procedures.</li>
            <li>Exact reporting dates, venue coordinates, and transparent registration fees (if any).</li>
            <li>No fake trials or unverified recruitment promises.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-sports-navy">4. Anti-Doping & Sportsmanship</h2>
          <p>
            Sports Connect adheres to fair play principles supported by the National Anti-Doping Agency (NADA) and the World Anti-Doping Code. We encourage honest athletic pursuit, disciplined training, and mutual respect among competitors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-sports-navy">5. Governing Law</h2>
          <p>
            These terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of courts located in Maharashtra, India.
          </p>
        </section>
      </div>
    </div>
  );
};
