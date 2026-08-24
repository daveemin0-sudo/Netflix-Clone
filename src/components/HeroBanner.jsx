import { useState, useEffect, useRef } from 'react';
import { IMAGE_BASE_URL, fetchMovieVideo } from '../api/tmdb';

export default function HeroBanner({ movies = [], onOpenModal }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const cycleTimerRef = useRef(null);
  const previewTimerRef = useRef(null);

  const currentMovie = movies[currentIndex] || null;

  // Auto-play trailer whenever currentMovie changes
  useEffect(() => {
    if (!currentMovie) return;

    let isMounted = true;
    setIsPlayingTrailer(false);
    setTrailerKey(null);
    setIsLoadingTrailer(true);

    fetchMovieVideo(currentMovie.id, currentMovie.media_type)
      .then((key) => {
        if (!isMounted) return;
        setIsLoadingTrailer(false);
        if (key) {
          setTrailerKey(key);
          setIsPlayingTrailer(true);

          if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
          previewTimerRef.current = setTimeout(() => {
            if (isMounted) stopTrailer();
          }, 24000);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingTrailer(false);
      });

    return () => {
      isMounted = false;
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [currentMovie?.id]);

  // Auto cycle effect across slides
  useEffect(() => {
    if (!movies || movies.length <= 1) return;

    cycleTimerRef.current = setInterval(() => {
      stopTrailer();
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 25000);

    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [movies.length]);

  const stopTrailer = () => {
    setIsPlayingTrailer(false);
    setTrailerKey(null);
    setIsLoadingTrailer(false);
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  };

  const handlePlayTrailer = async () => {
    if (isPlayingTrailer) {
      stopTrailer();
      return;
    }

    if (!currentMovie) return;

    setIsLoadingTrailer(true);
    const key = await fetchMovieVideo(currentMovie.id, currentMovie.media_type);
    setIsLoadingTrailer(false);

    if (key) {
      setTrailerKey(key);
      setIsPlayingTrailer(true);

      previewTimerRef.current = setTimeout(() => {
        stopTrailer();
      }, 25000);
    } else {
      alert('Trailer is unavailable for this selection.');
    }
  };

  if (!currentMovie) {
    return (
      <div className="relative h-[70vh] md:h-[80vh] w-full flex items-center justify-center bg-brand-bg">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium tracking-wide">Loading Spotlight...</p>
        </div>
      </div>
    );
  }

  const bgImage = currentMovie.backdrop_path
    ? `${IMAGE_BASE_URL}/original${currentMovie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1920';

  const title = currentMovie.title || currentMovie.name || 'Featured Spotlight';
  const overview = currentMovie.overview || 'No overview synopsis recorded currently.';
  const releaseYear = (currentMovie.release_date || currentMovie.first_air_date || '2026').split('-')[0];
  const rating = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : '7.8';

  return (
    <header className="relative h-[72vh] sm:h-[78vh] md:h-[86vh] w-full flex items-center px-4 sm:px-8 md:px-14 overflow-hidden select-none">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* Video Trailer Overlay */}
      {isPlayingTrailer && trailerKey && (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${
              isMuted ? 1 : 0
            }&controls=0&loop=1&playlist=${trailerKey}&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`}
            title="Trailer Preview"
            className="w-screen h-[56.25vw] min-h-screen min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* Multi-layered Cinematic Gradients */}
      <div className="absolute inset-0 z-15 bg-linear-to-t from-brand-bg via-brand-bg/45 to-transparent" />
      <div className="absolute inset-0 z-15 bg-linear-to-r from-brand-bg/90 via-brand-bg/60 to-transparent w-full md:w-3/4" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-black/80 to-transparent z-15" />

      {/* Hero Content */}
      <div className="relative z-20 max-w-2xl pt-20 sm:pt-24">
        {/* Spotlight Tag / Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold tracking-wider uppercase mb-4 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
          <span>Trending Spotlight #{currentIndex + 1}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-2xl mb-3 sm:mb-4 leading-tight">
          {title}
        </h1>

        {/* Metadata Badges */}
        <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-300 mb-4">
          <span className="text-brand-rating font-bold">★ {rating} Rating</span>
          <span className="text-gray-500">•</span>
          <span>{releaseYear}</span>
          <span className="text-gray-500">•</span>
          <span className="px-1.5 py-0.5 rounded border border-white/30 text-[10px] uppercase font-bold tracking-wider">
            4K Ultra HD
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold">
            5.1 Audio
          </span>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-gray-300 line-clamp-3 md:line-clamp-4 leading-relaxed mb-6 sm:mb-8 drop-shadow font-normal max-w-xl">
          {overview}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handlePlayTrailer}
            disabled={isLoadingTrailer}
            className="flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-lg font-extrabold text-black bg-white hover:bg-white/90 active:scale-95 transition-all text-sm sm:text-base cursor-pointer shadow-xl hover:shadow-white/20"
          >
            {isLoadingTrailer ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlayingTrailer ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h12v12H6z" />
                </svg>
                <span>Stop</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenModal && onOpenModal(currentMovie.id, currentMovie.media_type)}
            className="flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-lg font-bold text-white bg-white/20 hover:bg-white/30 border border-white/20 active:scale-95 transition-all text-sm sm:text-base backdrop-blur-md cursor-pointer shadow-lg hover:shadow-black/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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
            <span>More Info</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Mute Toggle Button */}
      <div className="absolute bottom-8 right-4 sm:right-8 md:right-14 z-25 flex items-center gap-3">
        {isPlayingTrailer && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/30 text-white flex items-center justify-center backdrop-blur-md hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
