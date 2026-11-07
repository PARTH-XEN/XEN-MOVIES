import React from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { Sparkles, Tv, Monitor, Compass, Gamepad2, Check } from 'lucide-react';

export const UI_STYLES = [
  {
    id: 'visionos',
    aliases: ['vision-spatial'],
    name: 'VisionOS Spatial',
    tagline: 'Apple Vision Pro glassmorphism, 24px curved glass & specular refraction',
    badge: 'Spatial 3D',
    color: '#6366f1',
    icon: Sparkles
  },
  {
    id: 'netflix',
    aliases: ['cinema-stream', 'crimson'],
    name: 'Netflix Cinema',
    tagline: 'Obsidian pitch-black background, 6px crisp cinema cards & red accent',
    badge: 'Obsidian Dark',
    color: '#E50914',
    icon: Tv
  },
  {
    id: 'cyberpunk',
    aliases: ['cyberpunk-hud', 'matrix'],
    name: 'Cyberpunk 2077',
    tagline: 'Night City HUD, cyan & yellow cut corners, holographic grid & scanlines',
    badge: 'Sci-Fi HUD',
    color: '#00f0ff',
    icon: Monitor
  },
  {
    id: 'nordic',
    aliases: ['nordic-minimal', 'ocean'],
    name: 'Nordic Minimal',
    tagline: 'Clean Scandinavian monochrome slate, 12px rounded zen geometry',
    badge: 'Clean Zen',
    color: '#eceff4',
    icon: Compass
  },
  {
    id: 'synthwave',
    aliases: ['anime-arcade', 'gold'],
    name: 'Anime Synthwave',
    tagline: 'Retro-arcade purple synth gradient, neon pink glow & arcade typography',
    badge: 'Arcade Glow',
    color: '#ff71ce',
    icon: Gamepad2
  }
];

export default function UIStyleSwitcher({ compact = false }) {
  const { theme, setTheme, addToast } = useApp();

  const handleSelect = (styleId, styleName) => {
    spatialAudio.playClick();
    triggerHaptic('selection');
    setTheme(styleId);
  };

  const isCurrentTheme = (style) => {
    const current = theme || 'visionos';
    return current === style.id || (style.aliases && style.aliases.includes(current));
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
        {UI_STYLES.map((style) => {
          const Icon = style.icon;
          const isSelected = isCurrentTheme(style);
          return (
            <button
              key={style.id}
              onClick={() => handleSelect(style.id, style.name)}
              onMouseEnter={() => spatialAudio.playHover(0.2)}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                isSelected
                  ? 'bg-[var(--color-accent)] text-white font-semibold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title={style.name}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? '#ffffff' : style.color }} />
              <span className="hidden xl:inline">{style.badge}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {UI_STYLES.map((style) => {
        const Icon = style.icon;
        const isSelected = isCurrentTheme(style);

        return (
          <div
            key={style.id}
            onClick={() => handleSelect(style.id, style.name)}
            onMouseEnter={() => spatialAudio.playHover(0.1)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
              isSelected
                ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] shadow-xl ring-1 ring-[var(--color-accent)]/50'
                : 'bg-neutral-950/70 border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm"
                style={{ 
                  backgroundColor: isSelected ? style.color : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected && style.id === 'nordic' ? '#111827' : '#ffffff'
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              {isSelected ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20">
                  <Check className="w-3 h-3 text-emerald-400" /> Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium text-neutral-400 bg-neutral-900 border border-neutral-800">
                  {style.badge}
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white text-sm">
                {style.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {style.tagline}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
