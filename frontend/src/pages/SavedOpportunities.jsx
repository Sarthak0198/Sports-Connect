import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft, Trash2, Send } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ApplicationModal } from '../components/opportunities/ApplicationModal';
import { api } from '../api/client';

export const SavedOpportunities = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingOpportunity, setApplyingOpportunity] = useState(null);

  const loadSaved = async () => {
    try {
      const data = await api.getMySavedOpportunities();
      setSavedItems(data || []);
    } catch (err) {
      console.warn('Saved opps error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (oppId) => {
    try {
      await api.unsaveOpportunity(oppId);
      setSavedItems(savedItems.filter(s => (s.opportunity_id || s.opportunities?.id) !== oppId));
    } catch (err) {
      alert(err.message || 'Failed to remove saved opportunity');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your bookmarks..." />;

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
          Saved Opportunities ({savedItems.length})
        </h1>
        <p className="text-xs text-slate-500">
          Bookmarked selection trials, camps, and competitions you plan to apply for.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved opportunities"
          description="Browse the marketplace and bookmark trials to apply later."
          actionText="Browse Marketplace"
          onAction={() => window.location.href = '/opportunities'}
        />
      ) : (
        <div className="space-y-4">
          {savedItems.map((item) => {
            const opp = item.opportunities || {};
            const oppId = item.opportunity_id || opp.id;

            return (
              <Card key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="blue" size="sm">
                      {opp.category?.replace('_', ' ').toUpperCase() || 'OPPORTUNITY'}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400">
                      {opp.sports?.name || 'Sport'}
                    </span>
                  </div>

                  <Link to={`/opportunities/${oppId}`} className="text-base font-bold text-slate-800 hover:text-sports-blue">
                    {opp.title || 'Sports Event'}
                  </Link>

                  <div className="text-xs text-slate-500 mt-1">
                    Venue: {[opp.city, opp.state].filter(Boolean).join(', ') || 'India'} · Deadline: {opp.registration_deadline || 'Rolling'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Send}
                    onClick={() => setApplyingOpportunity(opp)}
                  >
                    Apply Now
                  </Button>
                  <button
                    onClick={() => handleRemove(oppId)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {applyingOpportunity && (
        <ApplicationModal
          isOpen={!!applyingOpportunity}
          onClose={() => setApplyingOpportunity(null)}
          opportunity={applyingOpportunity}
          onSuccess={() => {
            alert('Application submitted!');
          }}
        />
      )}
    </div>
  );
};
