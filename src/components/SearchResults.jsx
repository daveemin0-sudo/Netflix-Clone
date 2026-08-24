import React from 'react';
import MovieCard from './MovieCard';

export default function SearchResults({
  query,
  results = [],
  loading = false,
  onClear,
  isLiked,
  onToggleLike,
  onOpenModal,
}) {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-8 md:px-12 min-h-[70vh]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Results for <span className="text-[#E50914]">"{query}"</span>
        </h2>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
        >
          <span>✕</span> Clear
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Searching Cinematrix...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {results.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isLiked={isLiked(movie.id)}
              onToggleLike={onToggleLike}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg mb-2">No matches found for "{query}".</p>
          <p className="text-sm text-gray-500">
            Try searching for another title, director, actor, or genre.
          </p>
        </div>
      )}
    </section>
  );
}
