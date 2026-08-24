import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cinematrix_liked';

export function useLikedMovies() {
  const [likedList, setLikedList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(likedList));
    } catch (e) {
      console.error('Failed to save liked movies to localStorage:', e);
    }
  }, [likedList]);

  const toggleLike = useCallback((movieId) => {
    const idStr = String(movieId);
    setLikedList((prev) => {
      if (prev.includes(idStr)) {
        return prev.filter((id) => id !== idStr);
      } else {
        return [...prev, idStr];
      }
    });
  }, []);

  const isLiked = useCallback(
    (movieId) => likedList.includes(String(movieId)),
    [likedList]
  );

  return { likedList, toggleLike, isLiked };
}
