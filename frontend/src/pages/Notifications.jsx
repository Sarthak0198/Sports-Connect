import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../api/client';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.warn('Notifications load note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      alert(err.message || 'Failed to mark notifications read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.warn('Mark read notice:', err.message);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your notifications..." />;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sports-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-sports-navy">
            Notifications Center
          </h1>
          {unreadCount > 0 && (
            <Badge variant="blue" size="sm">
              {unreadCount} NEW
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Real-time alerts regarding application statuses, trial calls, and mentor replies.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! New application updates and inquiry replies will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => handleMarkRead(notif.id)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${
                !notif.is_read ? 'border-blue-300 bg-blue-50/20 shadow-sm' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!notif.is_read ? 'bg-sports-blue' : 'bg-slate-300'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {notif.link && (
                <Link
                  to={notif.link}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-sports-blue hover:bg-blue-50 flex items-center gap-1 shrink-0"
                >
                  View <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
