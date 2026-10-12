import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ArrowLeft, Shield, Bell, Lock, User, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const AccountSettings = () => {
  const { profile, refreshProfile } = useAuth();
  const [visibility, setVisibility] = useState(profile?.visibility || 'public');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      await api.updateMyProfile({
        visibility,
        phone
      });
      await refreshProfile();
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
          Account Settings & Privacy
        </h1>
        <p className="text-xs text-slate-500">
          Manage scouting visibility, contact safeguards, and account credentials.
        </p>
      </div>

      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Profile Visibility Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-sports-blue" />
            <h3 className="text-sm font-bold font-display text-sports-navy">
              Sports Profile Visibility
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'public',
                title: 'Public (Recommended)',
                desc: 'Visible to state selectors, certified coaches, and academy recruiters across India.'
              },
              {
                id: 'connections',
                title: 'Connections Only',
                desc: 'Only approved connections can see full performance statistics and videos.'
              },
              {
                id: 'private',
                title: 'Private',
                desc: 'Hidden from directories; only visible to organizers when you submit an application.'
              }
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  visibility === opt.id
                    ? 'border-sports-blue bg-blue-50/40 text-sports-navy'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={opt.id}
                  checked={visibility === opt.id}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="mt-1 text-sports-blue focus:ring-sports-blue"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{opt.title}</div>
                  <div className="text-[11px] text-slate-500">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Contact Protection Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-sports-emerald" />
            <h3 className="text-sm font-bold font-display text-sports-navy">
              Emergency & Scout Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email</label>
              <input
                type="text"
                disabled
                value={profile?.email || ''}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Phone numbers are shielded under our youth safeguarding rules and only shared with organizers upon direct application.
          </p>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={saving}>
            Save Settings
          </Button>
        </div>

      </form>
    </div>
  );
};
