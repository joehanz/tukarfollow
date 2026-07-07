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
let isDesktop = false; // Menyimpan status deteksi layar

// Deteksi Device di Awal
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

// Fungsi scroll panah
function scrollFeed(direction) {
    if (!feedContainer) return;
    const cardHeight = window.innerHeight;
    if (direction === 'down') {
        feedContainer.scrollBy({ top: cardHeight, behavior: 'smooth' });
    } else if (direction === 'up') {
        feedContainer.scrollBy({ top: -cardHeight, behavior: 'smooth' });
    }
}

// Ambil Data dari TMDB
async function fetchMovies(page = 1) {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=${page}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        if(page === 1) moviesData = data.results;
        else moviesData = [...moviesData, ...data.results];

        renderFeed(moviesData);
    } catch (error) {
        loadFallbackData();
    }
}

function loadFallbackData() {
    const fallback = [
        { id: 726888, title: 'Heartbeast', overview: 'Elina, rapper Finlandia, jatuh cinta pada Sofia...', release_date: '2022-11-04', poster_path: '', origin_country: ['FI'] },
        { id: 157336, title: 'Interstellar', overview: 'Ketika Bumi semakin tidak layak dihuni...', release_date: '2014-11-05', poster_path: '/gEU2Qv0vHB77Yp7v6v94goI86v3.jpg', origin_country: ['US'] }
    ];
    moviesData = [...moviesData, ...fallback];
    renderFeed(moviesData);
}

// Render ke Feed Layar Penuh
function renderFeed(movies) {
    if (!feedContainer) return;
    feedContainer.innerHTML = '';
    movies.forEach((movie, index) => {
        let posterFullUrl = '';
        if (movie.poster_path) {
            posterFullUrl = `${IMAGE_URL}${movie.poster_path}`;
        } else {
            posterFullUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500'; 
        }

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
                        <span>info</span>
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
                        <span>Negara</span>
                    </div>
                </div>
            </div>
        `;
        feedContainer.appendChild(card);
    });

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
        if (mainContent) {
            mainContent.appendChild(loadMoreContainer);
        } else {
            lastCard.appendChild(loadMoreContainer);
        }
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function loadNextPage() {
    currentPage++;
    fetchMovies(currentPage);
}
    
// Logika Info Dinamis
function toggleSection(event, index, section) {
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
    let htmlContent = '';

    const tmdbGenreMap = {
        28: 'Aksi', 12: 'Petualangan', 16: 'Animasi', 35: 'Komedi',
        80: 'Kejahatan', 99: 'Dokumenter', 18: 'Drama', 10751: 'Keluarga',
        14: 'Fantasi', 36: 'Sejarah', 27: 'Horor', 10402: 'Musik',
        9648: 'Misteri', 10749: 'Romantis', 878: 'Fiksi Ilmiah', 10770: 'Film TV',
        53: 'Thriller', 10752: 'Perang', 37: 'Barat'
    };

    const countryMap = {
        'US': 'Amerika Serikat', 'FI': 'Finlandia', 'KR': 'Korea Selatan',
        'JP': 'Jepang', 'ID': 'Indonesia', 'GB': 'Inggris', 'FR': 'Prancis',
        'CN': 'Cina', 'HK': 'Hong Kong', 'TH': 'Thailand', 'IN': 'India'
    };

    switch(section) {
        case 'info':
            htmlContent = `<i data-lucide="info" size="22"></i><p>${movie.overview || 'Tidak ada deskripsi.'}</p>`;
            break;
        case 'release':
            htmlContent = `<i data-lucide="calendar" size="22"></i><p>Tanggal Rilis: <strong>${movie.release_date || '-'}</strong></p>`;
            break;
        case 'genre':
            let genreStr = 'Film Umum';
            if (movie.genre_ids && movie.genre_ids.length > 0) {
                const translatedGenres = movie.genre_ids.map(id => tmdbGenreMap[id] || 'Film Umum');
                genreStr = [...new Set(translatedGenres)].join(', ');
            }
            htmlContent = `<i data-lucide="clapperboard" size="22"></i><p>Genre: <strong>${genreStr}</strong></p>`;
            break;
        case 'country':
            let negara = 'Global';
            if (movie.origin_country && movie.origin_country.length > 0) {
                const translatedCountries = movie.origin_country.map(code => countryMap[code.toUpperCase()] || code);
                negara = translatedCountries.join(', ');
            }
            htmlContent = `<i data-lucide="globe" size="22"></i><p>Negara: <strong>${negara}</strong></p>`;
            break;
    }

    panelContentArea.innerHTML = htmlContent;
    infoPanel.classList.add('show');
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Pemutar Video: Langsung ke watch.html
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

// Pemantau Scroll
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
                if (topTitles[activeMovieIndex]) {
                    topTitles[activeMovieIndex].innerText = currentMovie.title;
                }
            }
        }
    });
}

// Fitur Pencarian
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        if (keyword === "") {
            renderFeed(moviesData);
            if (feedContainer) feedContainer.scrollTop = 0;
            return;
        }
        const cleanKeyword = keyword.replace(/\s+/g, '');
        const filteredMovies = moviesData.filter(movie => {
            const cleanTitle = movie.title.toLowerCase().replace(/\s+/g, '');
            return cleanTitle.includes(cleanKeyword);
        });
        renderFeed(filteredMovies);
        if (feedContainer) feedContainer.scrollTop = 0; 
    });
}

// Tombol Menu
const navSearchBtn = document.getElementById('navSearch');
if (navSearchBtn) {
    navSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!searchContainer) return;
        const isShowing = searchContainer.classList.toggle('show');
        if (!isShowing) {
            if (searchInput) searchInput.value = "";
            renderFeed(moviesData);
            if (feedContainer) feedContainer.scrollTop = 0; 
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
            renderFeed(moviesData);
        }
        if (feedContainer) {
            feedContainer.style.scrollBehavior = 'smooth';
            feedContainer.scrollTop = 0; 
            feedContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Booting Aplikasi
async function init() {
    detectDevice(); 
    await fetchMovies(currentPage);
}

init();
