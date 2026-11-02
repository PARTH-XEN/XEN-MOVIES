import React from 'react';
import { useApp } from '../context/AppContext';

export default function FilterBar() {
  const { selectedGenre, setSelectedGenre } = useApp();

  const genres = [
    { id: 'all', label: 'All Genres' },
    { id: 'Action', label: 'Action 💥' },
    { id: 'Sci-Fi', label: 'Sci-Fi 🚀' },
    { id: 'Horror', label: 'Horror 👻' },
    { id: 'Comedy', label: 'Comedy 😂' },
    { id: 'Romance', label: 'Romance ❤️' },
    { id: 'Thriller', label: 'Thriller 🔪' },
    { id: 'Animation', label: 'Animation 🎨' },
    { id: 'Crime', label: 'Crime 🕵️' },
    { id: 'Fantasy', label: 'Fantasy 🧙' },
    { id: 'Drama', label: 'Drama 🎭' },
    { id: 'bollywood', label: 'Bollywood / Hindi 🇮🇳' }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none select-none">
      {genres.map((g) => {
        const isSelected = selectedGenre === g.id;
        return (
          <button
            key={g.id}
            onClick={() => setSelectedGenre(g.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              isSelected
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                : 'bg-[#111422] text-slate-400 hover:text-slate-200 hover:bg-[#161a2e] border border-slate-800'
            }`}
          >
            {g.label}
          </button>
        );
      })}
    </div>
  );
}

