import React from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { X } from 'lucide-react';

export default function FilterBar() {
  const { selectedGenre, setSelectedGenre } = useApp();

  const genres = [
    { id: 'all', label: 'All' },
    { id: 'Action', label: 'Action' },
    { id: 'Animation', label: 'Anime & Animation' },
    { id: 'Sci-Fi', label: 'Sci-Fi' },
    { id: 'Horror', label: 'Horror' },
    { id: 'Comedy', label: 'Comedy' },
    { id: 'Romance', label: 'Romance' },
    { id: 'Thriller', label: 'Thriller' },
    { id: 'Crime', label: 'Crime' },
    { id: 'Fantasy', label: 'Fantasy' },
    { id: 'Drama', label: 'Drama' },
    { id: 'Mystery', label: 'Mystery' },
    { id: 'bollywood', label: 'Bollywood & Hindi' }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none select-none">
      {genres.map((g) => {
        const isSelected = selectedGenre === g.id;
        return (
          <button
            key={g.id}
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('selection');
              setSelectedGenre(isSelected && g.id !== 'all' ? 'all' : g.id);
            }}
            data-tv-focus="true"
            tabIndex={0}
            onMouseEnter={() => spatialAudio.playHover(0)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
              isSelected
                ? 'bg-[var(--color-accent)] text-white font-semibold shadow-md shadow-[var(--theme-shadow)] border border-[var(--color-accent)]'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 border border-neutral-800/80'
            }`}
          >
            {g.label}
          </button>
        );
      })}

      {selectedGenre !== 'all' && (
        <button
          onClick={() => {
            spatialAudio.playClick();
            triggerHaptic('light');
            setSelectedGenre('all');
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-900/50 text-xs font-medium transition-colors cursor-pointer flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
