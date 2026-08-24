import { useEffect, useState } from 'react';
import { IMAGE_BASE_URL, fetchMovieDetails } from '../api/tmdb';

export default function MovieModal({ movieId, mediaType = 'movie', isOpen, onClose, isLiked, onToggleLike }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !movieId) {
      setDetails(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchMovieDetails(movieId, mediaType)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching movie details:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, movieId, mediaType]);

  // Lock scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const backdropUrl = details?.backdrop_path
    ? `${IMAGE_BASE_URL}/original${details.backdrop_path}`
    : details?.poster_path
    ? `${IMAGE_BASE_URL}/original${details.poster_path}`
    : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1920';

  const director =
    details?.credits?.crew?.find((p) => p.job === 'Director')?.name ||
    details?.created_by?.map((c) => c.name).join(', ') ||
    'N/A';

  const castList = details?.credits?.cast?.slice(0, 6) || [];
  const title = details?.title || details?.name || 'Title Details';
  const releaseDate = details?.release_date || details?.first_air_date || '2026';
  const releaseYear = releaseDate.split('-')[0];
  const ratingNum = details?.vote_average ? Number(details.vote_average) : 7.8;
  const matchPercent = Math.min(99, Math.max(70, Math.round(ratingNum * 10 + 12)));
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details?.number_of_seasons
    ? `${details.number_of_seasons} ${details.number_of_seasons === 1 ? 'Season' : 'Seasons'}`
    : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] bg-brand-surface rounded-2xl overflow-y-auto no-scrollbar shadow-2xl border border-white/10 animate-scaleUp text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/25 transition-all hover:scale-110 active:scale-95 cursor-pointer text-lg font-bold shadow-xl"
          aria-label="Close modal"
        >
          ✕
        </button>

        {loading ? (
          <div className="h-120 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium tracking-wide">Loading cinematic details...</p>
          </div>
        ) : details ? (
          <>
            {/* Header Backdrop */}
            <div
              className="relative h-72 sm:h-96 md:h-115 w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${backdropUrl}')` }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-brand-surface via-brand-surface/50 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-brand-surface/80 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 sm:left-10 right-6 z-10">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-2xl mb-4 leading-tight">
                  {title}
                </h2>

                <div className="flex items-center gap-3">
                  {onToggleLike && (
                    <button
                      onClick={() => onToggleLike(details.id)}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm border transition-all cursor-pointer shadow-lg active:scale-95 ${
                        isLiked
                          ? 'bg-brand-red border-brand-red text-white shadow-red-900/50'
                          : 'bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-md'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${isLiked ? 'fill-current' : 'fill-none'}`}
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
                      <span>{isLiked ? 'Saved in My List' : 'Add to My List'}</span>
                    </button>
                  )}

                  {details.homepage && (
                    <a
                      href={details.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all cursor-pointer"
                    >
                      <span>Official Site</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Details Content */}
            <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Storyline & Highlights */}
              <div className="md:col-span-2 space-y-5">
                {/* Meta stats bar */}
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
                  <span className="text-brand-rating font-bold">{matchPercent}% Match</span>
                  <span className="text-gray-400">{releaseYear}</span>
                  {runtime && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-300">{runtime}</span>
                    </>
                  )}
                  <span className="px-1.5 py-0.5 rounded border border-white/30 text-[10px] uppercase font-bold text-gray-200">
                    Ultra HD
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-gray-200">
                    HDR
                  </span>
                </div>

                <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-normal">
                  {details.overview || 'No synopsis recorded currently for this production.'}
                </p>

                {details.tagline && (
                  <p className="text-xs sm:text-sm italic text-gray-400 border-l-2 border-brand-red pl-3 py-1">
                    &ldquo;{details.tagline}&rdquo;
                  </p>
                )}

                {/* Cast Avatars/Pills */}
                {castList.length > 0 && (
                  <div className="pt-2">
                    <h5 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
                      Featured Cast
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {castList.map((actor) => (
                        <div
                          key={actor.id}
                          className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs"
                        >
                          <span className="font-semibold text-white">{actor.name}</span>
                          {actor.character && (
                            <span className="text-gray-400 text-[11px]">as {actor.character}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Metadata details */}
              <div className="space-y-4 text-xs sm:text-sm text-gray-400 border-t md:border-t-0 md:border-l md:border-white/10 md:pl-8 pt-4 md:pt-0">
                <div>
                  <span className="text-gray-500 font-semibold block mb-1">Director</span>
                  <span className="text-gray-200 font-medium">{director}</span>
                </div>

                <div>
                  <span className="text-gray-500 font-semibold block mb-1">Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-rating font-extrabold text-base">★ {ratingNum.toFixed(1)}</span>
                    <span className="text-gray-500 text-xs">({details.vote_count || 0} reviews)</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 font-semibold block mb-1">Release Date</span>
                  <span className="text-gray-200 font-medium">{releaseDate}</span>
                </div>

                {details.genres && details.genres.length > 0 && (
                  <div>
                    <span className="text-gray-500 font-semibold block mb-2">Genres</span>
                    <div className="flex flex-wrap gap-1.5">
                      {details.genres.map((g) => (
                        <span
                          key={g.id}
                          className="bg-white/10 border border-white/10 text-gray-200 text-[11px] px-3 py-1 rounded-full font-medium"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-16 text-center text-gray-400">Could not load movie details.</div>
        )}
      </div>
    </div>
  );
}
