import React, { useState, useEffect } from 'react';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { OpportunityFilter } from '../components/opportunities/OpportunityFilter';
import { ApplicationModal } from '../components/opportunities/ApplicationModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Opportunities = () => {
  const { isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [sports, setSports] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sportId, setSportId] = useState('');
  const [state, setState] = useState('');

  // Application Modal state
  const [applyingOpportunity, setApplyingOpportunity] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [oppsData, sportsData, savedData] = await Promise.all([
        api.listOpportunities({
          search: search || undefined,
          category: category || undefined,
          sport_id: sportId || undefined,
          state: state || undefined
        }),
        api.listSports().catch(() => []),
        isAuthenticated ? api.getMySavedOpportunities().catch(() => []) : []
      ]);

      setOpportunities(oppsData || []);
      setSports(sportsData || []);

      if (savedData && Array.isArray(savedData)) {
        const ids = new Set(savedData.map(s => s.opportunity_id || s.opportunities?.id));
        setSavedIds(ids);
      }
    } catch (err) {
      console.warn('Opportunities load note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, sportId, state]);

  const handleSaveToggle = async (oppId) => {
    if (!isAuthenticated) {
      alert('Please log in to save opportunities to your dashboard.');
      return;
    }

    const next = new Set(savedIds);
    if (next.has(oppId)) {
      next.delete(oppId);
      setSavedIds(next);
      await api.unsaveOpportunity(oppId).catch(() => {});
    } else {
      next.add(oppId);
      setSavedIds(next);
      await api.saveOpportunity(oppId).catch(() => {});
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSportId('');
    setState('');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="blue" size="sm">OPPORTUNITIES MARKETPLACE</Badge>
        <h1 className="text-3xl font-extrabold font-display text-sports-navy">
          Discover Selection Trials, Tournaments & Camps
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Apply directly to official selection combines, district tournaments, and high-performance training camps across India.
        </p>
      </div>

      {/* Filter Component */}
      <OpportunityFilter
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sportId={sportId}
        onSportChange={setSportId}
        state={state}
        onStateChange={setState}
        sports={sports}
        onReset={handleResetFilters}
      />

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Searching live sports opportunities..." />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No opportunities found"
          description="Try broadening your category or sport filters to view all listings."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isSaved={savedIds.has(opp.id)}
              onSaveToggle={handleSaveToggle}
              onApply={(o) => {
                if (!isAuthenticated) {
                  alert('Please sign in or create an account to apply.');
                } else {
                  setApplyingOpportunity(o);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Application Modal */}
      {applyingOpportunity && (
        <ApplicationModal
          isOpen={!!applyingOpportunity}
          onClose={() => setApplyingOpportunity(null)}
          opportunity={applyingOpportunity}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

    </div>
  );
};
