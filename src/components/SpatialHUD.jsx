import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio, SOUND_PACKS } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { Volume2, VolumeX, Eye, ArrowUp, Tv } from 'lucide-react';

export default function SpatialHUD({ isTV = false, tvMode = false, onToggleTVMode = () => {} }) {
  const { addToast } = useApp();
  const [soundEnabled, setSoundEnabled] = useState(spatialAudio.enabled);
  const [activePack, setActivePack] = useState(spatialAudio.getSoundPack());
  const [soundMenuOpen, setSoundMenuOpen] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check saved tilt state
    const savedTilt = localStorage.getItem('xen_spatial_tilt');
    if (savedTilt !== null) {
      setTiltEnabled(savedTilt === 'true');
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const newState = spatialAudio.toggleSound();
    setSoundEnabled(newState);
    triggerHaptic('light');
    if (newState) {
      spatialAudio.playClick();
    }
  };

  const handleSelectPack = (packId) => {
    const updated = spatialAudio.setSoundPack(packId);
    setActivePack(updated);
    triggerHaptic('medium');
    setSoundMenuOpen(false);
    const packObj = SOUND_PACKS.find(p => p.id === packId);
    addToast(`Tap Sound: ${packObj?.name || packId}`, 'info');
  };

  const currentPackObj = SOUND_PACKS.find(p => p.id === activePack) || SOUND_PACKS[0];

  const themes = [
    { id: 'cyberpunk', color: '#8b5cf6', name: 'Cyber' },
    { id: 'matrix', color: '#10b981', name: 'Matrix' },
    { id: 'crimson', color: '#f43f5e', name: 'Crimson' },
    { id: 'gold', color: '#f59e0b', name: 'Solar' },
    { id: 'ocean', color: '#0284c7', name: 'Ocean' }
  ];

  return (
    <>
      {/* ================= DESKTOP & TV DOCK ================= */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-2 select-none pointer-events-auto">

        {/* 8 Sound Packs Floating Selector Menu */}
        {soundMenuOpen && (
          <div className="spatial-glass rounded-2xl p-2 mb-1 border border-purple-500/40 shadow-2xl backdrop-blur-2xl w-64 space-y-1 animate-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-white/10 mb-1">
              <span>Select UI Tap Sound</span>
              <span className="text-purple-400">8 Packs</span>
            </div>
            {SOUND_PACKS.map((pack) => {
              const isSelected = activePack === pack.id;
              return (
                <button
                  key={pack.id}
                  onClick={() => handleSelectPack(pack.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/20 text-white border border-purple-500/50 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <span className="text-base">{pack.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{pack.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">{pack.desc}</div>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Floating Spatial Dock Container */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0b0e1b]/85 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 hover:border-purple-500/40 transition-all duration-300 group">
          
          {/* TV Mode Toggle Button */}
          <button
            onClick={onToggleTVMode}
            onMouseEnter={() => spatialAudio.playHover(0.5)}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
              tvMode
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/30'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title={tvMode ? 'TV 10-Foot UI Mode: ACTIVE' : 'Switch to TV 10-Foot UI Mode'}
          >
            <Tv className={`w-4 h-4 ${tvMode ? 'text-amber-400' : ''}`} />
          </button>

          {/* Sound Pack Quick Selector Button */}
          <button
            onClick={() => {
              setSoundMenuOpen(!soundMenuOpen);
              setUiMenuOpen(false);
              spatialAudio.playClick();
              triggerHaptic('light');
            }}
            onMouseEnter={() => spatialAudio.playHover(0.5)}
            className={`px-2 py-1.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1 text-xs font-bold ${
              soundEnabled
                ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                : 'bg-white/5 text-slate-500 border border-transparent'
            }`}
            title={`Active Tap Sound: ${currentPackObj.name}. Click to change.`}
          >
            <span className="text-sm">{currentPackObj.icon}</span>
            <span className="text-[10px]">{currentPackObj.name.split(' ')[0]}</span>
          </button>

          {/* Spatial Sound Mute/Unmute Toggle */}
          <button
            onClick={toggleSound}
            onMouseEnter={() => spatialAudio.playHover(0.5)}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
              soundEnabled
                ? 'bg-white/5 text-purple-300 hover:bg-white/10'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
            title={soundEnabled ? 'Spatial Audio SFX: ON (Click to Mute)' : 'Spatial Audio SFX: OFF (Click to Unmute)'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* 3D Tilt Depth Toggle */}
          <button
            onClick={toggleTilt}
            onMouseEnter={() => spatialAudio.playHover(0.5)}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
              tiltEnabled
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
            title={tiltEnabled ? '3D Spatial Tilt: ON' : '3D Spatial Tilt: OFF'}
          >
            <Eye className={`w-4 h-4 ${tiltEnabled ? 'text-cyan-400' : ''}`} />
          </button>

          {/* Smooth Scroll to Top Button */}
          {isScrolled && (
            <button
              onClick={scrollToTop}
              onMouseEnter={() => spatialAudio.playHover(0.5)}
              className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:scale-110 transition-all duration-300 cursor-pointer ml-0.5"
              title="Return to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>

      {/* ================= MOBILE RETURN TO TOP ================= */}
      {isScrolled && (
        <div className="sm:hidden fixed bottom-20 right-4 z-40 select-none pointer-events-auto">
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-900/60 flex items-center justify-center cursor-pointer active:scale-90 transition-transform border border-white/20"
            title="Return to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
