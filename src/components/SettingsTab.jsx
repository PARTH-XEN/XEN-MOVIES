import React from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Settings, 
  Palette, 
  Server, 
  HardDrive, 
  Sliders, 
  Check, 
  Zap, 
  Database,
  ExternalLink,
  Cloud,
  Smartphone,
  Copy
} from 'lucide-react';

export default function SettingsTab() {
  const { settings, setSettings, setTheme, addToast } = useApp();

  const themes = [
    { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Electric Violet, Neon Cyan, Obsidian', color: '#8b5cf6' },
    { id: 'matrix', name: 'Matrix Emerald', desc: 'Hacker Green, Mint, Deep Pitch', color: '#10b981' },
    { id: 'crimson', name: 'Crimson OLED', desc: 'Cinematic Red, Rose Glow, Velvet', color: '#f43f5e' },
    { id: 'gold', name: 'Solar Amber', desc: 'Warm Amber, Luxury Gold, Carbon', color: '#f59e0b' },
    { id: 'ocean', name: 'Glacier Blue', desc: 'Deep Ocean Blue, Electric Sky, Slate', color: '#0284c7' }
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

  const testMagnet = () => {
    const testUri = 'magnet:?xt=urn:btih:2849211f150e966ef7924f43aec22727a644e10d&dn=Inception.Test.Launch';
    window.location.href = testUri;
    addToast('Testing magnet launch in Windows...', 'info');
  };

  return (
    <div className="max-w-4xl space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-purple-400" />
          <span>Settings & Preferences</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your local streaming engine, preferred resolutions, and UI aesthetic
        </p>
      </div>

      {/* Visual Theme Section */}
      <div className="p-6 rounded-3xl bg-[#0e1222] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
          <Palette className="w-4 h-4 text-purple-400" />
          <span>Aesthetic Visual Theme</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themes.map((t) => {
            const isSelected = settings.theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500'
                    : 'bg-[#12162a] border-slate-800 hover:border-slate-700 hover:bg-[#181d36]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full shadow-md flex items-center justify-center text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-200">{t.name}</div>
                    <div className="text-[11px] text-slate-400">{t.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streaming Server Defaults */}
      <div className="p-6 rounded-3xl bg-[#0e1222] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Streaming Node Settings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Default Streaming Server
            </label>
            <select
              value={settings.preferred_server || 'vidlink'}
              onChange={(e) => handleUpdate('preferred_server', e.target.value)}
              className="w-full bg-[#12162a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="vidlink">VidLink Pro (4K / Ultra Fast / Subtitles)</option>
              <option value="2embed">2Embed VIP (Multi-Language Subtitles)</option>
              <option value="vidsrc_icu">VidSrc ICU (Dual Audio & High Bandwidth)</option>
              <option value="autoembed">AutoEmbed Cloud (Auto Server Switcher)</option>
              <option value="smashystream">SmashyStream (High Speed Mirror)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Audio Track Priority
            </label>
            <select
              value={settings.preferred_audio || 'dual_audio'}
              onChange={(e) => handleUpdate('preferred_audio', e.target.value)}
              className="w-full bg-[#12162a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="dual_audio">Dual Audio / Hindi Dubbed (Vegamovies Special)</option>
              <option value="original">Original Audio (English / Multi)</option>
              <option value="any">Any Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Download & Torrent Client Preferences */}
      <div className="p-6 rounded-3xl bg-[#0e1222] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Torrent & Download Client Preferences</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Preferred Download Quality
            </label>
            <select
              value={settings.preferred_quality || '1080p'}
              onChange={(e) => handleUpdate('preferred_quality', e.target.value)}
              className="w-full bg-[#12162a] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="4k">4K Ultra HD (2160p HDR / AV1 / HEVC)</option>
              <option value="1080p">1080p Full HD (Dual Audio 10-Bit)</option>
              <option value="720p">720p HD (High Speed Compact)</option>
              <option value="480p">480p SD (Mobile / Low Bandwidth)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
              Torrent Client Integration
            </label>
            <button
              onClick={testMagnet}
              className="w-full flex items-center justify-center gap-2 bg-[#12162a] hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-semibold rounded-xl px-3.5 py-2.5 text-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Test 1-Click Torrent Magnet Launch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloudstream 3 Integration Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/30 via-[#0e1222] to-cyan-950/30 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-100">
            <Cloud className="w-5 h-5 text-cyan-400" />
            <span>Cloudstream 3 Mobile & Android TV Integration</span>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
            Cloudstream API Online
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Use XENMOVIES as an official custom provider repository inside the <strong>Cloudstream 3</strong> app on Android phones, tablets, or Android TVs for 100% ad-free native playback!
        </p>

        <div className="p-4 rounded-2xl bg-[#0a0d18] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cloudstream Repository URL:</span>
            <button
              onClick={() => {
                const repoUrl = `${window.location.origin}/api/cloudstream/repo.json`;
                navigator.clipboard.writeText(repoUrl);
                addToast('Copied Cloudstream Repository URL!', 'success');
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Repo URL</span>
            </button>
          </div>
          <div className="font-mono text-xs text-purple-300 break-all select-all bg-slate-900/80 p-2.5 rounded-xl border border-purple-500/20">
            {typeof window !== 'undefined' ? `${window.location.origin}/api/cloudstream/repo.json` : 'http://localhost:5000/api/cloudstream/repo.json'}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 space-y-1">
          <div className="font-bold text-slate-300">How to add in Cloudstream 3:</div>
          <div>1. Open Cloudstream 3 &gt; Go to <strong>Settings</strong> &gt; <strong>Extensions</strong>.</div>
          <div>2. Click <strong>Add Repository</strong> &gt; Paste the URL above.</div>
          <div>3. Install the <strong>XENMOVIES SoraStream &amp; Vegamovies</strong> providers to stream directly!</div>
        </div>
      </div>

      {/* Local System & SQLite Diagnostics */}
      <div className="p-6 rounded-3xl bg-[#080b16] border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span>Local System Environment</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0e1222] border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Database</span>
            <span className="text-slate-200 font-mono">SQLite (xenmovies.db)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0e1222] border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Local Port</span>
            <span className="text-slate-200 font-mono">http://localhost:5000</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0e1222] border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Storage Mode</span>
            <span className="text-emerald-400 font-bold">100% Offline & Private</span>
          </div>
        </div>
      </div>

    </div>
  );
}

