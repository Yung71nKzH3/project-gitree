import React from 'react';
import { Search, X, Lock, Globe, ArrowUpDown, Filter } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  availableLanguages: string[];
  totalVisible: number;
  totalPrivate: number;
  totalPublic: number;
  unfiledCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  availableLanguages,
  totalVisible,
  totalPrivate,
  totalPublic,
  unfiledCount,
}) => {
  return (
    <div className="bg-[#0D131F]/90 border-b border-slate-800/80 px-4 md:px-6 py-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input + Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search box */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filter.query}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              placeholder="Search repos by name, topic, or language..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-lg text-slate-200 placeholder:text-slate-500 transition-colors outline-none"
            />
            {filter.query && (
              <button
                onClick={() => onFilterChange({ query: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Visibility Segmented Control */}
          <div className="bg-slate-900 border border-slate-800/90 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => onFilterChange({ visibility: 'all' })}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter.visibility === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({totalVisible})
            </button>
            <button
              onClick={() => onFilterChange({ visibility: 'private' })}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter.visibility === 'private'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Private ({totalPrivate})</span>
            </button>
            <button
              onClick={() => onFilterChange({ visibility: 'public' })}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter.visibility === 'public'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3 text-sky-400" />
              <span>Public ({totalPublic})</span>
            </button>
          </div>

          {/* Language filter dropdown */}
          <select
            value={filter.language}
            onChange={(e) => onFilterChange({ language: e.target.value })}
            className="bg-slate-900 text-slate-300 text-xs border border-slate-800 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <select
              value={`${filter.sortBy}-${filter.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
                onFilterChange({ sortBy, sortOrder });
              }}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="pushed-desc" className="bg-slate-900">Recently Pushed</option>
              <option value="updated-desc" className="bg-slate-900">Recently Updated</option>
              <option value="stars-desc" className="bg-slate-900">Most Stars</option>
              <option value="name-asc" className="bg-slate-900">Name (A-Z)</option>
              <option value="name-desc" className="bg-slate-900">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Clean unboxed metadata discipline */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono shrink-0">
          <span>{totalVisible} matching</span>
          <span aria-hidden="true">·</span>
          <span>{totalPrivate} private</span>
          <span aria-hidden="true">·</span>
          <span className={unfiledCount > 0 ? 'text-amber-400/90 font-medium' : ''}>
            {unfiledCount} unfiled
          </span>
        </div>
      </div>
    </div>
  );
};
