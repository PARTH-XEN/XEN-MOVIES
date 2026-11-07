import React from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio, SOUND_PACKS } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { UI_STYLES } from './UIStyleSwitcher';
import {
  X,
  Smartphone,
  Sparkles,
  Bookmark,
  Clock,
  Download,
  BarChart3,
  Settings,
  Info,
  Film,
  LogIn,
  LogOut,
  User,
  Volume2,
  VolumeX,
  Palette,
  Layout,
  CheckCircle2,
  Check,
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';

export default function MobileDrawer({ isOpen, onClose }) {
  const {
    activeTab,
    setActiveTab,
    setSelectedGenre,
    watchlist,
    history,
    downloads,
    user,
    openAuthModal,
    logoutUser,
    uiMode,
    setUiMode,
    theme,
    setTheme,
    addToast
  } = useApp();

  if (!isOpen) return null;

  const currentPack = spatialAudio.getSoundPack();
  const soundEnabled = spatialAudio.enabled;

  const handleSelectTab = (tabId) => {
    spatialAudio.playClick();
    triggerHaptic('light');
    setActiveTab(tabId);
    if (tabId === 'movies' || tabId === 'series') {
      setSelectedGenre('all');
    }
    onClose();
  };

  const handleSelectUI = (id, name) => {
    spatialAudio.playClick();
    triggerHaptic('selection');
    setTheme(id);
  };

  const handleSelectSound = (id, name) => {
    spatialAudio.setSoundPack(id);
    spatialAudio.playClick();
    triggerHaptic('medium');
    addToast(`Tap Sound: ${name}`, 'info');
  };

  const toggleSoundMute = () => {
    const newState = spatialAudio.toggleSound();
    triggerHaptic('light');
    if (newState) spatialAudio.playClick();
    addToast(newState ? 'Spatial Audio: Enabled' : 'Spatial Audio: Muted', 'info');
  };

  const themes = [
    { id: 'visionos', color: '#6366f1', name: 'VisionOS' },
    { id: 'netflix', color: '#E50914', name: 'Netflix' },
    { id: 'cyberpunk', color: '#00f0ff', name: 'Cyber' },
    { id: 'nordic', color: '#eceff4', name: 'Nordic' },
    { id: 'synthwave', color: '#ff71ce', name: 'Synth' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-Up Bottom Sheet */}
      <div className="w-full max-h-[88vh] bg-[#090b14] border-t border-purple-500/40 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Drawer Header with Grab Handle */}
        <div className="px-5 pt-3 pb-3 border-b border-white/10 flex items-center justify-between bg-[#0e1222]">
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          
          <div className="flex items-center gap-2 pt-1">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#090b14] rounded-xl flex items-center justify-center">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
            <span className="font-black text-white text-base tracking-tight">XEN Hub Menu</span>
          </div>

          <button
            onClick={() => {
              spatialAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="p-4 space-y-5 overflow-y-auto pb-[max(env(safe-area-inset-bottom),2rem)]">
          
          {/* User Account / Profile Strip */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm truncate">{user.name}</div>
                    <div className="text-[11px] text-cyan-300 truncate">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    spatialAudio.playClick();
                    onClose();
                    logoutUser();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-white text-sm">Guest Cinema Profile</div>
                  <div className="text-xs text-neutral-400">Sign in to sync watchlist & watch progress across devices</div>
                </div>
                <button
                  onClick={() => {
                    spatialAudio.playClick();
                    onClose();
                    openAuthModal('login');
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-[var(--theme-shadow)] flex items-center justify-center gap-1.5 active:scale-95 flex-shrink-0 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Quick Access Hub */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
              Explore & Companion Tools
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Cloudstream 3 Repo */}
              <button
                onClick={() => handleSelectTab('cloudstream')}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeTab === 'cloudstream'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white'
                    : 'bg-white/[0.04] border-cyan-500/30 hover:border-cyan-400/50 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    Extension
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-white">Cloudstream 3</div>
                  <div className="text-[10px] text-slate-400">Android & TV Repo</div>
                </div>
              </button>

              {/* Dual Audio / Bollywood */}
              <button
                onClick={() => handleSelectTab('bollywood')}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeTab === 'bollywood'
                    ? 'bg-purple-500/25 border-purple-400 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Hindi
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-white">Dual Audio Hub</div>
                  <div className="text-[10px] text-slate-400">Hindi Dubbed & Indian</div>
                </div>
              </button>

              {/* Continue Watching / History */}
              <button
                onClick={() => handleSelectTab('history')}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeTab === 'history'
                    ? 'bg-purple-500/25 border-purple-400 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Clock className="w-5 h-5 text-amber-400" />
                  {history.length > 0 && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      {history.length}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-white">Continue Watching</div>
                  <div className="text-[10px] text-slate-400">Resume playback</div>
                </div>
              </button>

              {/* Downloads & Magnets */}
              <button
                onClick={() => handleSelectTab('downloads')}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeTab === 'downloads'
                    ? 'bg-cyan-500/25 border-cyan-400 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Download className="w-5 h-5 text-cyan-400" />
                  {downloads.length > 0 && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      {downloads.length}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-white">Downloads Hub</div>
                  <div className="text-[10px] text-slate-400">P2P Magnets & ZIP</div>
                </div>
              </button>

              {/* Settings & Servers */}
              <button
                onClick={() => handleSelectTab('settings')}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeTab === 'settings'
                    ? 'bg-purple-500/25 border-purple-400 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-200'
                }`}
              >
                <Settings className="w-5 h-5 text-slate-300" />
                <div className="mt-2">
                  <div className="font-black text-xs text-white">Settings & Servers</div>
                  <div className="text-[10px] text-slate-400">Player preferences</div>
                </div>
              </button>

              {/* About Us */}
              <button
                onClick={() => handleSelectTab('about')}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeTab === 'about'
                    ? 'bg-purple-500/25 border-purple-400 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-200'
                }`}
              >
                <Info className="w-5 h-5 text-slate-300" />
                <div className="mt-2">
                  <div className="font-black text-xs text-white">About XENMOVIES</div>
                  <div className="text-[10px] text-slate-400">Platform mission & DMCA</div>
                </div>
              </button>

            </div>
          </div>

          {/* 5 UI Visual Styles Selector */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
              <span>Select Visual UI Style</span>
              <span className="text-cyan-400 font-bold">5 Options</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {UI_STYLES.map((style) => {
                const Icon = style.icon;
                const isSelected = uiMode === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleSelectUI(style.id, style.name)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">{style.name}</div>
                        <div className="text-[10px] text-slate-400">{style.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tap Sound Packs & Audio FX */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
              <span>Tap Sound Pack (4 Types)</span>
              <button
                onClick={toggleSoundMute}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  soundEnabled ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                <span>{soundEnabled ? 'SFX ON' : 'SFX MUTED'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SOUND_PACKS.map((pack) => {
                const isSelected = currentPack === pack.id;
                return (
                  <button
                    key={pack.id}
                    onClick={() => handleSelectSound(pack.id, pack.name)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">{pack.icon}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{pack.name}</div>
                        <div className="text-[9px] text-slate-400 truncate">{pack.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Palette Swatches */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
              Accent Color Theme
            </div>
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-2xl p-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    spatialAudio.playClick();
                    triggerHaptic('selection');
                    setTheme(t.id);
                  }}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === t.id ? 'bg-white/10 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full shadow-md ${theme === t.id ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-[9px] font-bold text-slate-300">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

