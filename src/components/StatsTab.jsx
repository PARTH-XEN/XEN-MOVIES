import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Clock, Film, Bookmark, Download, Award, ShieldCheck } from 'lucide-react';

export default function StatsTab() {
  const { stats, history, watchlist, downloads } = useApp();

  const totalHours = stats?.totalHoursWatched || 0;
  const cinemaLevel = totalHours > 50 ? 'Cinephile Master' : totalHours > 20 ? 'Movie Enthusiast' : 'Film Explorer';

  return (
    <div className="max-w-4xl space-y-6 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-[var(--color-accent)]" />
          <span>Cinema Statistics</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Your personal streaming activity and local playback metrics
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">Time</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalHours} <span className="text-xs font-normal text-neutral-400">hrs</span>
          </div>
          <div className="text-[11px] text-neutral-400">Total Stream Time</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <Film className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">History</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {history?.length || 0}
          </div>
          <div className="text-[11px] text-neutral-400">Titles Played</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">Saved</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {watchlist?.length || 0}
          </div>
          <div className="text-[11px] text-neutral-400">Watchlist Items</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">Downloads</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {downloads?.length || 0}
          </div>
          <div className="text-[11px] text-neutral-400">Downloads Captured</div>
        </div>

      </div>

      {/* Cinephile Badge Card */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Member Status</span>
            </div>
            <h2 className="text-lg font-bold text-white">{cinemaLevel}</h2>
            <p className="text-xs text-neutral-400">Your private library is synchronized automatically.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Vault Synced</span>
        </div>
      </div>

    </div>
  );
}

