import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { 
  Smartphone, 
  Tv, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  QrCode, 
  Film,
  Zap,
  HelpCircle,
  Monitor
} from 'lucide-react';

export default function CloudstreamTab() {
  const { addToast } = useApp();
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeGuide, setActiveGuide] = useState('android'); // 'android' | 'tv' | 'pc'

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://xenmovies.antideploy.app';
  const repoJsonUrl = `${origin}/repo.json`;
  const cleanUrl = repoJsonUrl.replace(/^https?:\/\//, '');
  
  const deepLink = `cloudstreamrepo://${cleanUrl}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(repoJsonUrl)}&bgcolor=090a0f&color=f3f4f6&margin=2`;

  const copyToClipboard = (text, key, message) => {
    spatialAudio.playClick();
    triggerHaptic('success');
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast(message || 'Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleOpenDeepLink = () => {
    spatialAudio.playOpen();
    triggerHaptic('medium');
    addToast('Opening Cloudstream 3 & adding repository...', 'info');
    window.location.href = deepLink;
    setTimeout(() => {
      navigator.clipboard.writeText(repoJsonUrl);
    }, 800);
  };

  const plugins = [
    {
      id: 'sorastream',
      name: 'XENMOVIES SoraStream 4K',
      badge: 'Flagship',
      desc: 'Multi-server streaming engine with subtitles, 4K HDR playback, and auto-fallback mirrors.',
      types: 'Movies • TV Series • Blockbusters'
    },
    {
      id: 'vegamovies',
      name: 'XENMOVIES Vegamovies Engine',
      badge: 'Dual Audio',
      desc: 'Indian cinema, Bollywood, Hindi Dubbed Hollywood, and South cinema dual audio streams.',
      types: 'Bollywood • Hindi Dubbed • Regional'
    },
    {
      id: 'anime',
      name: 'XENMOVIES Anime & Series Hub',
      badge: 'Sub & Dub',
      desc: 'High-speed anime streaming with Japanese audio, English subtitles, and English dubs.',
      types: 'Anime • K-Drama • International'
    }
  ];

  const communityRepos = [
    {
      id: 'xenmovies-unified',
      name: 'XENMOVIES Mega Repo',
      tag: 'Recommended',
      url: repoJsonUrl,
      deepLink: deepLink,
      desc: 'Includes SoraStream 4K, Vegamovies Hindi, Anime Hub & auto-fallbacks.'
    },
    {
      id: 'hexated',
      name: 'Hexated English Providers',
      tag: 'English',
      url: 'https://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds/repo.json',
      deepLink: 'cloudstreamrepo://raw.githubusercontent.com/hexated/cloudstream-extensions-hexated/builds/repo.json',
      desc: 'English provider repository containing SuperStream, SoraStream, Cinezone, and FlixHQ.'
    },
    {
      id: 'stormunbl',
      name: 'Stormunbl Hindi Cinema',
      tag: 'Hindi & Dub',
      url: 'https://raw.githubusercontent.com/stormunbl/Stormunbl-Repository/builds/repo.json',
      deepLink: 'cloudstreamrepo://raw.githubusercontent.com/stormunbl/Stormunbl-Repository/builds/repo.json',
      desc: 'Hindi Dubbed, Bollywood, Vegamovies, and Indian regional cinema extensions.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 select-none pb-24 px-1 sm:px-0 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-neutral-800 text-[var(--color-accent)] border border-neutral-700">
            <Smartphone className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Companion App Extension</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            XENMOVIES for Cloudstream 3
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Install the repository into <strong className="text-white">Cloudstream 3</strong> on your Android Phone, Smart TV, or Firestick. Stream 4K cinema and Hindi Dubbed movies natively with zero ads and hardware decoding.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2 flex-wrap">
            <button
              onClick={handleOpenDeepLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>1-Click Add to Cloudstream</span>
            </button>

            <button
              onClick={() => copyToClipboard(repoJsonUrl, 'main', 'Repo URL copied to clipboard!')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                copiedKey === 'main'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200'
              }`}
            >
              {copiedKey === 'main' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
              <span>{copiedKey === 'main' ? 'Copied!' : 'Copy Repo URL'}</span>
            </button>

            <a
              href="https://github.com/recloudstream/cloudstream/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-750 border border-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Cloudstream APK</span>
              <ExternalLink className="w-3 h-3 text-neutral-500 ml-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Verified Cloudstream Repositories Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white px-1">
          <Zap className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Verified Cloudstream Repositories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {communityRepos.map((repo) => (
            <div
              key={repo.id}
              className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-3 hover:border-neutral-700 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-white text-sm truncate">{repo.name}</h3>
                  <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-neutral-800 text-[var(--color-accent)] border border-neutral-700 flex-shrink-0">
                    {repo.tag}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">{repo.desc}</p>
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-400 break-all select-all">
                  {repo.url}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    spatialAudio.playOpen();
                    triggerHaptic('medium');
                    addToast(`Adding ${repo.name} to Cloudstream...`, 'info');
                    window.location.href = repo.deepLink;
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>1-Click Add</span>
                </button>

                <button
                  onClick={() => copyToClipboard(repo.url, repo.id, `${repo.name} URL copied!`)}
                  className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    copiedKey === repo.id
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-300'
                  }`}
                  title="Copy link"
                >
                  {copiedKey === repo.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Repo Details & Live QR Code Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Repo Manifest Info */}
        <div className="md:col-span-2 p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Layers className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Repository Specifications</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Direct Repository URL</div>
              <div className="font-mono text-xs text-[var(--color-accent)] break-all select-all">
                {repoJsonUrl}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-medium">Protocol</span>
                <span className="text-white font-medium">Cloudstream Manifest v1</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-medium">Compatibility</span>
                <span className="text-emerald-400 font-medium">Android & Smart TV</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Included Provider Plugins ({plugins.length})
            </div>

            <div className="space-y-2">
              {plugins.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3 hover:border-neutral-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[var(--color-accent)] flex-shrink-0">
                    <Film className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-white text-xs sm:text-sm truncate">{p.name}</h4>
                      <span className="px-2 py-0.2 rounded text-[10px] font-medium uppercase bg-neutral-800 text-[var(--color-accent)] border border-neutral-700">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{p.desc}</p>
                    <div className="text-[10px] text-neutral-500 mt-1 font-medium">{p.types}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-between text-center space-y-4">
          <div className="space-y-1">
            <div className="inline-flex p-2 rounded-lg bg-neutral-800 text-[var(--color-accent)] mb-1">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">QR Code Scanner Pairing</h3>
            <p className="text-xs text-neutral-400">
              Open Cloudstream, go to <em>Settings → Extensions → Add Repository</em>, and scan this code.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 shadow-md">
            <img
              src={qrCodeUrl}
              alt="Cloudstream Repo QR Code"
              className="w-40 h-40 rounded-lg object-contain"
            />
          </div>

          <button
            onClick={() => copyToClipboard(repoJsonUrl, 'qr', 'Direct link copied!')}
            className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-400" />
            <span>Copy Direct Link</span>
          </button>
        </div>

      </div>

      {/* Manual Setup Troubleshooting Guide */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <HelpCircle className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Manual Setup Instructions</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          If your browser blocks custom app deep links, you can add it manually in the Cloudstream app:
        </p>
        <ol className="text-xs text-neutral-300 space-y-2 list-decimal list-inside bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-normal">
          <li>Open <strong>Cloudstream 3</strong> on your device.</li>
          <li>Tap <strong>Settings</strong> at the bottom/side.</li>
          <li>Select <strong>Extensions</strong> → Tap <strong>Add Repository</strong>.</li>
          <li>Enter Repository Name as <strong className="text-white">XENMOVIES</strong>.</li>
          <li>Paste the Repository URL: <span className="font-mono text-[var(--color-accent)] text-[11px] select-all break-all">{repoJsonUrl}</span></li>
          <li>Tap <strong>Download Repository</strong>. Extensions will appear ready to install!</li>
        </ol>
      </div>

      {/* Step-by-Step Installation Guides */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Platform Installation Guides</span>
          </h2>

          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => { spatialAudio.playClick(); setActiveGuide('android'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeGuide === 'android' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Android Phone
            </button>
            <button
              onClick={() => { spatialAudio.playClick(); setActiveGuide('tv'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeGuide === 'tv' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Smart TV
            </button>
            <button
              onClick={() => { spatialAudio.playClick(); setActiveGuide('pc'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeGuide === 'pc' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              PC / Windows
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 space-y-2 leading-relaxed">
          {activeGuide === 'android' && (
            <div>
              <p className="font-semibold text-white mb-1.5">For Android Phones & Tablets:</p>
              <p>1. Download and install Cloudstream 3 APK from GitHub releases.</p>
              <p>2. Tap the "1-Click Add to Cloudstream" button above.</p>
              <p>3. Tap "Download" when prompted inside Cloudstream, then enable XENMOVIES providers in your Extensions list.</p>
            </div>
          )}
          {activeGuide === 'tv' && (
            <div>
              <p className="font-semibold text-white mb-1.5">For Android TV, Google TV, or Firestick:</p>
              <p>1. Install the "Downloader" app from your TV app store.</p>
              <p>2. Download Cloudstream 3 Android TV APK from github.com/recloudstream/cloudstream/releases.</p>
              <p>3. Go to Settings → Extensions → Add Repository and scan the QR code above or type the repo URL.</p>
            </div>
          )}
          {activeGuide === 'pc' && (
            <div>
              <p className="font-semibold text-white mb-1.5">For Windows / macOS / Linux:</p>
              <p>1. You can run Cloudstream on PC using Windows Subsystem for Android (WSA) or an Android emulator like LDPlayer/Bluestacks.</p>
              <p>2. Alternatively, use XENMOVIES directly in your browser — all 6 streaming servers work right on this website without installing anything!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
