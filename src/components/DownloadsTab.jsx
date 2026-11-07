import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Download, Copy, Check, Trash2, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { spatialAudio } from '../utils/spatialAudio';

export default function DownloadsTab() {
  const { downloads, reloadData, addToast, user, openAuthModal } = useApp();
  const [copiedId, setCopiedId] = useState(null);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 text-center select-none animate-in fade-in duration-300">
        <div className="p-8 sm:p-10 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-5">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 mx-auto flex items-center justify-center text-[var(--color-accent)]">
            <Download className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Sign In to Access Downloads
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Direct 4K and 1080p torrent magnets, Season Batch ZIP downloads, and high-speed trackers are available for registered users.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => {
                spatialAudio.playOpen();
                openAuthModal('signup');
              }}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              Create Free Account
            </button>

            <button
              onClick={() => {
                spatialAudio.playClick();
                openAuthModal('login');
              }}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Sign In with Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = (magnet, id) => {
    navigator.clipboard.writeText(magnet);
    setCopiedId(id);
    addToast('Magnet Link copied!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLaunch = (magnet) => {
    window.location.href = magnet;
    addToast('Sent magnet to Torrent client', 'info');
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteDownload(id);
      addToast('Download record deleted', 'info');
      reloadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Download className="w-6 h-6 text-[var(--color-accent)]" />
            <span>Downloads & Magnets Queue</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tracked download requests and 1-click launch history for {user.email}
          </p>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <Download className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-300">No downloads saved yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click "Downloads" on any movie or TV series to browse 4K, 1080p, and Dual Audio links.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:border-neutral-700 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-800 text-[var(--color-accent)] border border-neutral-700">
                    {item.quality || 'HD'}
                  </span>
                  <h4 className="font-semibold text-white text-sm truncate">
                    {item.title}
                  </h4>
                  {item.size && (
                    <span className="text-xs text-neutral-400">({item.size})</span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-500 truncate font-mono">
                  {item.magnet ? item.magnet.substring(0, 70) + '...' : 'No magnet link'}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleCopy(item.magnet, item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleLaunch(item.magnet)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Remove record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
