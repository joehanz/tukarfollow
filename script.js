// KONFIGURASI PARAMETER RESMI API TMDB (SUDAH DIPERBAIKI)
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org'; // End point API diperbaiki agar fetch detail berfungsi
const TMDB_DISCOVER_URL = 'https://themoviedb.org'; // Gerbang data pencarian awal
const TMDB_IMAGE_URL = 'https://tmdb.org'; // Gerbang gambar poster resmi

// DAFTAR DOMAIN IKLAN MANDIRI
const AD_DOMAINS = [
    'https://www.rajarayap.com',
    'https://ptdwiprima.blogspot.com',
    'https://caturbangunsentosa.blogspot.com'
];

// Global Data Storage
let ALL_MOVIES = [];

// Inisialisasi Event Listener Utama (Mendukung Index & Watch)
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    
    // Deteksi jika berada di halaman utama (index.html)
    if (document.getElementById('movieGrid')) {
        loadAllMoviesData();
    }
    
    // Deteksi jika berada di halaman pemutar (watch.html)
    if (document.getElementById('videoContainer')) {
        loadWatchPageData();
    }
});

// LOGIKA NAVIGATION BURGER & DROPDOWN (SMOOTH TRANSITION)
function initNavbar() {
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    // Toggle Dropdown Mobile View Click Handler
    const dropBtns = document.querySelectorAll('.dropbtn');
    dropBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const content = btn.nextElementSibling;
                if (content) content.classList.toggle('open-mobile');
            }
        });
    });

    // Real-Time Search Handler (Membaca seluruh item di grid)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = ALL_MOVIES.filter(m => m.title.toLowerCase().includes(keyword));
            renderGrid(filtered);
        });
    }

    // Filter Dropdown Items Click Handler (Genre / Rilis)
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            let filtered = [...ALL_MOVIES];
            
            const genre = link.getAttribute('data-genre');
            const year = link.getAttribute('data-year');
            const sectionTitle = document.getElementById('sectionTitle');

            if (genre) {
                if (sectionTitle) sectionTitle.innerText = `Genre: ${genre}`;
                filtered = ALL_MOVIES.filter(m => m.genre && m.genre.toLowerCase().includes(genre.toLowerCase()));
            } else if (year) {
                if (sectionTitle) sectionTitle.innerText = `Tahun Rilis: ${year === 'klasik' ? 'Klasik (<2024)' : year}`;
                filtered = ALL_MOVIES.filter(m => {
                    if (!m.release_date) return false;
                    const releaseYear = new Date(m.release_date).getFullYear();
                    if (year === 'klasik') return releaseYear < 2024;
                    return releaseYear === parseInt(year);
                });
            }
            
            renderGrid(filtered);
            
            // Tutup menu mobile otomatis setelah filter dipilih
            if (navMenu && burgerBtn) {
                navMenu.classList.remove('open');
                burgerBtn.classList.remove('open');
            }
        });
    });
}

// MENGGABUNGKAN DATA JSON & TMDB (FILM INDONESIA ONLY & SORT BY RELEASE)
async function loadAllMoviesData() {
    let localData = [];
    let tmdbData = [];

    // 1. Ambil data dari movies.json lokal
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            localData = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
        }
    } catch (e) {
        console.error("Gagal membaca movies.json lokal:", e);
    }

    // 2. Ambil data dari API TMDB Resmi (Khusus Film Indonesia & Sudah Rilis)
    try {
        const today = new Date().toISOString().split('T')[0];
        const endpoint = `${TMDB_DISCOVER_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&release_date.lte=${today}`;
        const res = await fetch(endpoint);
        
        if (res.ok) {
            const data = await res.json();
            if (data.results) {
                tmdbData = data.results.map(movie => ({
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "",
                    iframe: `https://vidsrc.me{movie.id}`, // Perbaikan sintaks pemanggilan ID link video TMDB
                    sinopsis: movie.overview || "Sinopsis belum tersedia untuk film ini.",
                    genre: "Indonesia Movie", 
                    release_date: movie.release_date || "0000-00-00",
                    country: "Indonesia",
                    internalId: `TMDB_${movie.id}`
                }));
            }
        }
    } catch (e) {
        console.error("Gagal sinkronisasi dengan API TMDB:", e);
    }

    // 3. Melebur Array & Mengurutkan Berdasarkan Tanggal Rilis Terbaru
    ALL_MOVIES = [...localData, ...tmdbData].sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(b.release_date) - new Date(a.release_date);
    });

    renderGrid(ALL_MOVIES);
}

// MERENDER TAMPILAN GRID IDENTIK ALA TMDB PRO
function renderGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    
    grid.innerHTML = "";
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

// LOGIKA PEMUTAR DAN PROSES DI HALAMAN WATCH.HTML
async function loadWatchPageData() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        document.getElementById("watchTitle").innerText = "Film Tidak Ditemukan";
        return;
    }

    let selectedMovie = null;
    let localMoviesList = [];

    // Kasus 1: Mengambil Film dari File Lokal movies.json
    if (movieId.startsWith("LOCAL_")) {
        const index = parseInt(movieId.replace("LOCAL_", ""));
        try {
            const res = await fetch('movies.json');
            if (res.ok) {
                localMoviesList = await res.json();
                selectedMovie = localMoviesList[index];
            }
        } catch (e) {
            console.error("Gagal memuat detail film lokal:", e);
        }
    } 
    // Kasus 2: Mengambil Film Otomatis dari API TMDB
    else if (movieId.startsWith("TMDB_")) {
        const tmdbId = movieId.replace("TMDB_", "");
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=id-ID`);
            if (res.ok) {
                const movie = await res.json();
                selectedMovie = {
                    title: movie.title,
                    sinopsis: movie.overview || "Sinopsis belum tersedia.",
                    genre: "Indonesia Movie",
                    release_date: movie.release_date,
                    country: "Indonesia",
                    iframe: `https://vidsrc.me{tmdbId}`
                };
            }
        } catch (e) {
            console.error("Gagal memuat detail film TMDB:", e);
        }
    }

    // Suntikkan Informasi Data Film ke dalam Template Elemen HTML
    if (selectedMovie) {
        document.getElementById("watchTitle").innerText = selectedMovie.title;
        document.getElementById("watchSinopsis").innerText = selectedMovie.sinopsis;
        document.getElementById("watchGenre").innerText = selectedMovie.genre;
        document.getElementById("watchRelease").innerText = selectedMovie.release_date;
        document.getElementById("watchCountry").innerText = selectedMovie.country;
        
        const videoContainer = document.getElementById("videoContainer");
        
        // Suntikkan element Iframe Video Utama
        videoContainer.innerHTML = `
            <iframe src="${selectedMovie.iframe}" allowfullscreen frameborder="0" width="100%" height="100%"></iframe>
        `;

        // EKSEKUSI REQUEST IKLAN POP-UNDER 2X KLIK BERDASARKAN IFRAME MATCHING
        initCustomAdSystem(selectedMovie.iframe);

        // Muat Daftar Film Serupa di bagian bawah
        if (movieId.startsWith("LOCAL_")) {
            renderRelatedMovies(selectedMovie, localMoviesList);
        } else {
            loadRelatedTMDBMovies(movieId.replace("TMDB_", ""));
        }

    } else {
        document.getElementById("watchTitle").innerText = "Film Tidak Ditemukan";
    }
}

// LOGIKA UTAMA CUSTOM POP-UNDER AD-OVERLAY (REQUEST KHUSUS)
function initCustomAdSystem(iframeUrl) {
    const playerArea = document.getElementById("playerArea");
    const adOverlay = document.getElementById("adOverlay");
    
if (!playerArea || !adOverlay) return;// Cek Kondisi: Hanya berlaku jika link berasal dari playcinematic.com ATAU vidsrc.me (TMDB)if (iframeUrl.includes("playcinematic.com") || iframeUrl.includes("vidsrc.me")) {// Atur style pengaman agar overlay memblokir klik pertama secara mutlakplayerArea.style.position = "relative";adOverlay.style.position = "absolute";adOverlay.style.top = "0";adOverlay.style.left = "0";adOverlay.style.width = "100%";adOverlay.style.height = "100%";adOverlay.style.zIndex = "99999";adOverlay.style.cursor = "pointer";adOverlay.style.background = "rgba(0,0,0,0)"; // Transparan tak terlihat oleh useradOverlay.style.display = "block";// Deteksi klik pertama di area pemutar videoadOverlay.addEventListener("click", function handleFirstClick(e) {e.preventDefault();e.stopPropagation();// Ambil salah satu domain tujuan iklan secara acak dari list arrayconst randomDomain = AD_DOMAINS[Math.floor(Math.random() * AD_DOMAINS.length)];// Buka tab baru ke alamat iklan yang terpilihwindow.open(randomDomain, '_blank');// HANCURKAN LAPISAN OVERLAY (Klik kedua otomatis mengenai tombol play asli iframe bersamaan)adOverlay.style.display = "none";adOverlay.removeEventListener("click", handleFirstClick);});} else {// Jika dari abyssplayer.com atau server lainnya, hilangkan overlay secara totaladOverlay.style.display = "none";}}// RENDER REKOMENDASI FILM SERUPA UNTUK FILM LOKALfunction renderRelatedMovies(currentMovie, allLocalMovies) {const relatedGrid = document.getElementById("relatedGrid");if (!relatedGrid) return;const currentGenres = currentMovie.genre.split(',').map(g => g.trim()).filter(g => g);const matchedMovies = allLocalMovies.filter((movie, idx) => {if (movie.title === currentMovie.title) return false;const movieGenres = movie.genre.split(',').map(g => g.trim()).filter(g => g);return movieGenres.some(g => currentGenres.includes(g));});if (matchedMovies.length === 0) {relatedGrid.innerHTML = "Tidak ada film serupa.";return;}relatedGrid.innerHTML = "";matchedMovies.forEach((movie) => {// Cari balik indeks aslinya di array lokalconst originalIndex = allLocalMovies.findIndex(m => m.title === movie.title);const card = document.createElement('div');card.className = "movie-card";card.style.minWidth = "150px";card.innerHTML = <a href="watch.html?id=LOCAL_${originalIndex}"> <div class="poster-wrapper"><img src="${movie.image}" alt="${movie.title}"></div> <h4 style="font-size:12px; margin-top:5px; color:white;">${movie.title}</h4> </a>;relatedGrid.appendChild(card);});}// RENDER REKOMENDASI FILM SERUPA UNTUK FILM TMDBasync function loadRelatedTMDBMovies(tmdbId) {const relatedGrid = document.getElementById("relatedGrid");if (!relatedGrid) return;try {const res = await fetch(${TMDB_BASE_URL}/movie/${tmdbId}/recommendations?api_key=${TMDB_API_KEY}&language=id-ID);if (res.ok) {const data = await res.json();if (data.results && data.results.length > 0) {relatedGrid.innerHTML = "";// Batasi ambil maksimal 6 film rekomendasi serupadata.results.slice(0, 6).forEach(movie => {const card = document.createElement('div');card.className = "movie-card";card.style.minWidth = "150px";const poster = movie.poster_path ? ${TMDB_IMAGE_URL}${movie.poster_path} : 'https://placeholder.com';card.innerHTML = <a href="watch.html?id=TMDB_${movie.id}"> <div class="poster-wrapper"><img src="${poster}" alt="${movie.title}"></div> <h4 style="font-size:12px; margin-top:5px; color:white;">${movie.title}</h4> </a>;relatedGrid.appendChild(card);});} else {relatedGrid.innerHTML = "Tidak ada film serupa.";}}} catch (e) {relatedGrid.innerHTML = "Gagal memuat film serupa.";}}
