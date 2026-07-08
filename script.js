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
// ✅ PERBAIKAN 1: Panel Info Baca Data TMDB Lengkap
// ==============================================
async function toggleSection(event, index, section) {
    event.stopPropagation();
    if (!infoPanel || !panelContentArea) return;

    const movie = moviesData[index];
    if (!movie) return;

    // Tutup jika sudah terbuka
    if (infoPanel.classList.contains('show') && currentActiveSection === section) {
        infoPanel.classList.remove('show');
        currentActiveSection = null;
        return;
    }

    currentActiveSection = section;
    panelContentArea.innerHTML = `<div style="text-align:center; padding:20px;">Loading...</div>`;
    infoPanel.classList.add('show');

    // Ambil data lengkap dari TMDB untuk info yang lebih akurat
    try {
        const resDetail = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`);
        const detailData = await resDetail.json();

        let htmlContent = '';
        const genreMap = {
            28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
            80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
            14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
            9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
            53: 'Thriller', 10752: 'War', 37: 'Western'
        };

        const countryMap = {
            'US': 'United States', 'FI': 'Finland', 'KR': 'South Korea',
            'JP': 'Japan', 'ID': 'Indonesia', 'GB': 'United Kingdom',
            'FR': 'France', 'CN': 'China', 'HK': 'Hong Kong', 'TH': 'Thailand', 'IN': 'India'
        };

        switch(section) {
            case 'info':
                htmlContent = `
                    <h3>${detailData.title || movie.title}</h3>
                    <p style="margin-top:10px; line-height:1.6;">${detailData.overview || movie.overview || 'No description available.'}</p>
                    <p style="margin-top:10px; font-size:13px; opacity:0.8;">⭐ Rating: ${detailData.vote_average ? detailData.vote_average.toFixed(1) : '-'}/10</p>
                `;
                break;
            case 'release':
                htmlContent = `
                    <p><strong>Release Date:</strong><br>${detailData.release_date || movie.release_date || 'Unknown'}</p>
                    <p style="margin-top:10px;"><strong>Runtime:</strong><br>${detailData.runtime ? `${detailData.runtime} minutes` : 'Unknown'}</p>
                `;
                break;
            case 'genre':
                let genreList = [];
                if (detailData.genres && detailData.genres.length > 0) {
                    genreList = detailData.genres.map(g => g.name);
                } else if (movie.genre_ids) {
                    genreList = movie.genre_ids.map(id => genreMap[id] || 'Other');
                }
                htmlContent = `<p><strong>Genre:</strong><br>${genreList.join(', ') || 'Not specified'}</p>`;
                break;
            case 'country':
                let countryList = [];
                if (detailData.production_countries && detailData.production_countries.length > 0) {
                    countryList = detailData.production_countries.map(c => countryMap[c.iso_3166_1] || c.name);
                } else if (movie.origin_country) {
                    countryList = movie.origin_country.map(c => countryMap[c] || c);
                }
                htmlContent = `<p><strong>Country:</strong><br>${countryList.join(', ') || 'Global'}</p>`;
                break;
        }

        panelContentArea.innerHTML = htmlContent;
        if (window.lucide) lucide.createIcons();

    } catch (err) {
        panelContentArea.innerHTML = `<p style="color:#ff6b6b;">Failed to load details. Please try again later.</p>`;
    }
}

// ==============================================
// ✅ PERBAIKAN 2: Pencarian Lebih Sensitif & Cepat
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

// Pencarian Film
const searchInput = document.getElementById('searchInput');
let searchResultsLayer;

// Buat wadah hasil pencarian jika belum ada
if (!document.getElementById('searchResultsLayer')) {
    const resLayer = document.createElement('div');
    resLayer.id = 'searchResultsLayer';
    resLayer.className = 'search-results-layer active';
    searchContainer.appendChild(resLayer);
}
searchResultsLayer = document.getElementById('searchResultsLayer');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();

        // Jika diketik minimal 2 huruf langsung tampilkan
        if (keyword.length < 2) {
            searchResultsLayer.classList.remove('active');
            searchResultsLayer.innerHTML = '';
            return;
        }

        searchResultsLayer.classList.add('active');
        const filteredMovies = moviesData.filter(movie => 
            movie.title.toLowerCase().includes(keyword)
        );

        if (filteredMovies.length > 0) {
            searchResultsLayer.innerHTML = filteredMovies.map(movie => `
                <div class="search-item-row" onclick="playMovie(${movie.id})">
                    <div class="search-item-thumb" style="background-image:url('${movie.poster_path ? IMAGE_URL + movie.poster_path : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'}')"></div>
                    <div class="search-item-info">
                        <h4>${movie.title}</h4>
                        <p>${movie.release_date ? movie.release_date.split('-')[0] : '-'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            searchResultsLayer.innerHTML = `<div style="padding:30px; text-align:center; color:#aaa;">No results found for "<strong>${keyword}</strong>"</div>`;
        }

        if (window.lucide) lucide.createIcons();
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
            if (searchInput) searchInput.value = "";
            searchResultsLayer.classList.remove('active');
            searchResultsLayer.innerHTML = '';
        } else {
            if (searchInput) setTimeout(() => searchInput.focus(), 100);
        }
    });
}

const navHomeBtn = document.getElementById('navHome');
if (navHomeBtn) {
    navHomeBtn.addEventListener('click', () => {
        if (searchInput && searchInput.value.trim() !== "") {
            searchInput.value = "";
            searchResultsLayer.classList.remove('active');
            searchResultsLayer.innerHTML = '';
        }
        if (feedContainer) {
            feedContainer.style.scrollBehavior = 'smooth';
            feedContainer.scrollTop = 0; 
        }
    });
}

// Jalankan Awal
async function init() {
    detectDevice(); 
    await fetchMovies(currentPage);
}

init();
