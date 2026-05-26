// KONFIGURASI PARAMETER (Masukkan API Key Anda di Sini)
const TMDB_API_KEY = 'MASUKKAN_API_KEY_TMDB_ANDA'; 
const TMDB_BASE_URL = 'https://themoviedb.org';
const TMDB_IMAGE_URL = 'https://tmdb.org';

// Global Data Storage
let ALL_MOVIES = [];

// Inisialisasi Event Listener Navbar & Filter
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    if (document.getElementById('movieGrid')) {
        loadAllMoviesData();
    }
    if (document.getElementById('playerArea')) {
        initWatchPage();
    }
});

// LOGIKA NAVIGATION BURGER & DROPDOWN (SMOOTH TRANSITION)
function initNavbar() {
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burgerBtn) {
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
                content.classList.toggle('open-mobile');
            }
        });
    });

    // Real-Time Search Handler
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = ALL_MOVIES.filter(m => m.title.toLowerCase().includes(keyword));
            renderGrid(filtered);
        });
    }

    // Filter Dropdown Items Click Handler
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            let filtered = [...ALL_MOVIES];
            
            const genre = link.getAttribute('data-genre');
            const year = link.getAttribute('data-year');

            if (genre) {
                document.getElementById('sectionTitle').innerText = `Genre: ${genre}`;
                filtered = ALL_MOVIES.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
            } else if (year) {
                document.getElementById('sectionTitle').innerText = `Tahun Rilis: ${year === 'klasik' ? 'Klasik (<2024)' : year}`;
                filtered = ALL_MOVIES.filter(m => {
                    const releaseYear = new Date(m.release_date).getFullYear();
                    if (year === 'klasik') return releaseYear < 2024;
                    return releaseYear === parseInt(year);
                });
            }
            
            renderGrid(filtered);
            // Tutup menu mobile jika terbuka
            if(navMenu) {
                navMenu.classList.remove('open');
                if(burgerBtn) burgerBtn.classList.remove('open');
            }
        });
    });
}

// MENGGABUNGKAN DATA JSON & TMDB (FILM INDONESIA ONLY & SORT BY RELEASE)
async function loadAllMoviesData() {
    let localData = [];
    let tmdbData = [];

    // 1. Ambil dari movies.json lokal
    try {
        const res = await fetch('movies.json');
        localData = await res.json();
        // Berikan penanda unik lokal ID
        localData = localData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
    } catch (e) {
        console.error("Gagal membaca movies.json", e);
    }

    // 2. Ambil dari API TMDB (Filter: Original Language = ID / Indonesia)
    try {
        const res = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&sort_by=release_date.desc`);
        const data = await res.json();
        if (data.results) {
            tmdbData = data.results.map(movie => ({
                title: movie.title,
                image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                video: "",
                iframe: `https://vidsrc.to{movie.id}`, // Menggunakan CDN player open source TMDB
                sinopsis: movie.overview,
                genre: "Indonesia Movie", 
                release_date: movie.release_date || "0000-00-00",
                country: "Indonesia",
                internalId: `TMDB_${movie.id}`
            }));
        }
    } catch (e) {
        console.error("Gagal terhubung ke API TMDB", e);
    }

    // 3. Melebur Array & Mengurutkan Berdasarkan Tanggal Rilis Terbaru
    ALL_MOVIES = [...localData, ...tmdbData].sort((a, b) => {
        return new Date(b.release_date) - new Date(a.release_date);
    });

    renderGrid(ALL_MOVIES);
}

// MERENDER TAMPILAN GRID 100% IDENTIK (UX TUNGGAL)
function renderGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    
    grid.innerHTML = "";
    if (moviesList.length === 0) {
        grid.innerHTML = "<div class='loading-text'>Tidak ada film ditemukan.</div>";
        return;
    }

    moviesList.forEach(movie => {
        const card = document.createElement('a');
        card.className = "movie-card";
        // Alihkan halaman dengan melempar parameter Query URL internalId
        card.href = `watch.html?id=${movie.internalId}`;
        
        card.innerHTML = `
            <div class="poster-wrapper">
                <img src="${movie.image}" alt="${movie.title}" loading="lazy">
            </div>
            <h3>${movie.title}</h3>
        `;
        grid.appendChild(card);
    });
}

// LOGIKA HALAMAN WATCH & ANTI-ADBLOCK MONETISASI IKLAN 2X KLIK
async function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    if (!filmId) return;

    // Ambil ulang database gabungan untuk mencari film yang diklik
    let localData = [];
    try { const res = await fetch('movies.json'); localData = await res.json(); } catch(e){}
    localData = localData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));

    let currentMovie = localData.find(m => m.internalId === filmId);

    // Jika id berasal dari TMDB, ambil via API TMDB secara spesifik
    if (!currentMovie && filmId.startsWith('TMDB_')) {
        const tmdbId = filmId.replace('TMDB_', '');
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
            const movie = await res.json();
            currentMovie = {
                title: movie.title,
                image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : '',
                video: "",
                iframe: `https://vidsrc.to{movie.id}`,
                sinopsis: movie.overview,
                genre: "Indonesia Movie",
                release_date: movie.release_date,
                country: "Indonesia",
                internalId: filmId
            };
        } catch(e){}
    }

    if (!currentMovie) return;

    // Render Data Teks ke Halaman Watch
    document.getElementById('watchTitle').innerText = currentMovie.title;
    document.getElementById('watchGenre').innerText = currentMovie.genre;
    document.getElementById('watchRelease').innerText = currentMovie.release_date;
    document.getElementById('watchCountry').innerText = currentMovie.country;
    document.getElementById('watchSinopsis').innerText = currentMovie.sinopsis;

    // INJEKSI VIDEO PLAYER & LOGIKA IKLAN
    const container = document.getElementById('videoContainer');
    const adOverlay = document.getElementById('adOverlay');
    
    if (currentMovie.iframe) {
        container.innerHTML = `<iframe src="${currentMovie.iframe}" allowfullscreen></iframe>`;
    } else if (currentMovie.video) {
        container.innerHTML = `<video id="nativeVideo" src="${currentMovie.video}" controls></video>`;
    }

    // Deteksi Sumber Domain Video Player
    const videoSourceUrl = currentMovie.iframe || currentMovie.video;
    const isAbyss = videoSourceUrl.includes('abyssplayer.com');
    const isTargetAdSource = videoSourceUrl.includes('playcinematic.com') || filmId.startsWith('TMDB_');

    // Jika yang diputar adalah abyssplayer, matikan sistem overlay script iklan agar seragam
    if (isAbyss) {
        adOverlay.classList.add('disabled');
    } else if (isTargetAdSource) {
        // Logika Klik Iklan Popunder 2x Klik
        let clickCount = 0;
        const targetAds = [
            "https://rajarayap.com",
            "https://blogspot.com",
            "https://blogspot.com"
        ];

        adOverlay.addEventListener('click', () => {
            clickCount++;
            
            // Pilih satu iklan acak dari daftar pilihan Anda
            const randomAd = targetAds[Math.floor(Math.random() * targetAds.length)];
            window.open(randomAd, '_blank');

            if (clickCount >= 2) {
                // Hilangkan overlay penutup agar pengguna bisa langsung berinteraksi memutar film asli
                adOverlay.classList.add('disabled');
                
                // Jika video berupa HTML5 native player, langsung picu pemutaran
                const nativeVid = document.getElementById('nativeVideo');
                if (nativeVid) nativeVid.play();
            }
        });
    } else {
        // Fallback jika ada domain lain
        adOverlay.classList.add('disabled');
    }
}
