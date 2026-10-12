import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-sports-blue flex items-center justify-center mx-auto shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>
        <span className="text-6xl font-black font-display text-sports-navy block">404</span>
        <h1 className="text-2xl font-bold font-display text-slate-800">
          Out of Bounds! Page Not Found
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          The sports opportunity or page you are looking for may have expired, moved, or never existed.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
          <Link to="/opportunities">
            <Button variant="outline" icon={Search}>
              Browse Opportunities
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
