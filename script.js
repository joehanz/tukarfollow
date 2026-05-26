// ==================== BAGIAN 1: KONFIGURASI & HALAMAN UTAMA ====================
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org'; // FIX: Menggunakan endpoint API resmi v3
const TMDB_IMAGE_URL = 'https://themoviedb.org'; // FIX: Menggunakan server gambar TMDB resmi

// DAFTAR DOMAIN IKLAN MANDIRI
const AD_DOMAINS = [
    'https://rajarayap.com',
    'https://ptdwiprima.blogspot.com',
    'https://caturbangunsentosa.blogspot.com'
];

let ALL_MOVIES = [];

// Inisialisasi Utama Halaman Web
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    if (document.getElementById('movieGrid')) {
        loadAllMoviesData();
    }
    if (document.getElementById('videoContainer')) {
        loadWatchPageData();
    }
});

// LOGIKA NAVIGATION BURGER & DROPDOWN RESPONSIVE
function initNavbar() {
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    const dropBtns = document.querySelectorAll('.dropbtn');
    dropBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const content = btn.nextElementSibling;
                if (content) content.classList.toggle('open-mobile');
            }
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = ALL_MOVIES.filter(m => m.title.toLowerCase().includes(keyword));
            renderGrid(filtered);
        });
    }

    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            let filtered = [...ALL_MOVIES];
            const genre = link.getAttribute('data-genre');
            const year = link.getAttribute('data-year');
            const sectionTitle = document.getElementById('sectionTitle');

            if (genre) {
                if (sectionTitle) sectionTitle.innerText = `Genre: ${genre}`;
                filtered = ALL_MOVIES.filter(m => {
                    if (!m.genre) return false;
                    // FIX: Mengatasi pengecekan jika genre berbentuk array maupun string biasa
                    if (Array.isArray(m.genre)) {
                        return m.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()));
                    }
                    return m.genre.toLowerCase().includes(genre.toLowerCase());
                });
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
            if (navMenu && burgerBtn) {
                navMenu.classList.remove('open');
                burgerBtn.classList.remove('open');
            }
        });
    });
}

// MENGGABUNGKAN DATA JSON LOKAL & API TMDB
async function loadAllMoviesData() {
    let localData = [];
    let tmdbData = [];

    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            localData = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
        }
    } catch (e) {
        console.error("Gagal membaca movies.json lokal:", e);
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        // FIX: Menggunakan TMDB_BASE_URL resmi & parameter regional Indonesia yang tepat
        const endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&release_date.lte=${today}&language=id-ID`;
        const res = await fetch(endpoint);
        
        if (res.ok) {
            const data = await res.json();
            if (data.results) {
                tmdbData = data.results.map(movie => ({
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "",
                    iframe: `https://vidsrc.me{movie.id}`, // FIX: Memperbaiki format string interpolasi vidsrc
                    sinopsis: movie.overview || "Sinopsis belum tersedia untuk film ini.",
                    genre: ["Indonesia Movie"], // FIX: Diubah menjadi array agar seragam dengan movies.json
                    release_date: movie.release_date || "0000-00-00",
                    country: "Indonesia",
                    internalId: `TMDB_${movie.id}`
                }));
            }
        }
    } catch (e) {
        console.error("Gagal sinkronisasi dengan API TMDB:", e);
    }

    ALL_MOVIES = [...localData, ...tmdbData].sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(b.release_date) - new Date(a.release_date);
    });

    renderGrid(ALL_MOVIES);
}

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
            <div class="poster-wrapper"><img src="${movie.image}" alt="${movie.title}" loading="lazy"></div>
            <h3>${movie.title}</h3>
        `;
        fragment.appendChild(card);
    });
    grid.appendChild(fragment);
}

// ==================== BAGIAN 2: HALAMAN NONTON & SISTEM IKLAN ====================
async function loadWatchPageData() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        document.getElementById("watchTitle").innerText = "Film Tidak Ditemukan";
        return;
    }

    let selectedMovie = null;
    let allMoviesList = [];

    // Ambil basis data master film terlebih dahulu untuk sistem carousel
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            allMoviesList = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
        }
    } catch (e) {
        console.error("Gagal membaca master data untuk carousel:", e);
    }

    if (movieId.startsWith("LOCAL_")) {
        const index = parseInt(movieId.replace("LOCAL_", ""));
        if (allMoviesList[index]) {
            selectedMovie = allMoviesList[index];
        }
    } 
    else if (movieId.startsWith("TMDB_")) {
        const tmdbId = movieId.replace("TMDB_", "");
        try {
            // FIX: Perbaikan format string interpolasi pemanggilan API detail TMDB
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=id-ID`);
            if (res.ok) {
                const movie = await res.json();
                selectedMovie = {
                    title: movie.title,
                    sinopsis: movie.overview || "Sinopsis belum tersedia.",
                    genre: ["Indonesia Movie"],
                    release_date: movie.release_date,
                    country: "Indonesia",
                    iframe: `https://vidsrc.me{tmdbId}` // FIX: String interpolasi vidsrc
                };
            }
        } catch (e) {
            console.error("Gagal memuat detail film TMDB:", e);
        }
    }

    if (selectedMovie) {
        document.getElementById("watchTitle").innerText = selectedMovie.title;
        document.getElementById("watchSinopsis").innerText = selectedMovie.sinopsis;
        
        // Menampilkan teks genre secara rapi di HTML
        document.getElementById("watchGenre").innerText = Array.isArray(selectedMovie.genre) ? selectedMovie.genre.join(", ") : selectedMovie.genre;
        document.getElementById("watchRelease").innerText = selectedMovie.release_date;
        document.getElementById("watchCountry").innerText = selectedMovie.country;
        
        const videoContainer = document.getElementById("videoContainer");
        videoContainer.innerHTML = `
            <iframe src="${selectedMovie.iframe}" allowfullscreen frameborder="0" width="100%" height="100%" 
            sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
        `;

        // FIX: MENAYANGKAN CAROUSEL FILM SERUPA (RELATED MOVIES)
        generateRelatedCarousel(selectedMovie, allMoviesList);
    }
}

// FIX LOGIKA UTAMA CAROUSEL FILM SERUPA
function generateRelatedCarousel(currentMovie, allMovies) {
    const carousel = document.querySelector('.movie-carousel');
    if (!carousel) return;
    carousel.innerHTML = "";

    // Saring film yang memiliki irisan genre yang sama
    const related = allMovies.filter(movie => {
        if (movie.title === currentMovie.title) return false;
        if (!movie.genre || !currentMovie.genre) return false;

        const currentGenres = Array.isArray(currentMovie.genre) ? currentMovie.genre : [currentMovie.genre];
const targetGenres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];return targetGenres.some(g => currentGenres.map(cg => cg.toLowerCase()).includes(g.toLowerCase()));});if (related.length === 0) {carousel.innerHTML = "Tidak ada film serupa ditemukan.";return;}related.forEach(movie => {const card = document.createElement('a');card.className = "movie-card";card.href = watch.html?id=${movie.internalId};card.innerHTML = <div class="poster-wrapper"><img src="${movie.image}" alt="${movie.title}" loading="lazy"></div> <h3>${movie.title}</h3>;carousel.appendChild(card);});}
