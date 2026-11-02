import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Download, Copy, Check, Trash2, HardDrive, ExternalLink } from 'lucide-react';

export default function DownloadsTab() {
  const { downloads, reloadData, addToast } = useApp();
  const [copiedId, setCopiedId] = useState(null);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Download className="w-7 h-7 text-cyan-400" />
            <span>Downloads & Magnets Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracked local download requests and 1-click launch history
          </p>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="py-24 text-center glass-panel rounded-3xl border border-cyan-500/20 space-y-3">
          <Download className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No downloads saved yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Download" on any movie or TV series to browse 4K, 1080p, and Dual Audio links.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#0f1222] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.quality || 'HD'}
                  </span>
                  {item.size && (
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      <span>{item.size}</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="font-bold text-slate-100 text-sm truncate">
                  {item.title}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {item.release_title}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleLaunch(item.magnet)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Client</span>
                </button>

                <button
                  onClick={() => handleCopy(item.magnet, item.id)}
                  className="p-2 rounded-xl bg-[#161a2e] hover:bg-[#1d223c] border border-slate-700 text-slate-300 hover:text-white text-xs font-medium"
                  title="Copy Magnet"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl bg-[#161a2e] hover:bg-red-600/20 border border-slate-700 text-slate-400 hover:text-red-400 text-xs transition-colors"
                  title="Delete Record"
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

