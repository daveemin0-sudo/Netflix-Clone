import { useRef } from 'react';
import MovieCard from './MovieCard';

export default function MovieRow({
  title,
  subtitle,
  movies = [],
  isRanked = false,
  isLiked,
  onToggleLike,
  onOpenModal,
}) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative group/row mb-5 sm:mb-8 md:mb-10 px-3 sm:px-8 md:px-14">
      {/* Title with subtle accent */}
      <div className="flex items-baseline gap-2 sm:gap-3 mb-1.5 sm:mb-3">
        <h3 className="text-sm sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <span className="text-[11px] sm:text-xs text-gray-400 font-medium hidden sm:inline">
            {subtitle}
          </span>
        )}
      </div>

      {/* Row Wrapper */}
      <div className="relative">
        {/* Left Arrow Button (hidden on pure mobile touch) */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-40 h-24 sm:h-28 w-8 sm:w-11 bg-black/70 hover:bg-black/95 text-white items-center justify-center rounded-r-lg opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-md cursor-pointer border-r border-t border-b border-white/10 hover:border-white/30 shadow-xl"
          aria-label="Scroll Left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 sm:w-6 h-5 sm:h-6 transition-transform hover:scale-125"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Poster Row Container */}
        <div
          ref={rowRef}
          className="flex items-center gap-2 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar py-2 sm:py-4 scroll-smooth"
        >
          {movies && movies.length > 0 ? (
            movies.slice(0, 16).map((movie, idx) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                rank={isRanked && idx < 10 ? idx + 1 : undefined}
                isLiked={isLiked(movie.id)}
                onToggleLike={onToggleLike}
                onOpenModal={onOpenModal}
              />
            ))
          ) : (
            <div className="w-full py-6 text-center text-gray-500 italic text-xs sm:text-sm">
              No titles currently available for this category.
            </div>
          )}
        </div>

        {/* Right Arrow Button (hidden on pure mobile touch) */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-40 h-24 sm:h-28 w-8 sm:w-11 bg-black/70 hover:bg-black/95 text-white items-center justify-center rounded-l-lg opacity-0 group-hover/row:opacity-100 transition-all duration-300 backdrop-blur-md cursor-pointer border-l border-t border-b border-white/10 hover:border-white/30 shadow-xl"
          aria-label="Scroll Right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 sm:w-6 h-5 sm:h-6 transition-transform hover:scale-125"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
