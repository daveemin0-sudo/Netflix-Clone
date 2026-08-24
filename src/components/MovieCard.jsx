import React from 'react';
import { IMAGE_BASE_URL } from '../api/tmdb';

export default function MovieCard({ movie, rank, isLiked, onToggleLike, onOpenModal }) {
  if (!movie) return null;

  const cardImg = movie.backdrop_path
    ? `${IMAGE_BASE_URL}/w500${movie.backdrop_path}`
    : movie.poster_path
    ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
    : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500';

  const movieTitle = movie.title || movie.name || 'Untitled Production';
  const releaseYear = (movie.release_date || movie.first_air_date || '2026').split('-')[0];
  const ratingNum = movie.vote_average ? Number(movie.vote_average) : 7.5;
  const matchPercent = Math.min(99, Math.max(70, Math.round(ratingNum * 10 + 12)));

  return (
    <div
      onClick={() => onOpenModal && onOpenModal(movie.id, movie.media_type || (movie.title ? 'movie' : 'tv'))}
      className="group relative flex-shrink-0 w-[112px] sm:w-[165px] md:w-[210px] lg:w-[255px] h-[64px] sm:h-[95px] md:h-[120px] lg:h-[145px] bg-[#141414] rounded-md sm:rounded-lg overflow-hidden cursor-pointer shadow-md sm:shadow-xl transition-all duration-300 ease-out hover:scale-110 sm:hover:scale-118 hover:z-30 hover:shadow-2xl hover:shadow-black/90 hover:ring-1 hover:ring-white/30"
    >
      {/* Background Poster */}
      <img
        src={cardImg}
        alt={movieTitle}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500';
        }}
        className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
      />

      {/* Rank Number for Top 10 */}
      {rank && (
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 px-1 sm:px-2 py-0.2 sm:py-0.5 bg-[#E50914] text-white font-black text-[8px] sm:text-[10px] md:text-xs rounded shadow-md tracking-wider">
          #{rank}
        </div>
      )}

      {/* Quick Like Button for Mobile (Top Right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleLike) onToggleLike(movie.id);
        }}
        className={`sm:hidden absolute top-1 right-1 z-10 w-5 h-5 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
          isLiked ? 'bg-[#E50914] text-white' : 'bg-black/60 text-white/80'
        }`}
        aria-label={isLiked ? 'Remove from list' : 'Add to list'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 ${isLiked ? 'fill-current' : 'fill-none'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2"
          />
        </svg>
      </button>

      {/* Hover Info Glass Overlay (Hidden on pure small touch screens until hovered/expanded) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex flex-col justify-end p-2 sm:p-3 select-none backdrop-blur-[2px]">
        {/* Title */}
        <h4 className="text-[10px] sm:text-xs md:text-sm font-extrabold text-white truncate drop-shadow mb-0.5 sm:mb-1">
          {movieTitle}
        </h4>

        {/* Overview Synopsis */}
        <p className="text-[9px] sm:text-[10px] md:text-[11px] text-gray-300 line-clamp-1 sm:line-clamp-2 leading-snug mb-1 sm:mb-2 font-normal hidden sm:block">
          {movie.overview || 'No synopsis recorded for this title.'}
        </p>

        {/* Metadata Row */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-[11px] font-semibold mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[#46D369] font-bold">{matchPercent}%</span>
            <span className="text-gray-400 font-normal">{releaseYear}</span>
          </div>
          <span className="px-1 py-0.2 rounded border border-white/30 text-[8px] sm:text-[9px] font-bold text-gray-200">
            HD
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Like / Watchlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleLike) onToggleLike(movie.id);
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-semibold border transition-all cursor-pointer shadow ${
              isLiked
                ? 'bg-[#E50914] border-[#E50914] text-white shadow-red-900/40'
                : 'bg-white/15 border-white/25 text-white hover:bg-white/30 hover:border-white/50'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-3 h-3 ${isLiked ? 'fill-current' : 'fill-none'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2"
              />
            </svg>
            <span className="hidden md:inline">{isLiked ? 'In List' : 'Add to List'}</span>
            <span className="md:hidden">{isLiked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Quick Info Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenModal) onOpenModal(movie.id, movie.media_type || 'movie');
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-white/15 hover:bg-white/30 border border-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="More information"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
