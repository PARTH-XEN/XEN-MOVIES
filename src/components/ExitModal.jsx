import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { LogOut, ArrowRight, ShieldCheck, X } from 'lucide-react';

export default function ExitModal() {
  const { isExitModalOpen, closeExitModal, confirmExit } = useApp();
  const stayButtonRef = useRef(null);

  useEffect(() => {
    if (isExitModalOpen) {
      spatialAudio.playOpen();
      triggerHaptic('warning');
      stayButtonRef.current?.focus();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeExitModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExitModalOpen]);

  if (!isExitModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200 select-none"
      onClick={closeExitModal}
    >
      <div 
        className="relative w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeExitModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Stay on Site"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-rose-400">
            <LogOut className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Exit XENMOVIES?
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
              Are you sure you want to leave? Your watch progress and settings are saved.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            ref={stayButtonRef}
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('medium');
              closeExitModal();
            }}
            data-tv-focus="true"
            tabIndex={0}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Stay & Watch</span>
          </button>

          <button
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              confirmExit();
            }}
            data-tv-focus="true"
            tabIndex={0}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-rose-950/40 border border-neutral-700 hover:border-rose-900/50 text-neutral-300 hover:text-rose-300 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Yes, Exit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
