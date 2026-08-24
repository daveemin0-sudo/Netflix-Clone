import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { fetchMovieDetails } from '../api/tmdb';

export default function Watchlist({ likedList, toggleLike, isLiked }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState({ isOpen: false, movieId: null, mediaType: 'movie' });

  useEffect(() => {
    let isMounted = true;

    if (likedList.length === 0) {
      setMovies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const promises = likedList.map((id) => fetchMovieDetails(id));

    Promise.all(promises)
      .then((results) => {
        if (isMounted) {
          const valid = results.filter((item) => item !== null);
          setMovies(valid);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load watchlist details:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [likedList]);

  const handleOpenModal = (movieId, mediaType = 'movie') => {
    setModalData({ isOpen: true, movieId, mediaType });
  };

  const handleCloseModal = () => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="pt-28 pb-16 px-4 sm:px-8 md:px-14 max-w-7xl mx-auto">
          {/* Header section */}
          <div className="flex items-end justify-between border-b border-white/10 pb-5 mb-8">
            <div>
              <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#E50914] mb-1">
                Personal Collection
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                My Watchlist
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#46D369]" />
              <span>
                {likedList.length} {likedList.length === 1 ? 'saved title' : 'saved titles'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium">Loading your collection...</p>
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isLiked={isLiked(movie.id)}
                  onToggleLike={toggleLike}
                  onOpenModal={handleOpenModal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-28 max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-[#E50914]/20 to-transparent border border-white/10 flex items-center justify-center text-3xl shadow-xl">
                🎬
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
                Your watchlist is empty
              </h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                Save movies and TV shows to easily track what you want to stream next.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#b80710] text-white px-7 py-3 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-red-600/30 hover:scale-105 active:scale-95"
              >
                <span>Browse Spotlight</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-8 text-center text-xs text-gray-500 bg-[#070707]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-gray-400 font-semibold tracking-wider text-sm">
            CINEMATRIX
          </span>
          <p className="text-gray-500">
            Powered by The Movie Database (TMDB) • Built with React & TailwindCSS
          </p>
          <span className="text-gray-600 text-[11px]">
            Ultra HD • Dolby Vision • Spatial Audio
          </span>
        </div>
      </footer>

      {/* Modal */}
      <MovieModal
        movieId={modalData.movieId}
        mediaType={modalData.mediaType}
        isOpen={modalData.isOpen}
        onClose={handleCloseModal}
        isLiked={modalData.movieId ? isLiked(modalData.movieId) : false}
        onToggleLike={toggleLike}
      />
    </div>
  );
}
