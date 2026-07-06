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
let myCustomMovies = []; 
let isDesktop = false; // Menyimpan status deteksi layar

// 1. Ambil data lokal movies.json
async function loadLocalMovies() {
    try {
        const res = await fetch('movies.json');
        if(res.ok) {
            myCustomMovies = await res.json();
            console.log("Data movies.json berhasil dimuat!", myCustomMovies);
        }
    } catch(e) {
        console.warn("Gagal memuat movies.json atau file belum dibuat.", e);
    }
}

// Deteksi Device di Awal
function detectDevice() {
    if (window.innerWidth > 768) {
        isDesktop = true;
        // Munculkan pop-up pemberitahuan desktop
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

// 2. Ambil Data dari TMDB
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

function loadFallbackData() {
    const fallback = [
        { id: 726888, title: 'Heartbeast', overview: 'Elina, rapper Finlandia, jatuh cinta pada Sofia...', release_date: '2022-11-04', poster_path: '', origin_country: ['FI'] },
        { id: 157336, title: 'Interstellar', overview: 'Ketika Bumi semakin tidak layak dihuni...', release_date: '2014-11-05', poster_path: '/gEU2Qv0vHB77Yp7v6v94goI86v3.jpg', origin_country: ['US'] }
    ];
    moviesData = [...moviesData, ...fallback];
    renderFeed(moviesData);
}

// 3. Render ke Feed Layar Penuh
function renderFeed(movies) {
    if (!feedContainer) return; // Pagar pengaman utama
    feedContainer.innerHTML = '';
    
    if (!movies || movies.length === 0) {
        feedContainer.innerHTML = '<div style="color:white; text-align:center; padding:50px;">Film tidak ditemukan...</div>';
        return;
    }

    movies.forEach((movie, index) => {
        const customData = myCustomMovies.find(m => m.tmdb_id === movie.id);
        
        let posterFullUrl = '';
        if (customData && customData.image) {
            posterFullUrl = customData.image;
        } else if (movie.poster_path) {
            posterFullUrl = `${IMAGE_URL}${movie.poster_path}`;
        } else {
            posterFullUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500'; 
        }

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.backgroundImage = `url('${posterFullUrl}')`;
        
        let releaseDateStr = customData ? customData.release_date : movie.release_date;
        const year = releaseDateStr ? releaseDateStr.split('-')[0] : '-';

        // Tentukan apakah panah navigasi harus tampil (hanya jika di desktop)
        const arrowStyle = isDesktop ? 'display: flex;' : 'display: none;';

        card.innerHTML = `
            <div class="overlay"></div>
            <div class="top-title">${customData ? customData.title : movie.title}</div>
            
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

    // Tombol Load More untuk Pagination (Hanya muncul jika tidak sedang mencari sesuatu)
    const currentSearch = document.getElementById('searchInput');
    const isSearching = currentSearch && currentSearch.value.trim() !== "";

    if (!isSearching) {
        const loadMoreCard = document.createElement('div');
        loadMoreCard.className = 'load-more-card';
        loadMoreCard.innerHTML = `<button class="load-more-btn" onclick="loadNextPage()">Load More (Page ${currentPage + 1})</button>`;
        feedContainer.appendChild(loadMoreCard);
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function loadNextPage() {
    currentPage++;
    fetchMovies(currentPage);
}

// 4. Logika Cicilan Info Dinamis (Genre & Negara Dinamis Sesuai TMDB / JSON)
function toggleSection(event, index, section) {
    event.stopPropagation();
    if (!infoPanel || !panelContentArea) return;

    const movie = moviesData[index];
    if (!movie) return;

    const customData = myCustomMovies.find(m => m.tmdb_id === movie.id);

    if (infoPanel.classList.contains('show') && currentActiveSection === section) {
        infoPanel.classList.remove('show');
        currentActiveSection = null;
        return;
    }

    currentActiveSection = section;
    let htmlContent = '';

    switch(section) {
        case 'info':
            const sinopsis = customData ? customData.sinopsis : movie.overview;
            htmlContent = `<i data-lucide="info" size="22"></i><p>${sinopsis || 'Tidak ada deskripsi.'}</p>`;
            break;
        case 'release':
            const rilis = customData ? customData.release_date : movie.release_date;
            htmlContent = `<i data-lucide="calendar" size="22"></i><p>Tanggal Rilis: <strong>${rilis || '-'}</strong></p>`;
            break;
            
        case 'genre':
            let genreStr = 'Movie';
            if (customData && customData.genre) {
                genreStr = Array.isArray(customData.genre) ? customData.genre.join(', ') : customData.genre;
            } else if (movie.genre_ids && movie.genre_ids.length > 0) {
                const tmdbGenreMap = {
                    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
                    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
                    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
                    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
                    53: 'Thriller', 10752: 'War', 37: 'Western'
                };
                const translatedGenres = movie.genre_ids.map(id => tmdbGenreMap[id] || 'Movie');
                genreStr = [...new Set(translatedGenres)].join(', ');
            }
            htmlContent = `<i data-lucide="clapperboard" size="22"></i><p>Genre: <strong>${genreStr}</strong></p>`;
            break;
            
        case 'country':
            let negara = '-';
            if (customData && customData.country) {
                negara = customData.country;
            } else if (movie.origin_country && movie.origin_country.length > 0) {
                const countryMap = {
                    'US': 'Amerika Serikat', 'FI': 'Finlandia', 'KR': 'Korea Selatan',
                    'JP': 'Jepang', 'ID': 'Indonesia', 'GB': 'Inggris', 'FR': 'Prancis',
                    'CN': 'Cina', 'HK': 'Hong Kong', 'TH': 'Thailand', 'IN': 'India'
                };
                const translatedCountries = movie.origin_country.map(code => countryMap[code.toUpperCase()] || code);
                negara = translatedCountries.join(', ');
            } else {
                negara = 'Global';
            }
            htmlContent = `<i data-lucide="globe" size="22"></i><p>Negara: <strong>${negara}</strong></p>`;
            break;
    }

    panelContentArea.innerHTML = htmlContent;
    infoPanel.classList.add('show');
    if (window.lucide) lucide.createIcons();
}

// 5. Pemutar Video
function playMovie(tmdbId) {
    if (!playerArea || !videoPlayerContainer) return;
    const customMovie = myCustomMovies.find(m => m.tmdb_id === tmdbId);
    playerArea.innerHTML = ''; 

    if (customMovie) {
        if (customMovie.iframe && customMovie.iframe.trim() !== "") {
            playerArea.innerHTML = `<iframe src="${customMovie.iframe}" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
        } else if (customMovie.video && customMovie.video.trim() !== "") {
            playerArea.innerHTML = `<video src="${customMovie.video}" controls autoplay playsinline></video>`;
        } else {
            playerArea.innerHTML = `<iframe src="https://vsembed.ru/embed/movie?tmdb=${tmdbId}" allowfullscreen></iframe>`;
        }
    } else {
        playerArea.innerHTML = `<iframe src="https://vsembed.ru/embed/movie?tmdb=${tmdbId}" allowfullscreen></iframe>`;
    }

    videoPlayerContainer.classList.add('active');
}

// Tombol Close Player Aman
const closePlayerBtn = document.getElementById('closePlayerBtn');
if (closePlayerBtn) {
    closePlayerBtn.addEventListener('click', () => {
        if (playerArea) playerArea.innerHTML = ''; 
        if (videoPlayerContainer) videoPlayerContainer.classList.remove('active');
    });
}

// 6. Pemantau Gerakan Scroll Aktif dengan Auto-Update Judul
if (feedContainer) {
    feedContainer.addEventListener('scroll', () => {
        const index = Math.round(feedContainer.scrollTop / window.innerHeight);
        
        if (index !== activeMovieIndex) {
            activeMovieIndex = index;
            
            if (infoPanel) infoPanel.classList.remove('show');
            currentActiveSection = null;
            
            const currentMovie = moviesData[activeMovieIndex];
            if (currentMovie) {
                const customData = myCustomMovies.find(m => m.tmdb_id === currentMovie.id);
                const topTitles = document.querySelectorAll('.top-title');
                
                if (topTitles[activeMovieIndex]) {
                    topTitles[activeMovieIndex].innerText = customData ? customData.title : currentMovie.title;
                }
            }
        }
    });
}

// ============================================================================
// FIX TOTAL: FITUR PENCARIAN REAL-TIME (SENSI) & NAVIGASI TOMBOL HOME/SEARCH
// ============================================================================
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
            const customData = myCustomMovies.find(m => m.tmdb_id === movie.id);
            const rawTitle = customData ? customData.title : movie.title;
            const cleanTitle = rawTitle.toLowerCase().replace(/\s+/g, '');
            return cleanTitle.includes(cleanKeyword);
        });

        renderFeed(filteredMovies);
        if (feedContainer) feedContainer.scrollTop = 0;
    });
}

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
    await loadLocalMovies();
    await fetchMovies(currentPage);
}

init();
