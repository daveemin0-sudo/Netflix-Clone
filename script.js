// Configuration Settings
const option2 = {
method: 'GET',
hearders: {
    accept: 'application/json',
    Authorization: 
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNTFhYmRmYzAyZmMxYzU3MWIwZDhiN2MxZTA0OTVhOCIsIm5iZiI6MTc4MzkzMDgxNy40LCJzdWIiOiI2YTU0OWZjMWZjNjc3M2QwYTAyNTcwMmUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fZ06W9ayde9hmhSl4aj44zN4EMKqXCUajocjr-rV0nA,'
    }
};

// Configuration Settings
const TMDB_API_KEY = 'd51abdfc02fc1c571b0d8b7c1e0495a8'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Local Fallback Visual Data if network or API keys aren't working
const BACKUP_SHOWS = [
    {
        title: "Stranger Code",
        overview: "When a brilliant young developer vanishes from a tech hub, his friends uncover a web of secret APIs.",
        vote_average: 9.4,
        release_date: "2026-05-12",
        backdrop_path: "/photo-1626814026160-2237a95fc5a0",
        isBackup: true
    }
];

// Handles Navbar BG Transparency Transition on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 40) {
        navbar.classList.add('solid');
    } else {
        navbar.classList.remove('solid');
    }
});

// Generates the HTML Card Structure (targeted to style.css)
function createMovieCard(movie) {
    const cardImg = movie.isBackup 
        ? `https://images.unsplash.com${movie.backdrop_path}?q=80&w=500`
        : (movie.backdrop_path ? `${IMAGE_BASE_URL}/w500${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500');

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

// Controls the Hero Banner Visual Setup
function setupHero(movie) {
    const heroBanner = document.getElementById('hero-banner');
    document.getElementById('hero-title').innerText = movie.title || movie.name;
    document.getElementById('hero-desc').innerText = movie.overview || 'No description listed currently.';
    
    const bgImage = movie.isBackup
        ? `https://images.unsplash.com${movie.backdrop_path}?q=80&w=1920`
        : (movie.backdrop_path ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}` : "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1920");
        
    heroBanner.style.backgroundImage = `linear-gradient(to top, #141414, transparent 50%), linear-gradient(to right, rgba(0,0,0,0.85), transparent 60%), url('${bgImage}')`;
}

// Fetches live data from TMDB and populates rows
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
            fetch(urls.trending),
            fetch(urls.topRated),
            fetch(urls.popular),
            fetch(urls.upcoming),
            fetch(urls.action)
        ]);

        if (!trendingRes.ok || !topRatedRes.ok || !popularRes.ok || !upcomingRes.ok || !actionRes.ok) {
            throw new Error("API Fetch error. Please check your configs.");
        }

        const trendingData = await trendingRes.json();
        const topRatedData = await topRatedRes.json();
        const popularData = await popularRes.json();
        const upcomingData = await upcomingRes.json();
        const actionData = await actionRes.json();

        // Banner Setup
        if (trendingData.results && trendingData.results.length > 0) {
            setupHero(trendingData.results[0]);
        }

        // Injections
        document.getElementById('trending-row').innerHTML = (trendingData.results || []).slice(0, 12).map(m => createMovieCard(m)).join('');
        document.getElementById('top-rated-row').innerHTML = (topRatedData.results || []).slice(0, 12).map(m => createMovieCard(m)).join('');
        document.getElementById('popular-row').innerHTML = (popularData.results || []).slice(0, 12).map(m => createMovieCard(m)).join('');
        document.getElementById('upcoming-row').innerHTML = (upcomingData.results || []).slice(0, 12).map(m => createMovieCard(m)).join('');
        document.getElementById('action-row').innerHTML = (actionData.results || []).slice(0, 12).map(m => createMovieCard(m)).join('');

    } catch (err) {
        console.warn("Connection or credentials setup error. Resorting to safety default visuals:", err.message);
        setupHero(BACKUP_SHOWS[0]);
        const fallbackHTML = BACKUP_SHOWS.map(m => createMovieCard(m)).join('');
        document.getElementById('trending-row').innerHTML = fallbackHTML;
        document.getElementById('top-rated-row').innerHTML = fallbackHTML;
        document.getElementById('popular-row').innerHTML = fallbackHTML;
        document.getElementById('upcoming-row').innerHTML = fallbackHTML;
        document.getElementById('action-row').innerHTML = fallbackHTML;
    }
}

// Initial Launch Execution
loadContentFromTMDB();