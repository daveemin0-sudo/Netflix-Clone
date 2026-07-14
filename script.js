// Configuration Settings
const TMDB_API_KEY = 'd51abdfc02fc1c571b0d8b7c1e0495a8'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Local Fallback Visual Data if network or API keys aren't working
const BACKUP_SHOWS = [
    {
        title: "Stranger Code",
        overview: "When a brilliant young developer vanishes from a tech hub, his friends uncover a web of secret APIs and a terrifying artificial intelligence.",
        vote_average: 9.4,
        release_date: "2026-05-12",
        backdrop_path: "/photo-1626814026160-2237a95fc5a0",
        isBackup: true
    }
];

// Handles the Navbar Background Transitioning on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 40) {
        navbar.classList.add('bg-[#141414]');
        navbar.classList.remove('bg-gradient-to-b', 'from-black/80', 'to-transparent');
    } else {
        navbar.classList.remove('bg-[#141414]');
        navbar.classList.add('bg-gradient-to-b', 'from-black/80', 'to-transparent');
    }
});

// Generates structural template rows for movie slides
function createMovieCard(movie) {
    const cardImg = movie.isBackup 
        ? `https://images.unsplash.com${movie.backdrop_path}?q=80&w=500`
        : (movie.backdrop_path ? `${IMAGE_BASE_URL}/w500${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500');

    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '2026';

    return `
        <div class="min-w-[150px] sm:min-w-[200px] md:min-w-[260px] transform hover:scale-105 transition-transform duration-300 ease-out cursor-pointer rounded bg-[#181818] group relative shadow-lg overflow-hidden flex-shrink-0">
            <img src="${cardImg}" alt="${movie.title || movie.name}" class="w-full h-28 sm:h-36 md:h-40 object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p class="text-xs font-bold truncate text-white">${movie.title || movie.name}</p>
                <p class="text-[10px] text-gray-400 mt-1 line-clamp-2">${movie.overview || 'No overview available.'}</p>
                <div class="flex items-center justify-between mt-1.5">
                    <span class="text-[10px] text-green-400 font-bold">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : '7.5'} Rating</span>
                    <span class="text-[9px] px-1 bg-zinc-800 text-gray-300 rounded border border-gray-700">${releaseYear}</span>
                </div>
            </div>
        </div>
    `;
}

// Controls the main large Spotlight Hero section banner image and description
function setupHero(movie) {
    const heroBanner = document.getElementById('hero-banner');
    document.getElementById('hero-title').innerText = movie.title || movie.name;
    document.getElementById('hero-desc').innerText = movie.overview || 'No plot description listed currently.';
    
    const bgImage = movie.isBackup
        ? `https://images.unsplash.com${movie.backdrop_path}?q=80&w=1920`
        : (movie.backdrop_path ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}` : "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1920");
        
    heroBanner.style.backgroundImage = `linear-gradient(to top, #141414, transparent 50%), linear-gradient(to right, rgba(0,0,0,0.8), transparent 60%), url('${bgImage}')`;
}

// Injects data mapping onto target row arrays
function displayContent(showsList) {
    setupHero(showsList[0]);

    const laneOneContent = showsList.slice(0, 10);
    const laneTwoContent = showsList.slice(10, 20); 

    document.getElementById('trending-row').innerHTML = laneOneContent.map(movie => createMovieCard(movie)).join('');
    if (laneTwoContent.length > 0) {
        document.getElementById('blockbuster-row').innerHTML = laneTwoContent.map(movie => createMovieCard(movie)).join('');
    } else {
        // Fallback duplication offset array if lane two database responses are narrow
        document.getElementById('blockbuster-row').innerHTML = laneOneContent.reverse().map(movie => createMovieCard(movie)).join('');
    }
}

// Fetches live data from TMDB endpoints
async function loadContentFromTMDB() {
    const trendingUrl = `${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`;
    const topRatedUrl = `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`;

    try {
        const [trendingResponse, topRatedResponse] = await Promise.all([
            fetch(trendingUrl),
            fetch(topRatedUrl)
        ]);

        if (!trendingResponse.ok || !topRatedResponse.ok) {
            throw new Error("Invalid response status or wrong key configurations.");
        }

        const trendingData = await trendingResponse.json();
        const topRatedData = await topRatedResponse.json();

        const trendingMovies = trendingData.results || [];
        const topRatedMovies = topRatedData.results || [];

        if (trendingMovies.length > 0) {
            setupHero(trendingMovies[0]);
            document.getElementById('trending-row').innerHTML = trendingMovies.slice(0, 12).map(movie => createMovieCard(movie)).join('');
        }
        
        if (topRatedMovies.length > 0) {
            document.getElementById('blockbuster-row').innerHTML = topRatedMovies.slice(0, 12).map(movie => createMovieCard(movie)).join('');
        }

    } catch (err) {
        console.warn("API request issue. Running secure visual backup system:", err.message);
        setupHero(BACKUP_SHOWS[0]);
        document.getElementById('trending-row').innerHTML = BACKUP_SHOWS.map(movie => createMovieCard(movie)).join('');
        document.getElementById('blockbuster-row').innerHTML = BACKUP_SHOWS.map(movie => createMovieCard(movie)).join('');
    }
}

// Execute logic loop on launch
loadContentFromTMDB();