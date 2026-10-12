import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

export const OpportunityFilter = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sportId,
  onSportChange,
  state,
  onStateChange,
  sports = [],
  onReset
}) => {
  const categories = [
    { id: '', label: 'All Opportunities' },
    { id: 'trial', label: 'Selection Trials' },
    { id: 'tournament', label: 'Tournaments' },
    { id: 'camp', label: 'Training Camps' },
    { id: 'scholarship', label: 'Scholarships' },
    { id: 'academy_admission', label: 'Academy Admissions' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-8">
      {/* Search Bar & Reset */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trials, tournaments, academies, or locations..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sports-blue focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Sport</label>
          <select
            value={sportId}
            onChange={(e) => onSportChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sports-blue"
          >
            <option value="">All Sports (Cricket, Kabaddi, etc.)</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">State / Region</label>
          <input
            type="text"
            placeholder="e.g. Maharashtra, Karnataka, Delhi"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sports-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sports-blue"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Quick Select */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-3 border-t border-slate-100 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onCategoryChange(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === c.id
                ? 'bg-sports-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};
