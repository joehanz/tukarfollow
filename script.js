// CONFIG UTAMA
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://tmdb.org';

// GLOBAL STORAGE
let LOCAL_MOVIES = [];      
let TMDB_MOVIES = [];       
let ALL_MOVIES_DATA = [];   
let currentPage = 1;        
let isLoading = false;      
let currentKeyword = "";    

// AMAN: Jalankan kode hanya saat HTML benar-benar siap dimuat utuh
window.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    if (document.getElementById('movieGrid')) {
        startStreamingPlatform();
    }
    if (document.getElementById('playerArea')) {
        initWatchPage();
    }
});

// MEMULAI PLATFORM & AMBIL DATA AWAL
async function startStreamingPlatform() {
    // 1. Prioritas Utama: Ambil film lokal movies.json Anda dulu
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            LOCAL_MOVIES = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
        }
    } catch (e) {
        console.error("Gagal membaca database lokal movies.json", e);
    }

    // Tampilkan data lokal segera tanpa menunggu TMDB agar anti-loading lama!
    ALL_MOVIES_DATA = [...LOCAL_MOVIES];
    renderGrid(ALL_MOVIES_DATA);

    // 2. Ambil data pelengkap dari TMDB (Jalur Aman Discover)
    await loadMoreTMDBMovies(currentPage);

    // 3. Deteksi Scroll Otomatis Tanpa Batas (Infinite Scroll)
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 600) {
            if (!isLoading && currentKeyword === "") { 
                currentPage++;
                loadMoreTMDBMovies(currentPage);
            }
        }
    });
}

// AMAN: Tarik data dari TMDB dengan filter penanggalan yang sudah disederhanakan
async function loadMoreTMDBMovies(page) {
    if (isLoading) return;
    isLoading = true;

    try {
        // Menggunakan jalur stabil discover movie khusus wilayah Indonesia (region=ID)
        const urlEndpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&page=${page}`;
        const res = await fetch(urlEndpoint);
        
        if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const mappedTMDB = data.results.map(movie => ({
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "",
                    iframe: `https://vidsrc.to{movie.id}`, 
                    sinopsis: movie.overview || "Sinopsis belum tersedia untuk film ini.",
                    genre: "Indonesia Movie", 
                    release_date: movie.release_date || "2026-01-01",
                    country: "Indonesia",
                    internalId: `TMDB_${movie.id}`
                }));

                // Gabungkan data baru ke array global
                TMDB_MOVIES = [...TMDB_MOVIES, ...mappedTMDB];
                ALL_MOVIES_DATA = [...LOCAL_MOVIES, ...TMDB_MOVIES];

                // Cetak ulang grid terupdate
                renderGrid(ALL_MOVIES_DATA);
            }
        }
    } catch (e) {
        console.error("Koneksi internet lambat / TMDB Error:", e);
    } finally {
        isLoading = false;
    }
}

// AMAN: Pencetak Grid Poster yang Kebal Terhadap Eror Null Element
function renderGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    
    grid.innerHTML = ""; // Hapus teks "Memuat film..."

    if (moviesList.length === 0) {
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

// NAVIGASI DROPDOWN & LIVE SEARCH
function initNavbar() {
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    document.querySelectorAll('.dropbtn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                const menu = btn.nextElementSibling;
                if(menu) menu.classList.toggle('open-mobile');
            }
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentKeyword = e.target.value.toLowerCase();
            if (currentKeyword === "") {
                renderGrid(ALL_MOVIES_DATA);
            } else {
                const filtered = ALL_MOVIES_DATA.filter(m => m.title.toLowerCase().includes(currentKeyword));
                renderGrid(filtered);
            }
        });
    }

    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            let filtered = [...ALL_MOVIES_DATA];
            const genre = link.getAttribute('data-genre');
            const year = link.getAttribute('data-year');
            const sectionTitle = document.getElementById('sectionTitle');

            if (genre) {
                if(sectionTitle) sectionTitle.innerText = `Genre: ${genre}`;
                filtered = ALL_MOVIES_DATA.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
            } else if (year) {
                if(sectionTitle) sectionTitle.innerText = `Tahun Rilis: ${year === 'klasik' ? 'Klasik (<2024)' : year}`;
                filtered = ALL_MOVIES_DATA.filter(m => {
                    const rYear = new Date(m.release_date).getFullYear();
                    return year === 'klasik' ? rYear < 2024 : rYear === parseInt(year);
                });
            }
            
            renderGrid(filtered);
            if(navMenu && burgerBtn) {
                navMenu.classList.remove('open');
                burgerBtn.classList.remove('open');
            }
        });
    });
}

// AMAN: Logika Halaman Nonton Tanpa Crash Macet Loading
async function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    if (!filmId) return;

    let currentMovie = null;

    // 1. Cari data lokal di file json
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const localData = await res.json();
            const mappedLocal = localData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
            currentMovie = mappedLocal.find(m => m.internalId === filmId);
        }
    } catch (e) { console.error(e); }

    // 2. Jika tidak ketemu, langsung tembak data spesifik ID film ke TMDB
    if (!currentMovie && filmId && filmId.startsWith('TMDB_')) {
        const tmdbId = filmId.replace('TMDB_', '');
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
            if (res.ok) {
                const movie = await res.json();
                currentMovie = {
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "", iframe: `https://vidsrc.to{movie.id}`,
                    sinopsis: movie.overview || "Sinopsis tidak tersedia untuk film ini.",
                    genre: "Indonesia Movie", release_date: movie.release_date,
                    country: "Indonesia", internalId: filmId
                };
            }
        } catch (e) { console.error(e); }
    }

    // Jika film tidak ditemukan sama sekali di kedua server, hentikan loading agar tidak blank
    if (!currentMovie) {
        const titleEl = document.getElementById('watchTitle');
        if (titleEl) titleEl.innerText = "Film Tidak Ditemukan / Gagal Memuat Server";
        return;
    }

    // Masukkan data teks ke halaman watch (Aman dengan pengecekan elemen eksis)
    const t = document.getElementById('watchTitle'), g = document.getElementById('watchGenre'), 
          r = document.getElementById('watchRelease'), c = document.getElementById('watchCountry'), 
          s = document.getElementById('watchSinopsis');
          
    if(t) t.innerText = currentMovie.title;
    if(g) g.innerText = currentMovie.genre;
    if(r) r.innerText = currentMovie.release_date;
    if(c) c.innerText = currentMovie.country;
    if(s) s.innerText = currentMovie.sinopsis;

    // Injeksi Video Player Area
    const container = document.getElementById('videoContainer');
    const adOverlay = document.getElementById('adOverlay');
    
    if (container) {
        if (currentMovie.iframe) {
            container.innerHTML = `<iframe src="${currentMovie.iframe}" allowfullscreen></iframe>`;
        } else if (currentMovie.video) {
            container.innerHTML = `<video id="nativeVideo" src="${currentMovie.video}" controls></video>`;
        }
    }

    // Proteksi Iklan
    const videoSourceUrl = currentMovie.iframe || currentMovie.video;
if (videoSourceUrl && videoSourceUrl.includes('abyssplayer.com')) {if(adOverlay) adOverlay.classList.add('disabled');} else if (adOverlay) {let clickCount = 0;const targetAds = ["https://rajarayap.com", "blogspot.com", "blogspot.com"];adOverlay.addEventListener('click', () => {clickCount++;window.open(targetAds[Math.floor(Math.random() * targetAds.length)], '_blank');if (clickCount >= 2) {adOverlay.classList.add('disabled');const nVid = document.getElementById('nativeVideo');if (nVid) nVid.play();}});}loadRelatedCarousel(currentMovie, filmId);}// SLIDER FILM SERUPA CAROUSELasync function loadRelatedCarousel(currentMovie, filmId) {const relatedGrid = document.getElementById('relatedGrid');if (!relatedGrid) return;try {const res = await fetch(${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=1);if (res.ok) {const data = await res.json();if (data.results) {const carouselData = data.results.map(m => ({title: m.title,image: m.poster_path ? ${TMDB_IMAGE_URL}${m.poster_path} : 'placeholder.com',internalId: TMDB_${m.id}})).filter(m => m.internalId !== filmId);carouselData.slice(0, 10).forEach(movie => {const item = document.createElement('a');item.className = "movie-card";item.href = watch.html?id=${movie.internalId};item.innerHTML = <div class="poster-wrapper"> <img src="${movie.image}" alt="${movie.title}" loading="lazy"> </div> <h3>${movie.title}</h3>;relatedGrid.appendChild(item);});}}} catch(e) { console.error(e); }const btnPrev = document.getElementById('slidePrev');const btnNext = document.getElementById('slideNext');if (btnPrev && btnNext) {btnPrev.addEventListener('click', () => relatedGrid.scrollLeft -= 250);btnNext.addEventListener('click', () => relatedGrid.scrollLeft += 250);}}
