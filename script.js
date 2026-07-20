// API Options
const option2 = {
method: 'GET',
hearders: {
    accept: 'application/json',
    Authorization: 
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNTFhYmRmYzAyZmMxYzU3MWIwZDhiN2MxZTA0OTVhOCIsIm5iZiI6MTc4MzkzMDgxNy40LCJzdWIiOiI2YTU0OWZjMWZjNjc3M2QwYTAyNTcwMmUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fZ06W9ayde9hmhSl4aj44zN4EMKqXCUajocjr-rV0nA,'
    }
};

// API Keys and Base URL, Configuration Settings
const TMDB_API_KEY = 'd51abdfc02fc1c571b0d8b7c1e0495a8'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

let currentHeroMovie = null; 
let trailerTimeout = null;      
let isClickLocked = false; // Guardrail to prevent rapid click spamming

// Handles Navbar BG Transparency Transition on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 40) {
        navbar.classList.add('solid');
    } else {
        navbar.classList.remove('solid');
    }
});

// Helper: Fetch array of liked movie IDs from LocalStorage
function getLikedMovies() {
    const saved = localStorage.getItem('cinematrix_liked');
    return saved ? JSON.parse(saved) : [];
}

// Helper: Save updated array of liked IDs back to LocalStorage
function saveLikedMovies(likedArray) {
    localStorage.setItem('cinematrix_liked', JSON.stringify(likedArray));
}

// 2 & 3. Toggles Liking Logic Independently
function toggleLike(movieId, buttonElement) {
    // Edge Case Guard: Prevent rapid spam clicking execution
    if (isClickLocked) return;
    isClickLocked = true;
    setTimeout(() => { isClickLocked = false; }, 300); // 300ms cooldown flag

    let likedList = getLikedMovies();
    const idString = String(movieId);

    if (likedList.includes(idString)) {
        // Already liked -> Remove it (Unlike)
        likedList = likedList.filter(id => id !== idString);
        buttonElement.innerText = "Like";
        buttonElement.classList.remove('liked');
    } else {
        // Not liked yet -> Add it (Like)
        likedList.push(idString);
        buttonElement.innerText = "Unlike";
        buttonElement.classList.add('liked');
    }

    saveLikedMovies(likedList);
}

// 1 & 4. Generates HTML Card Structure with Data Fallbacks & State Checks
function createMovieCard(movie) {
    // Edge Case: Fallback for missing poster/backdrop images smoothly
    const cardImg = movie.backdrop_path 
        ? `${IMAGE_BASE_URL}/w500${movie.backdrop_path}` 
        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500';

    // Edge Case: Fallback for empty titles
    const movieTitle = movie.title || movie.name || "Untitled Production";
    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '2026';

    // State Correctness: Persist status lookups on load/reload matches
    const likedList = getLikedMovies();
    const isLiked = likedList.includes(String(movie.id));
    const btnText = isLiked ? "Unlike" : "Like";
    const btnClass = isLiked ? "btn-like liked" : "btn-like";

    return `
        <div class="card">
            <img src="${cardImg}" alt="${movieTitle}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500'">
            <div class="card-info">
                <p class="card-title">${movieTitle}</p>
                <p class="card-desc">${movie.overview || 'No overview synopsis recorded currently.'}</p>
                <div class="card-meta">
                    <span class="rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '7.5'}</span>
                    <span class="year">${releaseYear}</span>
                </div>
                <!-- Combined Like/Unlike Interactive Button -->
                <div class="card-actions">
                    <button class="${btnClass}" onclick="toggleLike(${movie.id}, this)">${btnText}</button>
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
        return null;
    }
}

// Controls the Hero Banner Visual Setup
function setupHero(movie) {
    currentHeroMovie = movie; 
    const heroBanner = document.getElementById('hero-banner');
    document.getElementById('hero-title').innerText = movie.title || movie.name || "Featured Spotlight";
    document.getElementById('hero-desc').innerText = movie.overview || 'No description listed currently.';
    
    document.getElementById('hero-video-container').innerHTML = '';
    if (trailerTimeout) {
        clearTimeout(trailerTimeout);
        trailerTimeout = null;
    }

    const bgImage = movie.backdrop_path 
        ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}` 
        : "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1920";
        
    heroBanner.style.backgroundImage = `url('${bgImage}')`;
}

// Click Event Listener for Play Button with Automatic Timeout
document.getElementById('play-btn').addEventListener('click', async () => {
    if (!currentHeroMovie) return;

    const videoContainer = document.getElementById('hero-video-container');
    const playBtn = document.getElementById('play-btn');

    if (videoContainer.innerHTML !== '') {
        stopTrailerPreview();
        return;
    }

    playBtn.innerText = "Loading Video...";
    const youtubeKey = await fetchMovieVideo(currentHeroMovie.id, currentHeroMovie.media_type);

    if (youtubeKey) {
        videoContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeKey}&rel=0&showinfo=0&modestbranding=1" 
                    frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
            </iframe>
        `;
        playBtn.innerText = "Stop Trailer";

        trailerTimeout = setTimeout(() => {
            stopTrailerPreview();
        }, PREVIEW_DURATION);

    } else {
        playBtn.innerText = "Trailer Unavailable";
        setTimeout(() => { playBtn.innerText = "Play Trailer"; }, 2000);
    }
});

function stopTrailerPreview() {
    document.getElementById('hero-video-container').innerHTML = '';
    document.getElementById('play-btn').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
        </svg> Play Trailer`;
    
    if (trailerTimeout) {
        clearTimeout(trailerTimeout);
        trailerTimeout = null;
    }
}

// Helper: Safely renders an API response list or throws a clear empty UI state notice
function populateRow(elementId, moviesList) {
    const container = document.getElementById(elementId);
    // Edge Case: If array missing, empty, or completely failed response
    if (!moviesList || moviesList.length === 0) {
        container.innerHTML = `<p class="error-msg">No titles currently available for this category.</p>`;
        return;
    }
    container.innerHTML = moviesList.slice(0, 12).map(m => createMovieCard(m)).join('');
}

// Main operational hook downloading array groups parallelly
async function loadContentFromTMDB() {
    const urls = {
        trending: `${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`,
        topRated: `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`,
        popular: `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`,
        upcoming: `${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`,
        action: `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28`
    };

    try {
        const [trendingRes, topRatedRes, popularRes, upcomingRes, actionRes] = await Promise.all([
            fetch(urls.trending), fetch(urls.topRated), fetch(urls.popular), fetch(urls.upcoming), fetch(urls.action)
        ]);

        // Break explicitly to trigger catch blocks on bad headers or dead keys
        if (!trendingRes.ok || !topRatedRes.ok || !popularRes.ok || !upcomingRes.ok || !actionRes.ok) {
            throw new Error("HTTP failure loading server response streams.");
        }

        const trendingData = await trendingRes.json();
        const topRatedData = await topRatedRes.json();
        const popularData = await popularRes.json();
        const upcomingData = await upcomingRes.json();
        const actionData = await actionRes.json();

        if (trendingData.results && trendingData.results.length > 0) {
            setupHero(trendingData.results[0]);
        }

        // Render sections perfectly while maintaining independent storage lookup integrity
        populateRow('trending-row', trendingData.results);
        populateRow('top-rated-row', topRatedData.results);
        populateRow('popular-row', popularData.results);
        populateRow('upcoming-row', upcomingData.results);
        populateRow('action-row', actionData.results);

    } catch (err) {
        console.warn("API Error caught:", err.message);
        // Edge Case: Handle complete network down states gracefully for every visible container element
        const rows = ['trending-row', 'top-rated-row', 'popular-row', 'upcoming-row', 'action-row'];
        rows.forEach(row => {
            document.getElementById(row).innerHTML = `<p class="error-msg">Failed to load content. Check your network connection.</p>`;
        });
    }
}

// Initial Launch Execution
loadContentFromTMDB()