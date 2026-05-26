// KONFIGURASI PARAMETER RESMI API TMDB
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org';
const TMDB_IMAGE_URL = 'https://tmdb.org';

// Eksekusi otomatis saat kerangka HTML halaman watch selesai dibaca
document.addEventListener("DOMContentLoaded", () => {
    initNavbarWatch();
    initWatchPage();
});

// LOGIKA NAVIGASI HALAMAN NONTON (Konsisten & Identik)
function initNavbarWatch() {
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    // Mengarahkan pencarian di halaman nonton kembali ke beranda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.location.href = `index.html?search=${encodeURIComponent(searchInput.value)}`;
            }
        });
    }

    // Mengarahkan filter dropdown di halaman nonton kembali ke beranda
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const genre = link.getAttribute('data-genre');
            const year = link.getAttribute('data-year');
            if (genre) {
                window.location.href = `index.html?genre=${encodeURIComponent(genre)}`;
            } else if (year) {
                window.location.href = `index.html?year=${encodeURIComponent(year)}`;
            }
        });
    });
}

// LOGIKA PENGEKSTRAKAN DATA & PEMUTAR VIDEO IKLAN 2X KLIK
async function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    if (!filmId) return;

    let currentMovie = null;

    // Skenario 1: Membaca Jika Film Berasal dari Postingan Manual Anda
    if (filmId.startsWith('LOCAL_')) {
        const localIndex = parseInt(filmId.replace('LOCAL_', ''));
        try {
            const res = await fetch('movies.json');
            if (res.ok) {
                const data = await res.json();
                currentMovie = data[localIndex];
                if (currentMovie) currentMovie.internalId = filmId;
            }
        } catch (e) {
            console.error("Gagal mengekstrak data movies.json lokal:", e);
        }
    } 
    // Skenario 2: Membaca Jika Film Berasal dari Server Resmi TMDB
    else if (filmId.startsWith('TMDB_')) {
        const tmdbId = filmId.replace('TMDB_', '');
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
            if (res.ok) {
                const movie = await res.json();
                currentMovie = {
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "",
                    iframe: `https://vidsrc.me{movie.id}`,
                    sinopsis: movie.overview || "Sinopsis deskripsi belum tersedia untuk film ini.",
                    genre: "Indonesia Movie",
                    release_date: movie.release_date || "Unknown",
                    country: "Indonesia",
                    internalId: filmId
                };
            }
        } catch (e) {
            console.error("Gagal mengekstrak detail film dari server TMDB:", e);
        }
    }

    if (!currentMovie) {
        document.getElementById('watchTitle').innerText = "Film Tidak Ditemukan";
        return;
    }

    // Suntik data tulisan detail film ke halaman nonton
    document.getElementById('watchTitle').innerText = currentMovie.title;
    document.getElementById('watchGenre').innerText = currentMovie.genre;
    document.getElementById('watchRelease').innerText = currentMovie.release_date;
    document.getElementById('watchCountry').innerText = currentMovie.country;
    document.getElementById('watchSinopsis').innerText = currentMovie.sinopsis;

    // Injeksi Video Player Area
    const container = document.getElementById('videoContainer');
    const adOverlay = document.getElementById('adOverlay');
    
    if (container) {
        if (currentMovie.iframe) {
            // Ditambahkan parameter pengaman origin & sandbox agar mulus lolos blokir https GitHub Pages
            container.innerHTML = `<iframe src="${currentMovie.iframe}" allowfullscreen referrerpolicy="origin" sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"></iframe>`;
        } else if (currentMovie.video) {
            container.innerHTML = `<video id="nativeVideo" src="${currentMovie.video}" controls></video>`;
        }
    }

    // Operasi Skema Perlindungan Klik Iklan 2x Klik
    const videoSourceUrl = currentMovie.iframe || currentMovie.video;
    if (videoSourceUrl && videoSourceUrl.includes('abyssplayer.com')) {
        if (adOverlay) adOverlay.classList.add('disabled');
    } else if (adOverlay) {
        let clicks = 0;
        const targetAdsPool = [
            "https://rajarayap.com", 
            "https://blogspot.com", 
            "https://blogspot.com"
        ];
        
        adOverlay.addEventListener('click', () => {
            clicks++;
            window.open(targetAdsPool[Math.floor(Math.random() * targetAdsPool.length)], '_blank');
            if (clicks >= 2) {
                adOverlay.classList.add('disabled');
                const nativeVid = document.getElementById('nativeVideo');
                if (nativeVid) nativeVid.play();
            }
        });
    }

    // Bangun Slider Horizontal Film Serupa
    loadRelatedCarousel(filmId);
}

// MEMBANGUN CAROUSEL REKOMENDASI FILM TERKAIT
async function loadRelatedCarousel(excludeId) {
    const relatedGrid = document.getElementById('relatedGrid');
    if (!relatedGrid) return;

    try {
        const res = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=1`);
        if (res.ok) {
            const data = await res.json();
            if (data.results) {
                relatedGrid.innerHTML = ""; 
                
                const filteredList = data.results.map(m => ({
                    title: m.title,
                    image: m.poster_path ? `${TMDB_IMAGE_URL}${m.poster_path}` : 'https://placeholder.com',
                    internalId: `TMDB_${m.id}`
                })).filter(m => m.internalId !== excludeId);

                filteredList.slice(0, 10).forEach(movie => {
                    const card = document.createElement('a');
                    card.className = "movie-card";
                    card.href = `watch.html?id=${movie.internalId}`;
                    card.innerHTML = `
                        <div class="poster-wrapper">
                            <img src="${movie.image}" alt="${movie.title}" loading="lazy">
                        </div>
                        <h3>${movie.title}</h3>
                    `;
                    relatedGrid.appendChild(card);
                });
            }
        }
    } catch (e) {
        console.error("Gagal memuat rekomendasi film terkait:", e);
    }

    // Handler Klik Navigasi Panah Carousel Desktop
    const prev = document.getElementById('slidePrev');
    const next = document.getElementById('slideNext');
    if (prev && next) {
        prev.addEventListener('click', () => relatedGrid.scrollLeft -= 240);
        next.addEventListener('click', () => relatedGrid.scrollLeft += 240);
    }
}
