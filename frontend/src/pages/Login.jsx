import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';

export const Login = () => {
  const navigate = useNavigate();
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (role) => {
    setLoading(true);
    setError('');
    try {
      await quickDemoLogin(role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sports-navy text-white mx-auto flex items-center justify-center shadow-md">
            <Trophy className="w-6 h-6 text-sports-cyan" />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-sports-navy">
            Sign In to Sports Connect
          </h2>
          <p className="text-xs text-slate-500">
            Connect. Compete. Grow. Access your athletic dashboard.
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-xl">
          {error && <Alert type="error" message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@sportsconnect.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-sports-blue hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full py-2.5 mt-2">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Selector for Reviewers / College Presentation */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              ⚡ Instant 1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill('athlete')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sports-blue hover:bg-blue-50/50 text-slate-700 font-semibold text-left transition-colors"
              >
                🏃 Athlete (Aarav)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('coach')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sports-blue hover:bg-blue-50/50 text-slate-700 font-semibold text-left transition-colors"
              >
                🧢 Coach (Vikram)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('club')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sports-blue hover:bg-blue-50/50 text-slate-700 font-semibold text-left transition-colors"
              >
                🏛️ Academy Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('organizer')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sports-blue hover:bg-blue-50/50 text-slate-700 font-semibold text-left transition-colors"
              >
                🏆 Event Organizer
              </button>
            </div>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          New to Sports Connect?{' '}
          <Link to="/register" className="font-bold text-sports-blue hover:underline">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
};
