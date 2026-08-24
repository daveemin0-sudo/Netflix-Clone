import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Watchlist from './pages/Watchlist';
import { useLikedMovies } from './hooks/useLikedMovies';

export default function App() {
  const { likedList, toggleLike, isLiked } = useLikedMovies();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              likedList={likedList}
              toggleLike={toggleLike}
              isLiked={isLiked}
            />
          }
        />
        <Route
          path="/watchlist"
          element={
            <Watchlist
              likedList={likedList}
              toggleLike={toggleLike}
              isLiked={isLiked}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
