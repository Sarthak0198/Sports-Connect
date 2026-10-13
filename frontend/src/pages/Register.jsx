import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, User, Phone, MapPin, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { api } from '../api/client';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [sports, setSports] = useState([]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('athlete');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [primarySportId, setPrimarySportId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listSports().then(data => setSports(data || [])).catch(() => {});
  }, []);

  const handlePhoneKeyDown = (e) => {
    // Allow navigation, control keys, backspace, delete, tab, enter
    if (
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) ||
      e.ctrlKey || e.metaKey
    ) {
      return;
    }
    // Restrict usage of letters and special characters (only allow 0-9)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e) => {
    // Strip all non-digit characters
    let val = e.target.value.replace(/\D/g, '');
    // If pasted with country code (+91 / 91) or leading 0, clean it
    if (val.length === 12 && val.startsWith('91')) {
      val = val.slice(2);
    } else if (val.length === 11 && val.startsWith('0')) {
      val = val.slice(1);
    }
    // Restrict maximum length to 10 digits
    setPhone(val.slice(0, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fullName.trim().length > 200) {
      setError('Full name cannot exceed 200 characters');
      return;
    }

    if (!phone) {
      setError('Please enter your 10-digit mobile number');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (must start with 6, 7, 8, or 9)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        full_name: fullName.trim(),
        phone,
        email,
        password,
        role,
        city,
        state,
        primary_sport_id: primarySportId || null
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sports-navy text-white mx-auto flex items-center justify-center shadow-md">
            <Trophy className="w-6 h-6 text-sports-cyan" />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-sports-navy">
            Create Your Sports Connect Profile
          </h2>
          <p className="text-xs text-slate-500">
            Join India's sports networking platform. Connect. Compete. Grow.
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-8 shadow-xl">
          {error && <Alert type="error" message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Type / Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'athlete', label: 'Athlete', icon: '🏃' },
                  { id: 'coach', label: 'Coach', icon: '🧢' },
                  { id: 'club', label: 'Club / Academy', icon: '🏛️' },
                  { id: 'organizer', label: 'Organizer', icon: '🏆' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      role === r.id
                        ? 'border-sports-blue bg-blue-50 text-sports-blue font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{r.icon}</div>
                    <div className="text-[11px] leading-tight">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name / Organization Name
                </label>
                <span className="text-[11px] text-slate-400">
                  {fullName.length}/200
                </span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.slice(0, 200))}
                  placeholder="e.g. Aarav Sharma or Satara Academy"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mobile Number (India)
                </label>
                <span className="text-[11px] text-slate-400">
                  {phone.length}/10
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-600 text-xs font-semibold border-r border-slate-200 pr-2.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onKeyDown={handlePhoneKeyDown}
                  onChange={handlePhoneChange}
                  placeholder="9876543210"
                  className="w-full pl-20 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue tracking-wide"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                10 digits only, starting with 6, 7, 8, or 9 (letters & special characters blocked)
              </p>
            </div>

            {/* Email */}
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
                  placeholder="athlete@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (minimum 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
                />
              </div>
            </div>

            {/* Location: City and State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Satara"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
                />
              </div>
            </div>

            {/* Primary Sport */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Sport Discipline
              </label>
              <select
                value={primarySportId}
                onChange={(e) => setPrimarySportId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              >
                <option value="">Select Primary Sport</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full py-2.5 mt-4">
              Join Sports Connect
            </Button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            By signing up, you agree to our Terms of Service and Youth Safeguarding Guidelines.
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-sports-blue hover:underline">
            Sign In here
          </Link>
        </p>

      </div>
    </div>
  );
};
