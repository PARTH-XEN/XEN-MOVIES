import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { LogOut, X, ArrowRight } from 'lucide-react';

export default function LogoutConfirmModal() {
  const { isLogoutConfirmOpen, cancelLogout, confirmLogout, user } = useApp();
  const stayButtonRef = useRef(null);

  useEffect(() => {
    if (isLogoutConfirmOpen) {
      spatialAudio.playOpen();
      triggerHaptic('warning');
      stayButtonRef.current?.focus();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          cancelLogout();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isLogoutConfirmOpen]);

  if (!isLogoutConfirmOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200 select-none"
      onClick={cancelLogout}
    >
      <div 
        className="relative w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={() => {
            spatialAudio.playClick();
            cancelLogout();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Stay Signed In"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="relative">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name || 'User')}`}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover bg-neutral-800 border border-neutral-700"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 border border-neutral-900 flex items-center justify-center text-white">
              <LogOut className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sign out of account?
            </h2>
            <div className="text-xs text-neutral-300 font-medium truncate max-w-xs mx-auto">
              {user.name} ({user.email})
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto pt-0.5">
              Your personal Watchlist, downloads queue, and history are safely preserved.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            ref={stayButtonRef}
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('medium');
              cancelLogout();
            }}
            data-tv-focus="true"
            tabIndex={0}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Stay Signed In</span>
          </button>

          <button
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              confirmLogout();
            }}
            data-tv-focus="true"
            tabIndex={0}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-rose-950/40 border border-neutral-700 hover:border-rose-900/50 text-neutral-300 hover:text-rose-300 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Yes, Sign Out</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
