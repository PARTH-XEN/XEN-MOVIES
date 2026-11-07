import React from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
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
  Layers,
  Radio,
  User,
  LogIn,
  LogOut,
  Smartphone,
  Info
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, setSelectedGenre, watchlist, history, downloads, user, openAuthModal, logoutUser } = useApp();

  const navItems = [
    { id: 'home', label: 'Discover', icon: Flame, badge: null },
    { id: 'movies', label: 'Movies', icon: Film, badge: 'HD' },
    { id: 'series', label: 'TV Shows', icon: Tv, badge: 'Full' },
    { id: 'bollywood', label: 'Dual Audio / Hindi', icon: Layers, badge: 'Hindi' },
    { id: 'watchlist', label: 'My Watchlist', icon: Bookmark, badge: watchlist.length || null },
    { id: 'history', label: 'Continue Watching', icon: Clock, badge: history.length || null },
    { id: 'downloads', label: 'Downloads & Queue', icon: Download, badge: downloads.length || null },
    { id: 'cloudstream', label: 'Cloudstream Repo', icon: Smartphone, badge: 'App' },
    { id: 'about', label: 'About Us', icon: Info, badge: null },
    { id: 'stats', label: 'Cinema Stats', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-60 bg-[#0c0d14] border-r border-neutral-800/80 flex flex-col justify-between hidden lg:flex flex-shrink-0 select-none py-6 px-3 z-20">
      <div className="space-y-6">
        
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    spatialAudio.playClick();
                    setActiveTab(item.id);
                    if (item.id === 'movies' || item.id === 'series') {
                      setSelectedGenre('all');
                    }
                  }}
                  onMouseEnter={() => spatialAudio.playHover(-0.8)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--color-accent-soft)] text-white border border-[var(--color-accent)]/30 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${
                      isActive ? 'text-[var(--color-accent)]' : 'text-neutral-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-neutral-700 text-neutral-200'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account Quick Section */}
        {user ? (
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`}
                alt={user.name || user.email || 'User'}
                className="w-8 h-8 rounded-full object-cover bg-neutral-800 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-medium text-neutral-200 truncate">{user.name || user.email || 'User'}</div>
                <div className="text-[10px] text-neutral-400 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => {
                spatialAudio.playClick();
                logoutUser();
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              spatialAudio.playClick();
              openAuthModal('login');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-neutral-800/80 px-2 text-xs text-neutral-400 flex items-center justify-between">
        <span className="font-medium text-neutral-400">XEN Cinema</span>
        <span className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Online
        </span>
      </div>
    </aside>
  );
}
