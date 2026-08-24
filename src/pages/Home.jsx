import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import ProviderSection from '../components/ProviderSection';
import SearchResults from '../components/SearchResults';
import MovieModal from '../components/MovieModal';
import {
  fetchTrendingAll,
  fetchTopRated,
  fetchPopular,
  fetchUpcoming,
  fetchAction,
  searchMulti,
} from '../api/tmdb';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home({ likedList, toggleLike, isLiked }) {
  const [heroMovies, setHeroMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popular, setPopular] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Modal state
  const [modalData, setModalData] = useState({ isOpen: false, movieId: null, mediaType: 'movie' });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchTrendingAll(),
      fetchTopRated(),
      fetchPopular(),
      fetchUpcoming(),
      fetchAction(),
    ])
      .then(([trendingRes, topRatedRes, popularRes, upcomingRes, actionRes]) => {
        if (!isMounted) return;

        const trendingList = trendingRes?.results || [];
        setTrending(trendingList);
        setTopRated(topRatedRes?.results || []);
        setPopular(popularRes?.results || []);
        setUpcoming(upcomingRes?.results || []);
        setActionMovies(actionRes?.results || []);

        if (trendingList.length > 0) {
          const shuffled = shuffle(trendingList);
          setHeroMovies(shuffled.slice(0, 7));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = async (query) => {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    setActiveQuery(cleanQuery);
    setIsSearching(true);

    try {
      const data = await searchMulti(cleanQuery);
      const valid = (data.results || []).filter(
        (item) => (item.media_type === 'movie' || item.media_type === 'tv') && (item.backdrop_path || item.poster_path)
      );
      setSearchResults(valid);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setActiveQuery('');
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleOpenModal = (movieId, mediaType = 'movie') => {
    setModalData({ isOpen: true, movieId, mediaType });
  };

  const handleCloseModal = () => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col justify-between">
      <div>
        <Navbar
          onSearch={handleSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {activeQuery ? (
          <SearchResults
            query={activeQuery}
            results={searchResults}
            loading={isSearching}
            onClear={handleClearSearch}
            isLiked={isLiked}
            onToggleLike={toggleLike}
            onOpenModal={handleOpenModal}
          />
        ) : (
          <>
            <HeroBanner movies={heroMovies} onOpenModal={handleOpenModal} />

            <main className="relative z-20 -mt-10 sm:-mt-16 md:-mt-20 space-y-3 pb-16">
              <MovieRow
                title="Top 10 Trending Today"
                subtitle="Most watched titles across all genres"
                movies={trending}
                isRanked={true}
                isLiked={isLiked}
                onToggleLike={toggleLike}
                onOpenModal={handleOpenModal}
              />
              <MovieRow
                title="Critically Acclaimed"
                subtitle="Top rated by global audiences"
                movies={topRated}
                isLiked={isLiked}
                onToggleLike={toggleLike}
                onOpenModal={handleOpenModal}
              />
              <MovieRow
                title="Popular on Cinematrix"
                movies={popular}
                isLiked={isLiked}
                onToggleLike={toggleLike}
                onOpenModal={handleOpenModal}
              />
              <MovieRow
                title="Upcoming Releases"
                subtitle="Coming soon to theaters & streaming"
                movies={upcoming}
                isLiked={isLiked}
                onToggleLike={toggleLike}
                onOpenModal={handleOpenModal}
              />
              <MovieRow
                title="Action & Adrenaline"
                movies={actionMovies}
                isLiked={isLiked}
                onToggleLike={toggleLike}
                onOpenModal={handleOpenModal}
              />

              <ProviderSection />
            </main>
          </>
        )}
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
