export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'd51abdfc02fc1c571b0d8b7c1e0495a8';
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const PROVIDER_URLS = {
  "Netflix": "https://www.netflix.com",
  "Amazon Prime Video": "https://www.primevideo.com",
  "Apple TV": "https://tv.apple.com",
  "Apple TV Plus": "https://tv.apple.com",
  "Disney Plus": "https://www.disneyplus.com",
  "Hulu": "https://www.hulu.com",
  "HBO Max": "https://www.max.com",
  "Max": "https://www.max.com",
  "Peacock": "https://www.peacocktv.com",
  "Peacock Premium": "https://www.peacocktv.com",
  "Paramount Plus": "https://www.paramountplus.com",
  "Crunchyroll": "https://www.crunchyroll.com",
  "Tubi TV": "https://tubitv.com",
  "Pluto TV": "https://pluto.tv",
  "YouTube Premium": "https://www.youtube.com/premium",
  "Vudu": "https://www.vudu.com",
  "Vudu Plus": "https://www.vudu.com"
};

export async function fetchAndParse(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function fetchTrendingAll() {
  return fetchAndParse(`${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`);
}

export async function fetchTopRated() {
  return fetchAndParse(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`);
}

export async function fetchPopular() {
  return fetchAndParse(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
}

export async function fetchUpcoming() {
  return fetchAndParse(`${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`);
}

export async function fetchAction() {
  return fetchAndParse(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28`);
}

export async function fetchMovieDetails(id, mediaType = 'movie') {
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  try {
    const url = `${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    return await fetchAndParse(url);
  } catch (error) {
    const fallbackType = type === 'movie' ? 'tv' : 'movie';
    try {
      const fallbackUrl = `${BASE_URL}/${fallbackType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
      return await fetchAndParse(fallbackUrl);
    } catch (err2) {
      console.error(`Failed to fetch details for ${id}:`, err2);
      return null;
    }
  }
}

export async function fetchMovieVideo(id, mediaType = 'movie') {
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const videoUrl = `${BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`;
  try {
    const data = await fetchAndParse(videoUrl);
    const trailer = (data.results || []).find(
      (vid) => vid.site === 'YouTube' && (vid.type === 'Trailer' || vid.type === 'Teaser')
    );
    return trailer ? trailer.key : (data.results?.[0]?.key || null);
  } catch (err) {
    console.error(`Failed to fetch video for ID ${id}:`, err);
    return null;
  }
}

export async function searchMulti(query) {
  const url = `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
  return fetchAndParse(url);
}

export async function fetchStreamingProviders() {
  const url = `${BASE_URL}/watch/providers/movie?api_key=${TMDB_API_KEY}&watch_region=US`;
  return fetchAndParse(url);
}
