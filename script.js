// ==================== BAGIAN 1: KONFIGURASI & HALAMAN UTAMA ====================
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org'; 
const TMDB_IMAGE_URL = 'https://tmdb.org'; 

// DAFTAR DOMAIN IKLAN MANDIRI
const AD_DOMAINS = [
    'https://rajarayap.com',
    'https://blogspot.com',
    'https://blogspot.com'
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
        const today = new Date().toISOString().split('T');
        const endpoint = `https://themoviedb.org{TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&release_date.lte=${today}`;
        const res = await fetch(endpoint);
        
        if (res.ok) {
            const data = await res.json();
            if (data.results) {
                tmdbData = data.results.map(movie => ({
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "",
                    iframe: `https://vidsrc.me${movie.id}`, 
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
    let localMoviesList = [];

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
    else if (movieId.startsWith("TMDB_")) {
        const tmdbId = movieId.replace("TMDB_", "");
        try {
            const res = await fetch(`https://themoviedb.org{tmdbId}?api_key=${TMDB_API_KEY}&language=id-ID`);
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

    if (selectedMovie) {
        document.getElementById("watchTitle").innerText = selectedMovie.title;
        document.getElementById("watchSinopsis").innerText = selectedMovie.sinopsis;
        document.getElementById("watchGenre").innerText = selectedMovie.genre;
        document.getElementById("watchRelease").innerText = selectedMovie.release_date;
        document.getElementById("watchCountry").innerText = selectedMovie.country;
        
        const videoContainer = document.getElementById("videoContainer");
        
        // Pemutar Video Asli bawaan website Anda
        videoContainer.innerHTML = `
            <iframe src="${selectedMovie.iframe}" allowfullscreen frameborder="0" width="100%" height="100%" 
            sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
        `;
    }

    // AKTIVASI SISTEM IKLAN MANDIRI (Membuka Tab Baru Secara Acak Saat Area Iklan Diklik)
    const adOverlay = document.querySelector('.ad-overlay');
    if (adOverlay) {
        adOverlay.addEventListener('click', () => {
            if (AD_DOMAINS.length > 0) {
                const randomAd = AD_DOMAINS[Math.floor(Math.random() * AD_DOMAINS.length)];
                window.open(randomAd, '_blank');
            }
        });
    }
}
