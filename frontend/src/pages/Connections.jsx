import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, UserPlus, Check, X, Trash2, ShieldCheck, MapPin } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Connections = () => {
  const { profile } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = async () => {
    try {
      const data = await api.listConnections();
      setConnections(data || []);
    } catch (err) {
      console.warn('Connections fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleUpdateStatus = async (connId, status) => {
    try {
      await api.updateConnectionStatus(connId, status);
      loadConnections();
    } catch (err) {
      alert(err.message || 'Failed to update connection');
    }
  };

  const handleRemove = async (connId) => {
    if (!window.confirm('Remove connection?')) return;
    try {
      await api.removeConnection(connId);
      loadConnections();
    } catch (err) {
      alert(err.message || 'Failed to remove connection');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your sports network..." />;

  const pendingRequests = connections.filter(c => c.status === 'pending' && c.receiver_id === profile?.id);
  const activeConnections = connections.filter(c => c.status === 'accepted');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
          Sports Network & Connections
        </h1>
        <p className="text-xs text-slate-500">
          Connect with peer athletes, certified trainers, and talent scouts across India.
        </p>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold font-display text-sports-navy uppercase tracking-wider">
            Pending Connection Requests ({pendingRequests.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="p-4 flex items-center justify-between gap-3 border-blue-200 bg-blue-50/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sports-navy text-white flex items-center justify-center font-bold text-sm">
                    {req.requester?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{req.requester?.full_name}</h4>
                    <span className="text-[11px] text-slate-500 capitalize">{req.requester?.role} · {req.requester?.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'accepted')}
                    className="p-1.5 bg-sports-emerald text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'declined')}
                    className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                    title="Decline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Connections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-display text-sports-navy uppercase tracking-wider">
            Your Connections ({activeConnections.length})
          </h3>
          <Link to="/athletes" className="text-xs font-bold text-sports-blue hover:underline">
            Discover More Athletes →
          </Link>
        </div>

        {activeConnections.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No connections yet"
            description="Explore athlete and coach directories to connect with peers and mentors."
            actionText="Find Athletes"
            onAction={() => window.location.href = '/athletes'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeConnections.map((conn) => {
              const other = conn.requester_id === profile?.id ? conn.receiver : conn.requester;
              const otherUser = other || { full_name: 'Coach Vikram Rathore', role: 'coach', city: 'Mumbai' };

              return (
                <Card key={conn.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sports-navy text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {otherUser.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{otherUser.full_name}</h4>
                      <span className="text-[11px] text-sports-blue font-semibold capitalize block">
                        {otherUser.role}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {otherUser.city || 'India'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(conn.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove connection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
