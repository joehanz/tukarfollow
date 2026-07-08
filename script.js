const API_KEY = 'c000d7b8b0f5ee16b98b6103009745d8'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w780';

const feedContainer = document.getElementById('feedContainer');
const searchContainer = document.getElementById('searchContainer');
const infoPanel = document.getElementById('infoPanel');
const panelContentArea = document.getElementById('panelContentArea');
const videoPlayerContainer = document.getElementById('videoPlayerContainer');
const playerArea = document.getElementById('playerArea');

let moviesData = [];
let activeMovieIndex = 0;
let currentPage = 1;
let currentActiveSection = null; 
let isDesktop = false;

// Deteksi Device
function detectDevice() {
    if (window.innerWidth > 768) {
        isDesktop = true;
        const notifier = document.getElementById('desktopNotifier');
        if (notifier) notifier.style.display = 'flex';
    }
}

function closeNotifier() {
    const notifier = document.getElementById('desktopNotifier');
    if (notifier) {
        notifier.style.transition = 'opacity 0.3s ease';
        notifier.style.opacity = '0';
        setTimeout(() => { notifier.style.display = 'none'; }, 300);
    }
}

// Scroll Navigasi
function scrollFeed(direction) {
    if (!feedContainer) return;
    const cardHeight = window.innerHeight;
    if (direction === 'down') {
        feedContainer.scrollBy({ top: cardHeight, behavior: 'smooth' });
    } else if (direction === 'up') {
        feedContainer.scrollBy({ top: -cardHeight, behavior: 'smooth' });
    }
}

// Ambil Data Film Populer
async function fetchMovies(page = 1) {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        if(page === 1) moviesData = data.results;
        else moviesData = [...moviesData, ...data.results];

        renderFeed(moviesData);
    } catch (error) {
        loadFallbackData();
    }
}

// Data Cadangan Jika Gagal Ambil dari TMDB
function loadFallbackData() {
    const fallback = [
        { id: 726888, title: 'Heartbeast', overview: 'A young girl discovers her passion for rap music...', release_date: '2022-11-04', poster_path: '', origin_country: ['FI'] },
        { id: 157336, title: 'Interstellar', overview: 'A team of explorers travel through a wormhole in space...', release_date: '2014-11-05', poster_path: '/gEU2Qv0vHB77Yp7v6v94goI86v3.jpg', origin_country: ['US'] }
    ];
    moviesData = [...moviesData, ...fallback];
    renderFeed(moviesData);
}

// Tampilkan Daftar Film
function renderFeed(movies) {
    if (!feedContainer) return;
    feedContainer.innerHTML = '';
    movies.forEach((movie, index) => {
        let posterFullUrl = movie.poster_path 
            ? `${IMAGE_URL}${movie.poster_path}` 
            : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500'; 

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.backgroundImage = `url('${posterFullUrl}')`;
        
        const year = movie.release_date ? movie.release_date.split('-')[0] : '-';
        const arrowStyle = isDesktop ? 'display: flex;' : 'display: none;';

        card.innerHTML = `
            <div class="overlay"></div>
            <div class="top-title">${movie.title}</div>
            
            <div class="play-btn-container" onclick="playMovie(${movie.id})">
                <div class="play-circle"><i data-lucide="play" fill="#fff" size="32" style="margin-left:5px;"></i></div>
            </div>

            <div class="main-content">
                <div class="side-actions">
                    <div class="arrow-actions-container" style="${arrowStyle}">
                        <div class="inline-scroll-arrow" onclick="scrollFeed('up')">
                            <i data-lucide="chevron-up" size="22"></i>
                        </div>
                        <div class="inline-scroll-arrow" onclick="scrollFeed('down')">
                            <i data-lucide="chevron-down" size="22"></i>
                        </div>
                    </div>

                    <div class="action-item" onclick="toggleSection(event, ${index}, 'info')">
                        <i data-lucide="info" size="28"></i>
                        <span>Info</span>
                    </div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'release')">
                        <i data-lucide="calendar" size="28"></i>
                        <span>${year}</span>
                    </div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'genre')">
                        <i data-lucide="clapperboard" size="28"></i>
                        <span>Genre</span>
                    </div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'country')">
                        <i data-lucide="globe" size="28"></i>
                        <span>Country</span>
                    </div>
                </div>
            </div>
        `;
        feedContainer.appendChild(card);
    });

    // Tombol Muat Lebih Banyak
    const allCards = feedContainer.querySelectorAll('.movie-card');
    if (allCards.length > 0) {
        const lastCard = allCards[allCards.length - 1];
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'inline-load-more';
        loadMoreContainer.innerHTML = `
            <button class="load-more-btn-inline" onclick="loadNextPage()">
                <i data-lucide="plus" size="16"></i> Load More (Page ${currentPage + 1})
            </button>
        `;
        const mainContent = lastCard.querySelector('.main-content');
        if (mainContent) mainContent.appendChild(loadMoreContainer);
        else lastCard.appendChild(loadMoreContainer);
    }

    if (window.lucide) lucide.createIcons();
}

function loadNextPage() {
    currentPage++;
    fetchMovies(currentPage);
}

// ==============================================
// ✅ INFO: Sinopsis saja + Negara dari data TMDB
// ==============================================
async function toggleSection(event, index, section) {
    event.stopPropagation();
    if (!infoPanel || !panelContentArea) return;

    const movie = moviesData[index];
    if (!movie) return;

    if (infoPanel.classList.contains('show') && currentActiveSection === section) {
        infoPanel.classList.remove('show');
        currentActiveSection = null;
        return;
    }

    currentActiveSection = section;
    panelContentArea.innerHTML = `<div style="text-align:center; padding:20px; color:#fff;">Loading...</div>`;
    infoPanel.classList.add('show');

    try {
        const resDetail = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`);
        const detailData = await resDetail.json();

        let htmlContent = '';

        switch(section) {
            case 'info':
                // Hanya sinopsis saja
                htmlContent = `
                    <p style="line-height:1.7; font-size:15px; color:#fff;">${detailData.overview || movie.overview || 'No synopsis available.'}</p>
                `;
                break;
            case 'release':
                htmlContent = `
                    <p style="color:#fff;"><strong>Release Date:</strong><br>${detailData.release_date || movie.release_date || 'Unknown'}</p>
                    <p style="margin-top:10px; color:#fff;"><strong>Runtime:</strong><br>${detailData.runtime ? `${detailData.runtime} minutes` : 'Unknown'}</p>
                `;
                break;
            case 'genre':
                let genreList = [];
                if (detailData.genres && detailData.genres.length > 0) {
                    genreList = detailData.genres.map(g => g.name);
                } else if (movie.genre_ids) {
                    const genreMap = {
                        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary',
                        18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
                        9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction', 10770: 'TV Movie',
                        53: 'Thriller', 10752: 'War', 37: 'Western'
                    };
                    genreList = movie.genre_ids.map(id => genreMap[id] || 'Other');
                }
                htmlContent = `<p style="color:#fff;"><strong>Genre:</strong><br>${genreList.join(', ') || 'Not specified'}</p>`;
                break;
            case 'country':
                // ✅ Ambil langsung dari data TMDB, bukan kode
                let countryList = [];
                if (detailData.production_countries && detailData.production_countries.length > 0) {
                    countryList = detailData.production_countries.map(c => c.name);
                } else if (movie.origin_country && movie.origin_country.length > 0) {
                    const countryMap = {
                        'US': 'United States of America', 'FI': 'Finland', 'KR': 'South Korea',
                        'JP': 'Japan', 'ID': 'Indonesia', 'GB': 'United Kingdom', 'FR': 'France',
                        'CN': 'China', 'HK': 'Hong Kong', 'TH': 'Thailand', 'IN': 'India', 'AU': 'Australia',
                        'DE': 'Germany', 'IT': 'Italy', 'ES': 'Spain', 'CA': 'Canada', 'BR': 'Brazil'
                    };
                    countryList = movie.origin_country.map(c => countryMap[c] || c);
                }
                htmlContent = `<p style="color:#fff;"><strong>Country:</strong><br>${countryList.join(', ') || 'Not specified'}</p>`;
                break;
        }

        panelContentArea.innerHTML = htmlContent;
        if (window.lucide) lucide.createIcons();

    } catch (err) {
        panelContentArea.innerHTML = `<p style="color:#ff6b6b;">Failed to load details.</p>`;
    }
}

// ==============================================
// ✅ Pencarian ke seluruh TMDB + tampilan terang/terlihat
// ==============================================
function playMovie(tmdbId) {
    window.location.href = `watch.html?id=${tmdbId}`;
}

const closePlayerBtn = document.getElementById('closePlayerBtn');
if (closePlayerBtn) {
    closePlayerBtn.addEventListener('click', () => {
        if (playerArea) playerArea.innerHTML = ''; 
        if (videoPlayerContainer) videoPlayerContainer.classList.remove('active');
    });
}

// Deteksi Scroll
if (feedContainer) {
    feedContainer.addEventListener('scroll', () => {
        const index = Math.round(feedContainer.scrollTop / window.innerHeight);
        if (index !== activeMovieIndex) {
            activeMovieIndex = index;
            if (infoPanel) infoPanel.classList.remove('show');
            currentActiveSection = null;
            const currentMovie = moviesData[activeMovieIndex];
            if (currentMovie) {
                const topTitles = document.querySelectorAll('.top-title');
                if (topTitles[activeMovieIndex]) topTitles[activeMovieIndex].innerText = currentMovie.title;
            }
        }
    });
}

// Buat Layer Hasil Pencarian
let searchResultsLayer;
if (!document.getElementById('searchResultsLayer')) {
    const resLayer = document.createElement('div');
    resLayer.id = 'searchResultsLayer';
    resLayer.className = 'search-results-layer';
    resLayer.innerHTML = `
        <div class="search-header">
            <h4>Search Results</h4>
            <button class="close-search" onclick="tutupHasilPencarian()">
                <i data-lucide="x" size="20"></i>
            </button>
        </div>
        <div class="search-content" id="searchContent"></div>
    `;
    document.body.appendChild(resLayer);
}
searchResultsLayer = document.getElementById('searchResultsLayer');

function tutupHasilPencarian() {
    searchResultsLayer.classList.remove('active');
    document.getElementById('searchInput').value = '';
}

// Cari ke seluruh database TMDB
async function cariFilmDiTMDB(kataKunci) {
    if (!kataKunci || kataKunci.trim().length < 2) return;
    document.getElementById('searchContent').innerHTML = `<div style="text-align:center; padding:30px; color:#fff;">Searching...</div>`;
    searchResultsLayer.classList.add('active');

    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(kataKunci)}&page=1&include_adult=false`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            document.getElementById('searchContent').innerHTML = data.results.map(movie => `
                <div class="search-item-row" onclick="playMovie(${movie.id})">
                    <div class="search-item-thumb" style="background-image:url('${movie.poster_path ? IMAGE_URL + movie.poster_path : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'}')"></div>
                    <div class="search-item-info">
                        <h4>${movie.title}</h4>
                        <p>${movie.release_date ? movie.release_date.split('-')[0] : 'Unknown Year'}</p>
                        <p style="font-size:12px; opacity:0.8;">${movie.overview ? movie.overview.substring(0, 80) + '...' : 'No synopsis available'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            document.getElementById('searchContent').innerHTML = `<div style="text-align:center; padding:40px; color:#ddd;">No results found for "<strong>${kataKunci}</strong>"</div>`;
        }

        if (window.lucide) lucide.createIcons();
    } catch (err) {
        document.getElementById('searchContent').innerHTML = `<div style="text-align:center; padding:40px; color:#ff6b6b;">Failed to connect to server</div>`;
    }
}

// Jalankan saat tekan Enter
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const kata = searchInput.value.trim();
            cariFilmDiTMDB(kata);
        }
    });
}

// Tombol Navigasi
const navSearchBtn = document.getElementById('navSearch');
if (navSearchBtn) {
    navSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!searchContainer) return;
        const isShowing = searchContainer.classList.toggle('show');
        
        if (!isShowing) {
            searchInput.value = "";
            tutupHasilPencarian();
        } else {
            setTimeout(() => searchInput.focus(), 100);
        }
    });
}

const navHomeBtn = document.getElementById('navHome');
if (navHomeBtn) {
    navHomeBtn.addEventListener('click', () => {
        searchInput.value = "";
        tutupHasilPencarian();
        if (feedContainer) {
            feedContainer.style.scrollBehavior = 'smooth';
            feedContainer.scrollTop = 0; 
        }
    });
}

// Jalankan awal
async function init() {
    detectDevice(); 
    await fetchMovies(currentPage);
}

init();
