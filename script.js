// CONFIG UTAMA
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://tmdb.org';

// GLOBAL STORAGE (Aman Terisolasi)
let APP_MOVIES_LIST = [];   
let tmdbCurrentPage = 1;        
let isApiLoading = false;      
let searchActiveKeyword = "";    

// EKSEKUSI UTAMA (Dipicu saat kerangka HTML dasar selesai dibaca)
window.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    
    // Handler Halaman Utama index.html
    if (document.getElementById('movieGrid')) {
        setupHomepage();
    }
    
    // Handler Halaman Nonton watch.html
    if (document.getElementById('playerArea')) {
        setupWatchPage();
    }
});

// ==========================================
//          LOGIKA HALAMAN UTAMA
// ==========================================

async function setupHomepage() {
    // 1. Muat Postingan Manual Anda Terlebih Dahulu (Prioritas Utama)
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            const mappedLocal = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
            APP_MOVIES_LIST = [...mappedLocal];
            // Langsung tampilkan postingan lokal agar anti-delay!
            renderMovieGrid(APP_MOVIES_LIST);
        }
    } catch (e) {
        console.error("Gagal memuat file lokal movies.json:", e);
    }

    // 2. Tarik Data Suplemen Tambahan dari TMDB (Jalur Terpisah)
    await fetchTMDBContent(tmdbCurrentPage);

    // 3. Pasang Pemicu Gulir Layar (Infinite Scroll)
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 600) {
            if (!isApiLoading && searchActiveKeyword === "") { 
                tmdbCurrentPage++;
                fetchTMDBContent(tmdbCurrentPage);
            }
        }
    });
}

async function fetchTMDBContent(page) {
    if (isApiLoading) return;
    isApiLoading = true;

    try {
        // Menggunakan endpoint discover film paling stabil dan kebal region block
        const endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&page=${page}`;
        const res = await fetch(endpoint);
        
        if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const mappedTMDB = data.results.map(movie => ({
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "", 
                    iframe: `https://vidsrc.to{movie.id}`, 
                    sinopsis: movie.overview || "Sinopsis tidak tersedia untuk film ini.",
                    genre: "Indonesia Movie", 
                    release_date: movie.release_date || "2026-01-01",
                    country: "Indonesia",
                    internalId: `TMDB_${movie.id}`
                }));

                // Masukkan data TMDB ke storage global tanpa merusak data lokal yang ada
                APP_MOVIES_LIST = [...APP_MOVIES_LIST, ...mappedTMDB];
                renderMovieGrid(APP_MOVIES_LIST);
            }
        }
    } catch (e) {
        console.error("Gagal terhubung ke TMDB API, mematikan request suplemen:", e);
        // Fallback paksa: Tetap cetak data yang ada agar halaman tidak blank kosong
        renderMovieGrid(APP_MOVIES_LIST);
    } finally {
        isApiLoading = false;
    }
}

function renderMovieGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    
    grid.innerHTML = ""; // Paksa hapus teks "Memuat film..." dari layar

    if (!moviesList || moviesList.length === 0) {
        grid.innerHTML = "<div class='loading-text'>Tidak ada film ditemukan.</div>";
        return;
    }

    const fragment = document.createDocumentFragment();
    moviesList.forEach(movie => {
        const card = document.createElement('a');
        card.className = "movie-card";
        card.href = `watch.html?id=${movie.internalId}`;
        card.innerHTML = `
            <div class="poster-wrapper">
                <img src="${movie.image}" alt="${movie.title}" loading="lazy">
            </div>
            <h3>${movie.title}</h3>
        `;
        fragment.appendChild(card);
    });
    grid.appendChild(fragment);
}

// ==========================================
//          LOGIKA HALAMAN WATCH
// ==========================================

async function setupWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    
    if (!filmId) {
        forceStopWatchLoading("ID Film Tidak Valid");
        return;
    }

    let selectedMovie = null;

    // Jalur 1: Deteksi & Ekstrak Jika ID dari Postingan Lokal
    if (filmId.startsWith('LOCAL_')) {
        try {
            const res = await fetch('movies.json');
            if (res.ok) {
                const localData = await res.json();
                const mappedLocal = localData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
                selectedMovie = mappedLocal.find(m => m.internalId === filmId);
            }
        } catch (e) { console.error(e); }
    } 
    // Jalur 2: Deteksi & Ekstrak Jika ID dari Server Resmi TMDB
    else if (filmId.startsWith('TMDB_')) {
        const tmdbId = filmId.replace('TMDB_', '');
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
            if (res.ok) {
                const movie = await res.json();
                selectedMovie = {
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "", 
                    iframe: `https://vidsrc.to{movie.id}`,
                    sinopsis: movie.overview || "Sinopsis tidak tersedia untuk film ini.",
                    genre: "Indonesia Movie", 
                    release_date: movie.release_date || "Unknown",
                    country: "Indonesia", 
                    internalId: filmId
                };
            }
        } catch (e) { console.error(e); }
    }

    // Eksekusi Suntik Data ke DOM jika Film Ditemukan
    if (selectedMovie) {
        if(document.getElementById('watchTitle')) document.getElementById('watchTitle').innerText = selectedMovie.title;
        if(document.getElementById('watchGenre')) document.getElementById('watchGenre').innerText = selectedMovie.genre;
        if(document.getElementById('watchRelease')) document.getElementById('watchRelease').innerText = selectedMovie.release_date;
        if(document.getElementById('watchCountry')) document.getElementById('watchCountry').innerText = selectedMovie.country;
        if(document.getElementById('watchSinopsis')) document.getElementById('watchSinopsis').innerText = selectedMovie.sinopsis;

        const container = document.getElementById('videoContainer');
        const adOverlay = document.getElementById('adOverlay');
        
        if (container) {
            if (selectedMovie.iframe) {
                container.innerHTML = `<iframe src="${selectedMovie.iframe}" allowfullscreen></iframe>`;
            } else if (selectedMovie.video) {
                container.innerHTML = `<video id="nativeVideo" src="${selectedMovie.video}" controls></video>`;
            }
        }

        // Penanganan Skema Monetisasi Klik Iklan 2x
        const videoSourceUrl = selectedMovie.iframe || selectedMovie.video;
        if (videoSourceUrl && videoSourceUrl.includes('abyssplayer.com')) {
            if(adOverlay) adOverlay.classList.add('disabled');
        } else if (adOverlay) {
            let clickCount = 0;
            const targetAds = ["https://rajarayap.com", "https://blogspot.com", "https://blogspot.com"];
            adOverlay.addEventListener('click', () => {
                clickCount++;
                window.open(targetAds[Math.floor(Math.random() * targetAds.length)], '_blank');
                if (clickCount >= 2) {
                    adOverlay.classList.add('disabled');
                    const nVid = document.getElementById('nativeVideo');
                    if (nVid) nVid.play();
                }
            });
        }

        // Tampilkan Slider Rekomendasi
        loadWatchCarousel(filmId);
    } else {
        forceStopWatchLoading("Film Tidak Ditemukan di Kedua Server");
    }
}

function forceStopWatchLoading(message) {
    const titleEl = document.getElementById('watchTitle');
    const sinopsisEl = document.getElementById('watchSinopsis');
    if (titleEl) titleEl.innerText = message;
    if (sinopsisEl) sinopsisEl.innerText = "Gagal menghubungkan player. Silakan kembali ke beranda.";
}

async function loadWatchCarousel(excludeId) {
    const relatedGrid = document.getElementById('relatedGrid');
    if (!relatedGrid) return;

    try {
        const res = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=1`);
        if (res.ok) {
            const data = await res.json();
            if (data.results) {
                relatedGrid.innerHTML = ""; // Bersihkan kontainer pemuat slider
                
                const filteredData = data.results.map(m => ({
                    title: m.title,
                    image: m.poster_path ? `${TMDB_IMAGE_URL}${m.poster_path}` : 'https://placeholder.com',
                    internalId: `TMDB_${m.id}`
                })).filter(m => m.internalId !== excludeId);

filteredData.slice(0, 10).forEach(movie => {const item = document.createElement('a');item.className = "movie-card";item.href = watch.html?id=${movie.internalId};item.innerHTML = <div class="poster-wrapper"> <img src="${movie.image}" alt="${movie.title}" loading="lazy"> </div> <h3>${movie.title}</h3>;relatedGrid.appendChild(item);});}}} catch(e) { console.error(e); }const btnPrev = document.getElementById('slidePrev');const btnNext = document.getElementById('slideNext');if (btnPrev && btnNext) {btnPrev.addEventListener('click', () => relatedGrid.scrollLeft -= 250);btnNext.addEventListener('click', () => relatedGrid.scrollLeft += 250);}}// ==========================================//          NAVBAR & GLOBAL SEARCH// ==========================================function initNavbar() {const burgerBtn = document.getElementById('burgerBtn');const navMenu = document.getElementById('navMenu');if (burgerBtn && navMenu) {burgerBtn.addEventListener('click', () => {burgerBtn.classList.toggle('open');navMenu.classList.toggle('open');});}document.querySelectorAll('.dropbtn').forEach(btn => {btn.addEventListener('click', () => {if (window.innerWidth <= 768) {const targetDropdown = btn.nextElementSibling;if(targetDropdown) targetDropdown.classList.toggle('open-mobile');}});});const searchInput = document.getElementById('searchInput');if (searchInput) {searchInput.addEventListener('input', (e) => {searchActiveKeyword = e.target.value.toLowerCase();if (searchActiveKeyword === "") {renderMovieGrid(APP_MOVIES_LIST);} else {const filtered = APP_MOVIES_LIST.filter(m => m.title.toLowerCase().includes(searchActiveKeyword));renderMovieGrid(filtered);}});}document.querySelectorAll('.dropdown-content a').forEach(link => {link.addEventListener('click', (e) => {e.preventDefault();let filtered = [...APP_MOVIES_LIST];const genre = link.getAttribute('data-genre');const year = link.getAttribute('data-year');const sectionTitle = document.getElementById('sectionTitle');if (genre) {if(sectionTitle) sectionTitle.innerText = Genre: ${genre};filtered = APP_MOVIES_LIST.filter(m => m.genre && m.genre.toLowerCase().includes(genre.toLowerCase()));} else if (year) {if(sectionTitle) sectionTitle.innerText = Tahun Rilis: ${year === 'klasik' ? 'Klasik (<2024)' : year};filtered = APP_MOVIES_LIST.filter(m => {if(!m.release_date) return false;const rYear = new Date(m.release_date).getFullYear();return year === 'klasik' ? rYear < 2024 : rYear === parseInt(year);});}renderMovieGrid(filtered);if(navMenu && burgerBtn) {navMenu.classList.remove('open');burgerBtn.classList.remove('open');}});});}
