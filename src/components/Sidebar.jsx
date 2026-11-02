import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, 
  Film, 
  Tv, 
  Sparkles, 
  Bookmark, 
  Clock, 
  Download, 
  BarChart3, 
  Settings, 
  Layers 
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, setSelectedGenre, watchlist, history, downloads } = useApp();

  const navItems = [
    { id: 'home', label: 'Discover', icon: Flame, badge: null },
    { id: 'movies', label: 'Movies', icon: Film, badge: 'HD' },
    { id: 'series', label: 'TV Shows', icon: Tv, badge: 'Full' },
    { id: 'bollywood', label: 'Dual Audio / Hindi', icon: Sparkles, badge: 'Special' },
    { id: 'watchlist', label: 'My Watchlist', icon: Bookmark, badge: watchlist.length || null },
    { id: 'history', label: 'Continue Watching', icon: Clock, badge: history.length || null },
    { id: 'downloads', label: 'Downloads & Magnets', icon: Download, badge: downloads.length || null },
    { id: 'stats', label: 'Cinema Stats', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings & Servers', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-[#0a0c16]/80 backdrop-blur-2xl border-r border-purple-500/10 flex flex-col justify-between hidden lg:flex flex-shrink-0 select-none py-6 px-4">
      <div className="space-y-6">
        
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Browse Hub
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'movies' || item.id === 'series') {
                      setSelectedGenre('all');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/10 text-white border border-purple-500/40 shadow-lg shadow-purple-900/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Vegamovies / HDHub4u Quality Features info card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#12162a] to-[#0c0f1c] border border-cyan-500/20 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Dual Experience</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Switch anytime between <strong>Instant Stream</strong> (6 ad-free servers) or <strong>Direct Download</strong> (4K, 1080p, 720p, Dual Audio Magnets).
          </p>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] text-slate-400">All Scrapers & APIs Online</span>
          </div>
        </div>

      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-800/60 px-2 text-xs text-slate-500 flex items-center justify-between">
        <span>XENMOVIES v1.0</span>
        <span className="text-purple-400 font-medium">Local SQLite</span>
      </div>
    </aside>
  );
}

