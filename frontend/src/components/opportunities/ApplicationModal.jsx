import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Send, FileText, CheckCircle2 } from 'lucide-react';

export const ApplicationModal = ({ isOpen, onClose, opportunity, onSuccess }) => {
  const { profile } = useAuth();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!opportunity) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      setError('Please enter your 10-digit mobile number');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (must start with 6, 7, 8, or 9)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.applyForOpportunity(opportunity.id, {
        message,
        contact_phone: cleanPhone,
        contact_email: email
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply: ${opportunity.title}`}>
      {success ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 font-display">Application Submitted!</h4>
          <p className="text-sm text-slate-500 mt-1">
            The organizer has been notified. You can track status in your dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error" message={error} />}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Reviewing Profile Attached:</div>
            <div>Name: <strong>{profile?.full_name}</strong></div>
            <div>Playing Position / Sport: <strong>{opportunity.sports?.name || 'Athlete'}</strong></div>
            <div className="text-[11px] text-slate-400">Your digital sports résumé, achievements, and stats will be automatically shared with the organizer.</div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Contact Phone (for trial call / WhatsApp updates)
              </label>
              <span className="text-[11px] text-slate-400">
                {phone.replace(/\D/g, '').length}/10
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-600 text-xs font-semibold border-r border-slate-200 pr-2.5">
                <span>🇮🇳 +91</span>
              </div>
              <input
                type="tel"
                required
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onKeyDown={(e) => {
                  if (
                    ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) ||
                    e.ctrlKey || e.metaKey
                  ) return;
                  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                }}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length === 12 && val.startsWith('91')) val = val.slice(2);
                  else if (val.length === 11 && val.startsWith('0')) val = val.slice(1);
                  setPhone(val.slice(0, 10));
                }}
                placeholder="9876543210"
                className="w-full pl-20 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue tracking-wide"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              10 digits only, starting with 6, 7, 8, or 9
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@example.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note to Selectors / Coaches (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Highlight your current match readiness, jersey position, or fitness highlights..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={loading} icon={Send}>
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
