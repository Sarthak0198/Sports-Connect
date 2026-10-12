import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Send,
  UserCheck
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const CoachDashboard = ({ profile }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const loadInquiries = async () => {
    try {
      const data = await api.getMyInquiries();
      setInquiries(data || []);
    } catch (err) {
      console.warn('Inquiries fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyText.trim()) return;
    setReplying(true);
    try {
      await api.replyToInquiry(selectedInquiry.id, replyText.trim());
      setSelectedInquiry(null);
      setReplyText('');
      loadInquiries();
    } catch (err) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Coach Dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sports-navy to-sports-navyLight rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <Badge variant="blue" size="sm" className="mb-3 bg-blue-500/20 text-sports-cyan border-blue-400/30">
          COACHING COMMAND CENTER
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
          Welcome, {profile?.full_name}!
        </h1>
        <p className="text-slate-300 text-sm mt-2 max-w-xl">
          Review incoming training inquiries, manage programs, and scout emerging athletic talent.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-sports-blue flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">{inquiries.length}</div>
            <div className="text-xs font-medium text-slate-500">Inquiries Received</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">
              {inquiries.filter(i => i.status === 'pending').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Pending Response</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-sports-emerald flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">Active</div>
            <div className="text-xs font-medium text-slate-500">Trainee Intake</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-sports-navy font-display">Verified</div>
            <div className="text-xs font-medium text-slate-500">Coach Accreditation</div>
          </div>
        </Card>
      </div>

      {/* Inquiries List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sports-blue" />
            <h3 className="text-lg font-bold font-display text-sports-navy">Direct Coaching Inquiries</h3>
          </div>
          <Link to="/inquiries" className="text-xs font-bold text-sports-blue hover:underline">
            Manage All
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No student inquiries received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700">
                      {inq.athlete?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{inq.athlete?.full_name || 'Athletic Trainee'}</h4>
                      <span className="text-xs text-slate-400">{inq.athlete?.city || 'India'}</span>
                    </div>
                  </div>
                  <Badge variant={inq.status === 'replied' ? 'emerald' : 'amber'} size="sm">
                    {inq.status?.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-3">
                  "{inq.message}"
                </p>

                {inq.reply && (
                  <div className="text-xs text-emerald-800 bg-emerald-50/80 p-3 rounded-xl mb-3 border border-emerald-200">
                    <strong>Your Reply:</strong> {inq.reply}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                  {inq.status !== 'replied' && (
                    <Button size="sm" variant="primary" onClick={() => setSelectedInquiry(inq)}>
                      Reply to Athlete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Reply Modal */}
      <Modal isOpen={!!selectedInquiry} onClose={() => setSelectedInquiry(null)} title="Reply to Coaching Inquiry">
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <strong>Athlete Question:</strong> "{selectedInquiry?.message}"
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Direct Response</label>
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Provide slot availability, training schedule, or trial assessment instructions..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setSelectedInquiry(null)}>Cancel</Button>
            <Button variant="primary" isLoading={replying} onClick={handleSendReply} icon={Send}>
              Send Reply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
