import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, Shield, Award, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-sports-navy text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sports-blue flex items-center justify-center text-white shadow-glow">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight font-display text-white">
                SPORTS<span className="text-sports-cyan">CONNECT</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
              India's sports networking and discovery platform. Connecting aspiring athletes, certified coaches, clubs, academies, and event organizers nationwide.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sports-blue shrink-0" />
                <span>Shivaji Stadium Complex, Satara / Pune / Mumbai, Maharashtra</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sports-blue shrink-0" />
                <span>contact@sportsconnect.in</span>
              </div>
            </div>
          </div>

          {/* Opportunities Column */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-display">
              Opportunities
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/opportunities?category=trial" className="hover:text-white transition-colors">Selection Trials</Link></li>
              <li><Link to="/opportunities?category=tournament" className="hover:text-white transition-colors">Tournaments & Cups</Link></li>
              <li><Link to="/opportunities?category=camp" className="hover:text-white transition-colors">Training Camps</Link></li>
              <li><Link to="/opportunities?category=scholarship" className="hover:text-white transition-colors">Sports Scholarships</Link></li>
              <li><Link to="/opportunities?category=academy_admission" className="hover:text-white transition-colors">Academy Admissions</Link></li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-display">
              Community
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/athletes" className="hover:text-white transition-colors">Explore Athletes</Link></li>
              <li><Link to="/coaches" className="hover:text-white transition-colors">Find Coaches</Link></li>
              <li><Link to="/organizations" className="hover:text-white transition-colors">Academies & Clubs</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Sports Connect</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Join as Talent Scout</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-display">
              Platform & Safety
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Youth Safeguarding</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Anti-Doping Policy</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Verification Standards</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Sports Connect. All rights reserved. Built for India's sporting future.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Connect. Compete. Grow.</span>
            <span className="text-slate-600">|</span>
            <span className="text-sports-emerald flex items-center gap-1 font-semibold">
              <Shield className="w-3.5 h-3.5" /> Verified Sports Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
