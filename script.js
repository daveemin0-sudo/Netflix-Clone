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

let currentHeroMovie = null; // Keeps track of what is playing in the banner

// Handles Navbar BG Transparency Transition on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 40) {
        navbar.classList.add('solid');
    } else {
        navbar.classList.remove('solid');
    }
});

// Fetches the YouTube Video Key from TMDB
async function fetchMovieVideo(id, mediaType = 'movie') {
    // TMDB treats trending items as mixed media types ('movie' or 'tv')
    const type = mediaType === 'tv' ? 'tv' : 'movie';
    const videoUrl = `${BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`;
    
    try {
        const response = await fetch(videoUrl);
        const data = await response.json();
        // Look specifically for a Trailer hosted on YouTube
        const trailer = data.results.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer');
        return trailer ? trailer.key : null;
    } catch (err) {
        console.error("Error loading video payload:", err);
        return null;
    }
}

// // Local Fallback Visual Data if network or API keys aren't working
// const BACKUP_SHOWS = [
//     {
//         title: "Stranger Code",
//         overview: "When a brilliant young developer vanishes from a tech hub, his friends uncover a web of secret APIs.",
//         vote_average: 9.4,
//         release_date: "2026-05-12",
//         backdrop_path: "/photo-1626814026160-2237a95fc5a0",
//         isBackup: true
//     }
// ];

// // Handles Navbar BG Transparency Transition on Scroll
// window.addEventListener('scroll', () => {
//     const navbar = document.getElementById('navbar');
//     if (window.scrollY > 40) {
//         navbar.classList.add('solid');
//     } else {
//         navbar.classList.remove('solid');
//     }
// });

// // Handles Movie Card Creation, Generates the HTML Card Structure (targeted to style.css)
// function createMovieCard(movie) {
//     const cardImg = movie.isBackup 
//         ? `https://images.unsplash.com${movie.backdrop_path}?q=80&w=500`
//         : (movie.backdrop_path ? `${IMAGE_BASE_URL}/w500${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500');

//     const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '2026';

//     return `
//         <div class="card">
//             <img src="${cardImg}" alt="${movie.title || movie.name}" class="card-img">
//             <div class="card-info">
//                 <p class="card-title">${movie.title || movie.name}</p>
//                 <p class="card-desc">${movie.overview || 'No overview available.'}</p>
//                 <div class="card-meta">
//                     <span class="rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '7.5'}</span>
//                     <span class="year">${releaseYear}</span>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// Handles Movie Card Creation, Generates the HTML Card Structure (targeted to style.css)
function setupHero(movie) {
    currentHeroMovie = movie; 
    const heroBanner = document.getElementById('hero-banner');
    document.getElementById('hero-title').innerText = movie.title || movie.name;
    document.getElementById('hero-desc').innerText = movie.overview || 'No description listed currently.';
    
    // Clear out any running video and kill any remaining active timers
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

// Configuration Settings (Add this at the top with your other configurations)
const PREVIEW_DURATION = 110000; // 110 seconds
let trailerTimeout = null;      // Keeps track of the active countdown timer

// Click Event Listener for Play Button with Automatic Timeout
document.getElementById('play-btn').addEventListener('click', async () => {
    if (!currentHeroMovie || currentHeroMovie.isBackup) return;

    const videoContainer = document.getElementById('hero-video-container');
    const playBtn = document.getElementById('play-btn');

    // Function to safely stop the video and reset the UI
    const stopTrailerPreview = () => {
        videoContainer.innerHTML = '';
        playBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg> Play Trailer`;
        
        // Clear the timeout tracking if stopped manually early
        if (trailerTimeout) {
            clearTimeout(trailerTimeout);
            trailerTimeout = null;
        }
    };

    // If it's already playing, clicking it resets/stops it instantly
    if (videoContainer.innerHTML !== '') {
        stopTrailerPreview();
        return;
    }

    playBtn.innerText = "Loading Video...";
    const youtubeKey = await fetchMovieVideo(currentHeroMovie.id, currentHeroMovie.media_type);

    if (youtubeKey) {
        // Inject YouTube Player
        videoContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeKey}&rel=0&showinfo=0&modestbranding=1" 
                    frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
            </iframe>
        `;
        playBtn.innerText = "Stop Trailer";

        // Start the automatic countdown timer to stop the video
        trailerTimeout = setTimeout(() => {
            console.log("Preview limit reached. Stopping trailer automatically.");
            stopTrailerPreview();
        }, PREVIEW_DURATION);

    } else {
        playBtn.innerText = "Trailer Unavailable";
        setTimeout(() => { playBtn.innerText = "Play Trailer"; }, 2000);
    }
});

// Generates the HTML Card Structure
function createMovieCard(movie) {
    const cardImg = movie.backdrop_path 
        ? `${IMAGE_BASE_URL}/w500${movie.backdrop_path}` 
        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500';

    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '2026';

    return `
        <div class="card">
            <img src="${cardImg}" alt="${movie.title || movie.name}" class="card-img">
            <div class="card-info">
                <p class="card-title">${movie.title || movie.name}</p>
                <p class="card-desc">${movie.overview || 'No overview available.'}</p>
                <div class="card-meta">
                    <span class="rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '7.5'}</span>
                    <span class="year">${releaseYear}</span>
                </div>
            </div>
        </div>
    `;
}

// Fetches data from TMDB and populates rows
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

        const trendingData = await trendingRes.json();
        const topRatedData = await topRatedRes.json();
        const popularData = await popularRes.json();
        const upcomingData = await upcomingRes.json();
        const actionData = await actionRes.json();

        if (trendingData.results && trendingData.results.length > 0) {
            setupHero(trendingData.results[0]);
        }

        document.getElementById('trending-row').innerHTML = (trendingData.results || []).slice(0, 15).map(m => createMovieCard(m)).join('');
        document.getElementById('top-rated-row').innerHTML = (topRatedData.results || []).slice(0, 15).map(m => createMovieCard(m)).join('');
        document.getElementById('popular-row').innerHTML = (popularData.results || []).slice(0, 15).map(m => createMovieCard(m)).join('');
        document.getElementById('upcoming-row').innerHTML = (upcomingData.results || []).slice(0, 15).map(m => createMovieCard(m)).join('');
        document.getElementById('action-row').innerHTML = (actionData.results || []).slice(0, 15).map(m => createMovieCard(m)).join('');

    } catch (err) {
        console.warn("API Error:", err.message);
    }
}

loadContentFromTMDB();