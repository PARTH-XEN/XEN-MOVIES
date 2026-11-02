import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Clock, Film, Bookmark, Download, Award, Sparkles } from 'lucide-react';

export default function StatsTab() {
  const { stats, history, watchlist, downloads } = useApp();

  const totalHours = stats.totalHoursWatched || 0;
  const cinemaLevel = totalHours > 50 ? 'Cinephile Master' : totalHours > 20 ? 'Movie Enthusiast' : 'Film Explorer';

  return (
    <div className="max-w-4xl space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-purple-400" />
          <span>My Cinema Stats & Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your personal streaming metrics calculated from local SQLite history
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-[#0e1222] border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10">Time</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {totalHours} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-xs text-slate-400">Total Stream Time</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e1222] border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <Film className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10">History</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {history.length}
          </div>
          <div className="text-xs text-slate-400">Titles Played</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e1222] border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10">Saved</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {watchlist.length}
          </div>
          <div className="text-xs text-slate-400">Watchlist Items</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e1222] border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <Download className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10">Magnets</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {downloads.length}
          </div>
          <div className="text-xs text-slate-400">Downloads Captured</div>
        </div>

      </div>

      {/* Cinephile Badge Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0e1222] to-cyan-950/40 border border-purple-500/30 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Member Status</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-black text-white">{cinemaLevel}</h2>
            <p className="text-xs text-slate-400">Your local cinema library is growing automatically!</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            Offline Vault Active
          </span>
        </div>
      </div>

    </div>
  );
}

