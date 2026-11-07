import React from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { Flame, Film, Tv, Bookmark, Menu, Smartphone } from 'lucide-react';

export default function MobileNav({ onOpenMenu = () => {} }) {
  const { activeTab, setActiveTab, setSelectedGenre, watchlist } = useApp();

  const navItems = [
    { id: 'home', label: 'Discover', icon: Flame },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'watchlist', label: 'Saved', icon: Bookmark, badge: watchlist.length || null },
    { id: 'menu', label: 'Hub Menu', icon: Menu, isAction: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pointer-events-none pb-[max(env(safe-area-inset-bottom),0.5rem)] px-2 sm:px-3">
      {/* Floating Spatial Pill Bar */}
      <nav className="pointer-events-auto max-w-md mx-auto spatial-glass rounded-2xl sm:rounded-3xl p-1.5 flex items-center justify-around border border-white/15 shadow-2xl shadow-black/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isAction && activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                spatialAudio.playClick();
                triggerHaptic('light');
                if (item.isAction) {
                  onOpenMenu();
                } else {
                  setActiveTab(item.id);
                  if (item.id === 'movies' || item.id === 'series') {
                    setSelectedGenre('all');
                  }
                }
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer min-h-[46px] ${
                isActive
                  ? 'text-white bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/40 shadow-lg shadow-[var(--theme-shadow)] scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${
                  isActive ? 'text-[var(--color-accent)] scale-110' : item.isAction ? 'text-cyan-400' : 'text-slate-400'
                }`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[var(--color-accent)] text-white text-[9px] font-black flex items-center justify-center shadow-md">
                    {item.badge}
                  </span>
                )}
                {item.isAction && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight font-bold ${
                isActive ? 'text-white' : item.isAction ? 'text-cyan-300' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-0.5 shadow-sm shadow-[var(--color-accent)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
