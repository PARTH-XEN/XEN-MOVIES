import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { spatialAudio, SOUND_PACKS } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import UIStyleSwitcher from './UIStyleSwitcher';
import { 
  Settings, 
  Palette, 
  Server, 
  HardDrive, 
  Check, 
  Volume2,
  Play,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  Layout
} from 'lucide-react';

export default function SettingsTab() {
  const { theme, settings, setSettings, setTheme, addToast, user, openAuthModal, logoutUser } = useApp();
  const [activeSoundPack, setActiveSoundPack] = useState(spatialAudio.getSoundPack());

  const themes = [
    { id: 'visionos', name: 'VisionOS Spatial', desc: 'Spatial 3D Glass & Specular Depth', color: '#6366f1' },
    { id: 'netflix', name: 'Netflix Cinema', desc: 'Obsidian Pitch Black & Red Accent', color: '#E50914' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', desc: 'Night City HUD & Cyan Grid', color: '#00f0ff' },
    { id: 'nordic', name: 'Nordic Minimal', desc: 'Clean Zen Monochrome Slate', color: '#eceff4' },
    { id: 'synthwave', name: 'Anime Synthwave', desc: 'Retro Arcade & Neon Pink Glow', color: '#ff71ce' }
  ];

  const handleUpdate = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await api.saveSettings({ [key]: value });
      addToast(`Updated ${key.replace('_', ' ')}`, 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to save settings', 'error');
    }
  };

  const handleSelectSoundPack = (packId) => {
    const updated = spatialAudio.setSoundPack(packId);
    setActiveSoundPack(updated);
    triggerHaptic('medium');
    const packObj = SOUND_PACKS.find(p => p.id === packId);
    addToast(`Selected: ${packObj?.name || packId}`, 'success');
  };

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8 select-none pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[var(--color-accent)]" />
          <span>Settings & Preferences</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage your personal account, select UI design modes, customize sound packs, and configure streaming nodes.
        </p>
      </div>

      {/* User Account / Profile Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <User className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Account & Cloud Sync</span>
          </div>
          {user ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Synchronized
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Guest Mode
            </span>
          )}
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 object-cover"
              />
              <div>
                <h3 className="font-semibold text-white text-sm">{user.name}</h3>
                <p className="text-xs text-neutral-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                spatialAudio.playClick();
                logoutUser();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/40 border border-neutral-700 hover:border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div>
              <h3 className="font-semibold text-white text-sm">
                Sign In or Register
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-md">
                Create an account to keep your personal watchlist, downloads history, and progress saved forever across any device.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  spatialAudio.playClick();
                  openAuthModal('signup');
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  spatialAudio.playClick();
                  openAuthModal('login');
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selectable UI Interface Modes */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Layout className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Selectable Visual UI Interfaces (5 Styles)</span>
          </div>
        </div>
        <p className="text-xs text-neutral-400">
          Switch between curated styles: Apple VisionOS Spatial glass, Netflix pitch-black obsidian cinema, Cyberpunk 2077 HUD, Nordic minimal slate, or Anime Synthwave.
        </p>

        <UIStyleSwitcher />
      </div>

      {/* Accent Color Palette */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Palette className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Accent Color Theme (5 Themes)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {themes.map((t) => {
            const isSelected = (theme || settings?.theme || 'cyberpunk') === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3.5 rounded-xl cursor-pointer transition-colors border flex items-center justify-between ${
                  isSelected
                    ? 'bg-neutral-800 border-neutral-500 shadow-md ring-1 ring-white/20'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full shadow-sm flex items-center justify-center text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-neutral-200">{t.name}</div>
                    <div className="text-[10px] text-neutral-400">{t.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UI Tap Sound Types Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Volume2 className="w-4 h-4 text-[var(--color-accent)]" />
            <span>UI Tap Sound Profiles (8 Sound Packs)</span>
          </div>
        </div>

        <p className="text-xs text-neutral-400">
          Choose feedback sounds for button clicks and navigation. Tap to preview and select.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SOUND_PACKS.map((pack) => {
            const isSelected = activeSoundPack === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => handleSelectSoundPack(pack.id)}
                className={`p-3 rounded-xl cursor-pointer transition-colors border flex items-center justify-between ${
                  isSelected
                    ? 'bg-neutral-800 border-neutral-500 shadow-md ring-1 ring-white/20'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{pack.icon}</span>
                  <div className="truncate">
                    <div className="font-medium text-xs text-neutral-200 truncate">{pack.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{pack.desc}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Streaming Server Defaults */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Server className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Streaming Server Settings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase">
              Default Streaming Server
            </label>
            <select
              value={settings.preferred_server || 'vidlink'}
              onChange={(e) => handleUpdate('preferred_server', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
            >
              <option value="vidlink">VidLink Pro (4K / Ultra Fast / Subtitles)</option>
              <option value="2embed">2Embed VIP (Multi-Language Subtitles)</option>
              <option value="vidsrc_pm">VidSrc PM (Dual Audio & High Bandwidth)</option>
              <option value="autoembed">AutoEmbed Cloud (Auto Mirror Switcher)</option>
              <option value="smashystream">SmashyStream (High Speed Mirror)</option>
              <option value="multiembed">MultiEmbed Global</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase">
              Audio Priority
            </label>
            <select
              value={settings.preferred_audio || 'dual_audio'}
              onChange={(e) => handleUpdate('preferred_audio', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
            >
              <option value="dual_audio">Dual Audio / Hindi Dubbed Special</option>
              <option value="original">Original Audio (English / Multi)</option>
              <option value="any">Any Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Download Preferences */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <HardDrive className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Download & Magnet Preferences</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase">
              Magnet Action
            </label>
            <select
              value={settings.torrent_client_action || 'open_magnet'}
              onChange={(e) => handleUpdate('torrent_client_action', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
            >
              <option value="open_magnet">Open in Installed BitTorrent Client</option>
              <option value="copy_magnet">Copy Magnet Link to Clipboard Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase">
              Preferred Resolution
            </label>
            <select
              value={settings.preferred_quality || '1080p'}
              onChange={(e) => handleUpdate('preferred_quality', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
            >
              <option value="2160p">4K UHD (2160p HDR)</option>
              <option value="1080p">Full HD (1080p HEVC 10-bit)</option>
              <option value="720p">HD (720p Fast Download)</option>
              <option value="all">Show All Qualities</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  );
}
