// --- Configuration ---
const TMDB_API_KEY = 'd51abdfc02fc1c571b0d8b7c1e0495a8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// --- LocalStorage Helpers (Shared Logic) ---
function getLikedMovies() {
    const saved = localStorage.getItem('cinematrix_liked');
    return saved ? JSON.parse(saved) : [];
}

function saveLikedMovies(likedArray) {
    localStorage.setItem('cinematrix_liked', JSON.stringify(likedArray));
}

function toggleLike(movieId, buttonElement) {
    let likedList = getLikedMovies();
    const idString = String(movieId);

    if (likedList.includes(idString)) {
        likedList = likedList.filter(id => id !== idString);
        // In the context of the watchlist, removing it from likes means removing it from view.
        // We'll just reload the list for simplicity.
        saveLikedMovies(likedList);
        loadWatchlist(); // Reload the watchlist to reflect the change
    } else {
        // This case is less likely on this page, but for consistency:
        likedList.push(idString);
        saveLikedMovies(likedList);
    }
}

// --- API Fetching ---
async function fetchAndParse(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

async function fetchMovieDetails(id) {
    // A movie can be a 'movie' or a 'tv' show. We try 'movie' first.
    // A more robust solution might store the media_type in localStorage as well.
    try {
        const url = `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
        return await fetchAndParse(url);
    } catch (error) {
        console.warn(`Could not fetch ID ${id} as a movie, trying as a TV show.`);
        try {
            const url = `${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
            return await fetchAndParse(url);
        } catch (tvError) {
            console.error(`Failed to fetch details for ID ${id} as both movie and TV show.`, tvError);
            return null; // Return null if both fail
        }
    }
}

// --- DOM Manipulation ---

function createMovieCard(movie) {
    const cardImg = movie.backdrop_path ? `${IMAGE_BASE_URL}/w500${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500';
    const movieTitle = movie.title || movie.name || "Untitled";
    const releaseYear = (movie.release_date || movie.first_air_date || '2026').split('-')[0];

    const thumbSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" class="thumb-icon" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
        </svg>`;

    return `
        <div class="card" data-movie-id="${movie.id}" data-media-type="${movie.media_type || (movie.title ? 'movie' : 'tv')}">
            <img src="${cardImg}" alt="${movieTitle}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500'">
            <div class="card-info">
                <p class="card-title">${movieTitle}</p>
                <div class="card-meta">
                    <span class="rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    <span class="year">${releaseYear}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-like liked" data-movie-id="${movie.id}">
                        ${thumbSVG} <span>Liked</span>
                    </button>
                </div>
            </div>
        </div>`;
}

async function loadWatchlist() {
    const grid = document.getElementById('watchlist-grid');
    const likedMovieIds = getLikedMovies();

    if (likedMovieIds.length === 0) {
        grid.innerHTML = `<p class="info-msg">Your watchlist is empty. Add movies by clicking the "Like" button.</p>`;
        return;
    }

    grid.innerHTML = `<p class="loading-msg">Loading your list...</p>`;

    try {
        const moviePromises = likedMovieIds.map(id => fetchMovieDetails(id));
        const movies = await Promise.all(moviePromises);
        const validMovies = movies.filter(movie => movie !== null); // Filter out any that failed to fetch

        if (validMovies.length === 0) {
            grid.innerHTML = `<p class="info-msg">Could not load details for the movies on your list.</p>`;
            return;
        }

        grid.innerHTML = validMovies.map(movie => createMovieCard(movie)).join('');
    } catch (error) {
        console.error("Failed to load watchlist details:", error);
        grid.innerHTML = `<p class="error-msg">There was an error loading your watchlist.</p>`;
    }
}

// --- Modal Logic (Simplified for Watchlist) ---
const modal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');

async function openMovieModal(movieId, mediaType) {
    try {
        const details = await fetchMovieDetails(movieId, mediaType);
        populateModal(details);
        modal.classList.add('visible');
        document.body.classList.add('modal-open');
    } catch (err) {
        console.error("Could not open modal:", err);
    }
}

function closeModal() {
    modal.classList.remove('visible');
    document.body.classList.remove('modal-open');
    modalBody.innerHTML = '';
}

function populateModal(details) {
    const backdropUrl = details.backdrop_path ? `${IMAGE_BASE_URL}/original${details.backdrop_path}` : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1920';
    const director = details.credits?.crew.find(p => p.job === 'Director')?.name || 'N/A';
    const cast = details.credits?.cast.slice(0, 5).map(p => p.name).join(', ') || 'N/A';

    modalBody.innerHTML = `
        <div class="modal-backdrop" style="background-image: url('${backdropUrl}')">
            <h2 class="modal-backdrop-title">${details.title || details.name}</h2>
        </div>
        <div class="modal-details">
            <div class="modal-details-left">
                <p class="modal-overview">${details.overview || 'No overview available.'}</p>
            </div>
            <div class="modal-details-right">
                <p class="meta-item"><strong>Cast:</strong> <span>${cast}</span></p>
                <p class="meta-item"><strong>Director:</strong> <span>${director}</span></p>
                <p class="meta-item"><strong>Rating:</strong> <span>★ ${details.vote_average ? details.vote_average.toFixed(1) : 'N/A'}</span></p>
            </div>
        </div>`;
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', loadWatchlist);

document.getElementById('watchlist-grid').addEventListener('click', (e) => {
    const target = e.target;
    const likeButton = target.closest('.btn-like');
    const card = target.closest('.card');

    if (likeButton) {
        e.stopPropagation();
        toggleLike(likeButton.dataset.movieId, likeButton);
    } else if (card) {
        openMovieModal(card.dataset.movieId, card.dataset.mediaType);
    }
});

modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
});
modalCloseBtn.addEventListener('click', closeModal);
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('visible')) closeModal();
});