// API Keys and Base URL, Configuration Settings
const TMDB_API_KEY = 'd51abdfc02fc1c571b0d8b7c1e0495a8'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

let isClickLocked = false; // Guardrail to prevent rapid click spamming
let heroBanner = null; // Holds the HeroBanner instance

// Handles Navbar BG Transparency Transition on Scroll
window.addEventListener('scroll', () => {

    const navbar = document.getElementById('navbar');
    if (window.scrollY > 40) {
        navbar.classList.add('solid');
    } else {
        navbar.classList.remove('solid');
    }
});

// Fetch array of liked movie IDs from LocalStorage
function getLikedMovies() {
    const saved = localStorage.getItem('cinematrix_liked');
    return saved ? JSON.parse(saved) : [];  // Default to empty array
}

// Save updated array of liked IDs back to LocalStorage
function saveLikedMovies(likedArray) {
    localStorage.setItem('cinematrix_liked', JSON.stringify(likedArray));  // Convert to string
}

function toggleLike(movieId, buttonElement) {
    if (isClickLocked) return;
    isClickLocked = true;
    setTimeout(() => { isClickLocked = false; }, 300); 

    let likedList = getLikedMovies();
    const idString = String(movieId);
    const labelSpan = buttonElement.querySelector('span');

    if (likedList.includes(idString)) {
        // Unlike action
        likedList = likedList.filter(id => id !== idString);
        if (labelSpan) labelSpan.innerText = "Like";
        buttonElement.classList.remove('liked');
    } else {
        // Like action
        likedList.push(idString);
        if (labelSpan) labelSpan.innerText = "Liked";
        buttonElement.classList.add('liked');
    }

    saveLikedMovies(likedList);
}

// Generates HTML Card Structure with Data Fallbacks & State Checks
function createMovieCard(movie) {
    // Edge Case: Fallback for missing poster/backdrop images smoothly
    const cardImg = movie.backdrop_path 
        ? `${IMAGE_BASE_URL}/w500${movie.backdrop_path}` 
        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500';

    // Edge Case: Fallback for empty titles
    const movieTitle = movie.title || movie.name || "Untitled Production";
    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '2026';  

    // Persist status lookups on load/reload matches
// Inside createMovieCard(movie)
const likedList = getLikedMovies();
const isLiked = likedList.includes(String(movie.id));
const btnText = isLiked ? "Liked" : "Like";
const btnClass = isLiked ? "btn-like liked" : "btn-like";

// Thumbs Up SVG Icon
const thumbSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" class="thumb-icon" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
    </svg>
`;

return `
    <div class="card" data-movie-id="${movie.id}" data-media-type="${movie.media_type || 'movie'}">
        <img src="${cardImg}" alt="${movieTitle}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500'">
        <div class="card-info">
            <p class="card-title">${movieTitle}</p>
            <p class="card-desc">${movie.overview || 'No overview synopsis recorded currently.'}</p>
            <div class="card-meta">
                <span class="rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '7.5'}</span>
                <span class="year">${releaseYear}</span>
            </div>
            <div class="card-actions">
                <button class="${btnClass}" data-movie-id="${movie.id}">
                    ${thumbSVG} <span>${btnText}</span>
                </button>
            </div>
        </div>
    </div>
`;
}

// Fetches the YouTube Video Key from TMDB
async function fetchMovieVideo(id, mediaType = 'movie') {
    const type = mediaType === 'tv' ? 'tv' : 'movie';
    const videoUrl = `${BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`;
    
    try {
        const response = await fetch(videoUrl);
        const data = await response.json();
        const trailer = data.results.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer');
        return trailer ? trailer.key : null;
    } catch (err) {
        console.error(`Failed to fetch video for ID ${id}:`, err);
        return null;
    }
}

/**
 * Class to manage the state and behavior of the hero banner slideshow.
 */
class HeroBanner {
    constructor(movies, cycleInterval = 25000, previewDuration = 20000) {
        this.movies = movies;
        this.currentIndex = 0;
        this.cycleInterval = cycleInterval;
        this.previewDuration = previewDuration;
        this.cycleTimer = null;
        this.trailerTimer = null;
        this.isMuted = true;
        this.player = null; // To hold the YouTube player instance

        this.elements = {
            banner: document.getElementById('hero-banner'),
            title: document.getElementById('hero-title'),
            desc: document.getElementById('hero-desc'),
            videoContainer: document.getElementById('hero-video-container'),
            playBtn: document.getElementById('play-btn'),
            infoBtn: document.querySelector('.btn-info'),
            dotsContainer: document.getElementById('hero-nav-dots'),
            muteBtn: document.getElementById('mute-btn')
        };

        this.elements.playBtn.addEventListener('click', () => {
            this.player ? this.stopTrailer() : this.playTrailer();
        });

        this.elements.muteBtn.addEventListener('click', () => {
            this.toggleMute();
        });

        this.elements.infoBtn.addEventListener('click', () => {
            const movie = this.movies[this.currentIndex];
            openMovieModal(movie.id, movie.media_type);
        });

    }

    // Start the slideshow
    start() {
        if (this.movies.length === 0) return;
        this.update(this.currentIndex);
        if (this.movies.length > 1) {
            this.cycleTimer = setInterval(() => this.cycle(), this.cycleInterval);
        }
    }

    // Cycle to the next movie
    cycle() {
        this.currentIndex = (this.currentIndex + 1) % this.movies.length;
        this.update(this.currentIndex);
    }

    // Jump to a specific movie
    jumpTo(index) {
        if (index < 0 || index >= this.movies.length || index === this.currentIndex) return;
        clearInterval(this.cycleTimer); // Stop auto-cycle
        this.currentIndex = index;
        this.update(this.currentIndex);
        // Restart auto-cycle after a manual jump
        if (this.movies.length > 1) {
            this.cycleTimer = setInterval(() => this.cycle(), this.cycleInterval);
        }
    }

    // Update the banner with a specific movie
    update(index) {
        const movie = this.movies[index];
        this.stopTrailer(); // Stop any previous trailer

        this.elements.title.innerText = movie.title || movie.name || "Featured Spotlight";
        this.elements.desc.innerText = movie.overview || 'No description listed currently.';

        const bgImage = movie.backdrop_path 
            ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}` 
            : "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1920";
        
        this.elements.banner.style.backgroundImage = `url('${bgImage}')`;
        
        this.updateNavDots();
        this.playTrailer();
    }

    // Play the trailer for the current movie
    async playTrailer() {
        if (this.player) return; // Player already exists
        const movie = this.movies[this.currentIndex];
        if (!movie) return;

        this.elements.playBtn.innerText = "Loading Video...";
        const youtubeKey = await fetchMovieVideo(movie.id, movie.media_type);

        this.updateMuteButton();

        if (youtubeKey) {
            // If YT API is ready, create player. Otherwise, queue it.
            if (window.YT && window.YT.Player) {
                this.createPlayer(youtubeKey);
            } else {
                window.queuedPlayer = { key: youtubeKey, banner: this };
            }
        } else {
            this.elements.playBtn.innerText = "Trailer Unavailable";
            setTimeout(() => this.restorePlayButton(), 2000);
        }
    }

    // Stop the currently playing trailer
    stopTrailer() {
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        this.elements.videoContainer.innerHTML = '';
        this.restorePlayButton();
        if (this.trailerTimer) {
            clearTimeout(this.trailerTimer);
            this.trailerTimer = null;
        }
    }

    createPlayer(youtubeKey) {
        // Create a div for the player to attach to
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        this.elements.videoContainer.innerHTML = ''; // Clear any old divs
        this.elements.videoContainer.appendChild(playerDiv);

        this.player = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: youtubeKey,
            playerVars: { autoplay: 1, controls: 0, loop: 1, playlist: youtubeKey, rel: 0, showinfo: 0, modestbranding: 1 },
            events: { 'onReady': (event) => this.onPlayerReady(event) }
        });

        window.queuedPlayer = null; // Clear the queue
    }

    onPlayerReady(event) {
        if (this.isMuted) {
            event.target.mute();
        } else {
            event.target.unMute();
        }
        event.target.playVideo();

        this.elements.playBtn.innerText = "Stop Trailer";
        // Set a timeout to stop the preview
        this.trailerTimer = setTimeout(() => this.stopTrailer(), this.previewDuration);
    }

    // Restore the "Play Trailer" button
    restorePlayButton() {
        this.elements.playBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg> Play Trailer`;
    }

    // Update the navigation dots
    updateNavDots() {
        // this.elements.dotsContainer.innerHTML = ''; // Clear existing dots
        // this.movies.forEach((_, index) => {
        //     const dot = document.createElement('div');
        //     dot.classList.add('hero-dot');
        //     dot.dataset.index = index; // Add index for click handling
        //     if (index === this.currentIndex) {
        //         dot.classList.add('active');
        //     }
        //     dot.addEventListener('click', () => this.jumpTo(index));
        //     this.elements.dotsContainer.appendChild(dot);
        // });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.player) {
            if (this.isMuted) {
                this.player.mute();
            } else {
                this.player.unMute();
            }
        }
        this.updateMuteButton();
    }

    updateMuteButton() {
        if (this.isMuted) {
            this.elements.muteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>`;
        } else {
            this.elements.muteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>`;
        }
    }
}


/**
 * Shuffles an array in place.
 * @param {Array} array The array to shuffle.  // eslint-disable-line
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// This global function is called by the YouTube Iframe API script when it's ready
function onYouTubeIframeAPIReady() {
    // If a player was queued before the API was ready, create it now
    if (window.queuedPlayer) {
        const { key, banner } = window.queuedPlayer;
        banner.createPlayer(key);
    }
}

// Safely renders an API response list or throws a clear empty UI state notice
function populateRow(elementId, moviesList) {
    const container = document.getElementById(elementId);
    // Edge Case: If array missing, empty, or completely failed response
    if (!moviesList || moviesList.length === 0) {
        container.innerHTML = `<p class="error-msg">No titles currently available for this category.</p>`;
        return;
    }
    container.innerHTML = moviesList.slice(0, 12).map(m => createMovieCard(m)).join('');

    // Use event delegation for card clicks and like buttons
    container.addEventListener('click', (e) => {
        const target = e.target;
        const likeButton = target.closest('.btn-like');
        const card = target.closest('.card');

        if (likeButton) {
            // Prevent modal from opening when like is clicked
            e.stopPropagation(); 
            toggleLike(likeButton.dataset.movieId, likeButton);
        } else if (card) {
            openMovieModal(card.dataset.movieId, card.dataset.mediaType);
        }
    });
}

// Helper to fetch and parse JSON, centralizing error handling
async function fetchAndParse(url) {  
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

// Modal Logic
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
    modalBody.innerHTML = ''; // Clear content for next time
}

modal.addEventListener('click', (e) => {
    // Close if the overlay (but not content) is clicked
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});
modalCloseBtn.addEventListener('click', closeModal);

async function fetchMovieDetails(id, mediaType = 'movie') {
    const url = `${BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    return await fetchAndParse(url);
}

// Renders movie details in the modal
function populateModal(details) {
    const backdropUrl = details.backdrop_path 
        ? `${IMAGE_BASE_URL}/original${details.backdrop_path}`
        : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1920';

    const director = details.credits?.crew.find(p => p.job === 'Director')?.name || 'N/A';
    const cast = details.credits?.cast.slice(0, 5).map(p => p.name).join(', ') || 'N/A';
    const genres = details.genres?.map(g => `<li class="genre-pill">${g.name}</li>`).join('') || '';

    modalBody.innerHTML = `
        <div class="modal-backdrop" style="background-image: url('${backdropUrl}')">
            <h2 class="modal-backdrop-title">${details.title || details.name}</h2>
        </div>
        <div class="modal-details">
            <div class="modal-details-left">
                <p class="modal-overview">${details.overview || 'No overview available.'}</p>
            </div>
            <div class="modal-details-right">
                <p class="meta-item">
                    <strong>Cast:</strong> 
                    <span>${cast}</span>
                </p>
                <p class="meta-item">
                    <strong>Director:</strong> 
                    <span>${director}</span>
                </p>
                <p class="meta-item">
                    <strong>Rating:</strong> 
                    <span>★ ${details.vote_average ? details.vote_average.toFixed(1) : 'N/A'}</span>
                </p>
                <p class="meta-item">
                    <strong>Release Date:</strong> 
                    <span>${details.release_date || details.first_air_date || 'N/A'}</span>
                </p>
                <div class="meta-item">
                    <strong>Genres:</strong>
                    <ul class="genres-list">
                        ${genres}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Close modal with the Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('visible')) {
        closeModal();
    }
});

// Main operational hook downloading array groups parallelly
async function loadContentFromTMDB() {
    const rowIds = ['trending-row', 'top-rated-row', 'popular-row', 'upcoming-row', 'action-row'];
    const showError = (message) => {
        rowIds.forEach(id => document.getElementById(id).innerHTML = `<p class="error-msg">${message}</p>`);
    };

    const urls = {
        trending: `${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`,
        topRated: `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`,
        popular: `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`,
        upcoming: `${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`,
        action: `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28`
    };

    // Fetch all parallelly
    try {
        const [trendingData, topRatedData, popularData, upcomingData, actionData] = await Promise.all([  
            fetchAndParse(urls.trending),
            fetchAndParse(urls.topRated),
            fetchAndParse(urls.popular),
            fetchAndParse(urls.upcoming),
            fetchAndParse(urls.action)
        ]);

        if (trendingData.results && trendingData.results.length > 0) {
            const allTrending = trendingData.results;
            shuffleArray(allTrending); // Randomize the list
            const heroMovies = allTrending.slice(0, 7); // Take a random selection of 7
            heroBanner = new HeroBanner(heroMovies);
            heroBanner.start();
        }

        // Render sections perfectly while maintaining independent storage lookup integrity
        populateRow('trending-row', trendingData.results);
        populateRow('top-rated-row', topRatedData.results);
        populateRow('popular-row', popularData.results);
        populateRow('upcoming-row', upcomingData.results);
        populateRow('action-row', actionData.results);
    } catch (err) {
        console.error("API Error caught:", err.message);
        showError("Failed to load content. Check your network connection or API key.");
    }
}

// Dictionary of direct official URLs for major streaming networks
const PROVIDER_URLS = {
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

// Fetches 20 top streaming platforms and renders them as clickable links
async function loadStreamingProviders() {
    const providersContainer = document.getElementById('providers-flex');
    if (!providersContainer) return;

    try {
        const data = await fetchAndParse(`${BASE_URL}/watch/providers/movie?api_key=${TMDB_API_KEY}&watch_region=US`);

        // Expand view to top 15 streaming providers
        const topProviders = (data.results || []).slice(0, 20).flat();

        if (topProviders.length === 0) {
            providersContainer.innerHTML = `<p class="error-msg">No providers currently loaded.</p>`;
            return;
        }

        providersContainer.innerHTML = topProviders.map(provider => {
            // Find official direct URL or fallback to TMDB watch portal link
            const targetLink = PROVIDER_URLS[provider.provider_name] || `https://www.themoviedb.org/watch`;

            return `
                <a href="${targetLink}" target="_blank" rel="noopener noreferrer" class="provider-card" title="Visit ${provider.provider_name}">
                    <img src="${IMAGE_BASE_URL}/w92${provider.logo_path}" alt="${provider.provider_name}">
                    <span class="provider-name">${provider.provider_name}</span>
                </a>
            `;
        }).join('');

    } catch (err) {
        console.warn("Failed to fetch streaming providers:", err);
        providersContainer.innerHTML = `<p class="error-msg">Unable to load streaming networks.</p>`;
    }
}
// Initial Launch Executions of API Calls
loadContentFromTMDB();
loadStreamingProviders();  