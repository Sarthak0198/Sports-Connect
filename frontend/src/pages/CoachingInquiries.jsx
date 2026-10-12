import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Send, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CoachingInquiries = () => {
  const { profile } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reply modal state (for coaches)
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const loadInquiries = async () => {
    try {
      const data = await api.getMyInquiries();
      setInquiries(data || []);
    } catch (err) {
      console.warn('Inquiries load note:', err.message);
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

  if (loading) return <LoadingSpinner text="Loading coaching inquiries..." />;

  const isCoach = profile?.role === 'coach';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
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
          Coaching Inquiries ({inquiries.length})
        </h1>
        <p className="text-xs text-slate-500">
          {isCoach
            ? 'Messages and slot assessment requests from student athletes.'
            : 'Track responses to inquiries sent to certified coaches.'}
        </p>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No inquiries found"
          description={isCoach ? "You have no pending student inquiries." : "Find a coach and ask about their training slots."}
          actionText={isCoach ? undefined : "Browse Coaches"}
          onAction={isCoach ? undefined : () => window.location.href = '/coaches'}
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <Card key={inq.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sports-navy text-white flex items-center justify-center font-bold text-sm">
                    {isCoach ? (inq.athlete?.full_name?.charAt(0) || 'A') : (inq.coach?.full_name?.charAt(0) || 'C')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {isCoach ? inq.athlete?.full_name : `Coach: ${inq.coach?.full_name}`}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Badge variant={inq.status === 'replied' ? 'emerald' : 'amber'} size="sm">
                  {inq.status?.toUpperCase()}
                </Badge>
              </div>

              {/* Message */}
              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inquiry Message</div>
                "{inq.message}"
              </div>

              {/* Coach Reply */}
              {inq.reply ? (
                <div className="bg-emerald-50/70 p-4 rounded-xl text-xs text-emerald-950 leading-relaxed border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Response from Coach
                  </div>
                  {inq.reply}
                </div>
              ) : isCoach ? (
                <div className="flex justify-end pt-2">
                  <Button size="sm" variant="primary" onClick={() => setSelectedInquiry(inq)}>
                    Reply to Athlete
                  </Button>
                </div>
              ) : (
                <div className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Awaiting response from coach...
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      <Modal isOpen={!!selectedInquiry} onClose={() => setSelectedInquiry(null)} title="Send Response to Athlete">
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <strong>Athlete Inquiry:</strong> "{selectedInquiry?.message}"
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Direct Reply</label>
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Provide slot confirmation or reporting instructions..."
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
