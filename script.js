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
    feedContainer.innerHTML = '';
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
                    <!-- BLOK PANAH SEKARANG DI ATAS MENU INFO FILMS -->
                    <div class="arrow-actions-container" style="${arrowStyle}">
                        <div class="inline-scroll-arrow" onclick="scrollFeed('up')">
                            <i data-lucide="chevron-up" size="22"></i>
                        </div>
                        <div class="inline-scroll-arrow" onclick="scrollFeed('down')">
                            <i data-lucide="chevron-down" size="22"></i>
                        </div>
                    </div>

                    <!-- MENU INFO UTAMA -->
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

    // Tombol Load More untuk Pagination
    const loadMoreCard = document.createElement('div');
    loadMoreCard.className = 'load-more-card';
    loadMoreCard.innerHTML = `<button class="load-more-btn" onclick="loadNextPage()">Load More (Page ${currentPage + 1})</button>`;
    feedContainer.appendChild(loadMoreCard);

    lucide.createIcons();
}

function loadNextPage() {
    currentPage++;
    fetchMovies(currentPage);
}

// 4. Logika Cicilan Info Dinamis (Genre & Negara Dinamis Sesuai TMDB / JSON)
function toggleSection(event, index, section) {
    event.stopPropagation();
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
                // Jika ada di movies.json, langsung pakai data teks kamu (Horror, Action, dll)
                genreStr = Array.isArray(customData.genre) ? customData.genre.join(', ') : customData.genre;
            } else if (movie.genre_ids && movie.genre_ids.length > 0) {
                // Kamus / Mapping ID Genre resmi dari TMDB ke teks Bahasa Indonesia
                const tmdbGenreMap = {
                    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
                    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
                    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
                    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
                    53: 'Thriller', 10752: 'War', 37: 'Western'
                };
                
                // Terjemahkan array ID angka dari TMDB menjadi susunan nama genre
                const translatedGenres = movie.genre_ids.map(id => tmdbGenreMap[id] || 'Movie');
                // Gabungkan dengan koma, hilangkan jika ada yang duplikat atau bertulisan 'Movie' tidak dikenal
                genreStr = [...new Set(translatedGenres)].join(', ');
            }
            
            htmlContent = `<i data-lucide="clapperboard" size="22"></i><p>Genre: <strong>${genreStr}</strong></p>`;
            break;
            
        case 'country':
            // Mengambil negara kustom dari json, atau mendeteksi origin_country bawaan TMDB secara dinamis
            let negara = '-';
            if (customData && customData.country) {
                negara = customData.country;
            } else if (movie.origin_country && movie.origin_country.length > 0) {
                // Mapping kode negara TMDB (US, FI, KR) ke nama lengkap biar lebih rapi
                const countryMap = {
                    'US': 'Amerika Serikat', 'FI': 'Finlandia', 'KR': 'Korea Selatan',
                    'JP': 'Jepang', 'ID': 'Indonesia', 'GB': 'Inggris', 'FR': 'Prancis',
                    'CN': 'Cina', 'HK': 'Hong Kong', 'TH': 'Thailand', 'IN': 'India'
                };
                
                // Terjemahkan kodenya, kalau tidak ada di daftar pasang kode aslinya saja
                const translatedCountries = movie.origin_country.map(code => countryMap[code.toUpperCase()] || code);
                negara = translatedCountries.join(', ');
            } else {
                negara = 'Global';
            }
            // Label teks diubah langsung jadi "Negara:"
            htmlContent = `<i data-lucide="globe" size="22"></i><p>Negara: <strong>${negara}</strong></p>`;
            break;
    }

    panelContentArea.innerHTML = htmlContent;
    infoPanel.classList.add('show');
    lucide.createIcons();
}

// 5. Pemutar Video
function playMovie(tmdbId) {
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

document.getElementById('closePlayerBtn').addEventListener('click', () => {
    playerArea.innerHTML = ''; 
    videoPlayerContainer.classList.remove('active');
});

// 6. Pemantau Gerakan Scroll Aktif dengan Auto-Update Judul
feedContainer.addEventListener('scroll', () => {
    const index = Math.round(feedContainer.scrollTop / window.innerHeight);
    
    if (index !== activeMovieIndex) {
        activeMovieIndex = index;
        
        infoPanel.classList.remove('show');
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

// ============================================================================
// FIX TOTAL: FITUR PENCARIAN REAL-TIME (SENSI) & NAVIGASI TOMBOL HOME/SEARCH
// ============================================================================
const searchInput = document.getElementById('searchInput');

// 1. Logika Mesin Pencari (Input)
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        
        // JIKA KOLOM KOSONG: Kembalikan semua film asli & reset scroll ke atas
        if (keyword === "") {
            renderFeed(moviesData);
            feedContainer.scrollTop = 0;
            return;
        }

        // Hilangkan spasi ketikan agar pencarian super sensitif (ex: "supermario" tetap ketemu)
        const cleanKeyword = keyword.replace(/\s+/g, '');

        const filteredMovies = moviesData.filter(movie => {
            const customData = myCustomMovies.find(m => m.tmdb_id === movie.id);
            const rawTitle = customData ? customData.title : movie.title;
            const cleanTitle = rawTitle.toLowerCase().replace(/\s+/g, '');
            
            return cleanTitle.includes(cleanKeyword);
        });

        renderFeed(filteredMovies);
        feedContainer.scrollTop = 0; // Maksa hasil pencarian balik ke film pertama (paling atas)
    });
}

// 2. Logika Tombol Menu Search (Buka/Tutup Kolom)
const navSearchBtn = document.getElementById('navSearch');
if (navSearchBtn) {
    navSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShowing = searchContainer.classList.toggle('show');
        
        if (!isShowing) {
            if (searchInput) searchInput.value = "";
            renderFeed(moviesData);
            feedContainer.scrollTop = 0; 
        } else {
            if (searchInput) setTimeout(() => searchInput.focus(), 100);
        }
    });
}

// 3. Logika Tombol Menu Home (Auto-Scroll Lancar ke Paling Atas)
const navHomeBtn = document.getElementById('navHome');
if (navHomeBtn) {
    navHomeBtn.addEventListener('click', () => {
        // Kalau user lagi nyari film, bersihkan dulu kolom pencariannya otomatis
        if (searchInput && searchInput.value.trim() !== "") {
            searchInput.value = "";
            renderFeed(moviesData);
        }
        
        // Paksa scroll container kembali ke koordinat 0 (paling atas)
        feedContainer.style.scrollBehavior = 'smooth';
        feedContainer.scrollTop = 0; 
        feedContainer.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Booting Aplikasi
async function init() {
    detectDevice(); // Cek ukuran layar duluan sebelum merender halaman
    await loadLocalMovies();
    await fetchMovies(currentPage);
}

init();
