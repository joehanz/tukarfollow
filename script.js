// KONFIGURASI PARAMETER UTAMA (API KEY ANDA)
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org';
const TMDB_IMAGE_URL = 'https://tmdb.org';

// STORAGE DATA GLOBAL SITE
let LOCAL_MOVIES = [];      
let TMDB_MOVIES = [];       
let ALL_MOVIES_DATA = [];   
let currentPage = 1;        
let isLoading = false;      
let currentKeyword = "";    

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    if (document.getElementById('movieGrid')) {
        startStreamingPlatform();
    }
    if (document.getElementById('playerArea')) {
        initWatchPage();
    }
});

// MEMULAI PLATFORM & MENGAMBIL DATA UTAMA
async function startStreamingPlatform() {
    // 1. Ambil data lokal dari movies.json
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            LOCAL_MOVIES = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
        }
    } catch (e) {
        console.error("Gagal membaca database lokal movies.json", e);
    }

    // 2. Ambil halaman pertama dari TMDB (Jalur Cepat Now Playing Indonesia)
    await loadMoreTMDBMovies(currentPage);

    // 3. Pasang Fitur Infinite Scroll Otomatis
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 600) {
            if (!isLoading && currentKeyword === "") { 
                currentPage++;
                loadMoreTMDBMovies(currentPage);
            }
        }
    });
}

// FUNGSI PENARIKAN DATA TERUPDATE DARI SERVER TMDB (JALUR BIOSKOP INDONESIA)
async function loadMoreTMDBMovies(page) {
    isLoading = true;

    try {
        // PERBAIKAN FATAL: Menggunakan endpoint /movie/now_playing?region=ID yang super ringan dan instan update
        const urlEndpoint = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&region=ID&page=${page}`;
        const res = await fetch(urlEndpoint);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
            // Filter ketat agar yang masuk ke grid hanya film produksi Indonesia asli saja
            const indonesianOnly = data.results.filter(movie => movie.original_language === 'id');
            
            const mappedTMDB = indonesianOnly.map(movie => ({
                title: movie.title,
                image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                video: "",
                iframe: `https://vidsrc.to{movie.id}`, 
                sinopsis: movie.overview || "Sinopsis untuk film ini belum tersedia.",
                genre: "Indonesia Movie", 
                release_date: movie.release_date || "2026-01-01",
                country: "Indonesia",
                internalId: `TMDB_${movie.id}`
            }));

            // Tumpuk data baru ke penyimpanan global situs Anda
            TMDB_MOVIES = [...TMDB_MOVIES, ...mappedTMDB];
            
            // Postingan manual Anda disatukan dan otomatis dikunci tetap di posisi atas grid
            ALL_MOVIES_DATA = [...LOCAL_MOVIES, ...TMDB_MOVIES];

            renderGrid(ALL_MOVIES_DATA);
        } else if (page === 1) {
            // Jika TMDB halaman 1 gagal, tampilkan data lokal saja agar tidak macet loading
            ALL_MOVIES_DATA = [...LOCAL_MOVIES];
            renderGrid(ALL_MOVIES_DATA);
        }
    } catch (e) {
        console.error("Gagal sinkronisasi data dengan server TMDB", e);
        if(page === 1) {
            ALL_MOVIES_DATA = [...LOCAL_MOVIES];
            renderGrid(ALL_MOVIES_DATA);
        }
    } finally {
        isLoading = false;
    }
}

// PENCETAK GRID POSTER IDENTIK (UX TUNGGAL)
function renderGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    
    grid.innerHTML = ""; // Bersihkan teks "Memuat film..." dari layar

    if (moviesList.length === 0) {
        grid.innerHTML = "<div class='loading-text'>Tidak ada film ditemukan.</div>";
        return;
    }

    const documentFragment = document.createDocumentFragment();

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
        documentFragment.appendChild(card);
    });

    grid.appendChild(documentFragment);
}

// INITIALIZATION LOGIKA SEARCH & MOBILE BURGER NAV
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
                btn.nextElementSibling.classList.toggle('open-mobile');
            }
        });
    });

    // Real-Time Search Input Handler (Membaca seluruh isi judul film di grid)
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

    // Dropdown Items Click Handler (Genre / Rilis)
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

// LOGIKA HALAMAN NONTON & PEMUTAR VIDEO IKLAN 2X KLIK
async function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const filmId = urlParams.get('id');
    if (!filmId) return;

    let currentMovie = null;

    // 1. Cari di database lokal terlebih dahulu
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const localData = await res.json();
            const mappedLocal = localData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
            currentMovie = mappedLocal.find(m => m.internalId === filmId);
        }
    } catch (e) {
        console.error(e);
    }

    // 2. Jika tidak ada di lokal, tembak API TMDB secara langsung bypass loading global
    if (!currentMovie && filmId && filmId.startsWith('TMDB_')) {
        const tmdbId = filmId.replace('TMDB_', '');
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
            if (res.ok) {
                const movie = await res.json();
                currentMovie = {
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "",
                    iframe: `https://vidsrc.to{movie.id}`,
                    sinopsis: movie.overview || "Sinopsis tidak tersedia untuk film ini.",
                    genre: "Indonesia Movie",
                    release_date: movie.release_date,
                    country: "Indonesia",
                    internalId: filmId
                };
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Pengaman jika data tidak valid / ID rusak
    if (!currentMovie) {
        const titleEl = document.getElementById('watchTitle');
        if(titleEl) titleEl.innerText = "Film Tidak Ditemukan";
        return;
    }

    // Cetak data film ke elemen DOM komponen watch.html
    if(document.getElementById('watchTitle')) document.getElementById('watchTitle').innerText = currentMovie.title;
    if(document.getElementById('watchGenre')) document.getElementById('watchGenre').innerText = currentMovie.genre;
    if(document.getElementById('watchRelease')) document.getElementById('watchRelease').innerText = currentMovie.release_date;
    if(document.getElementById('watchCountry')) document.getElementById('watchCountry').innerText = currentMovie.country;
    if(document.getElementById('watchSinopsis')) document.getElementById('watchSinopsis').innerText = currentMovie.sinopsis;

    const container = document.getElementById('videoContainer');
const adOverlay = document.getElementById('adOverlay');if (container) {if (currentMovie.iframe) {container.innerHTML = <iframe src="${currentMovie.iframe}" allowfullscreen></iframe>;} else if (currentMovie.video) {container.innerHTML = <video id="nativeVideo" src="${currentMovie.video}" controls></video>;}}// Logika Pemutus Iklan Popunderconst videoSourceUrl = currentMovie.iframe || currentMovie.video;if (videoSourceUrl && videoSourceUrl.includes('abyssplayer.com')) {if(adOverlay) adOverlay.classList.add('disabled');} else if (adOverlay) {let clickCount = 0;const targetAds = ["https://rajarayap.com", "blogspot.com", "blogspot.com"];adOverlay.addEventListener('click', () => {clickCount++;window.open(targetAds[Math.floor(Math.random() * targetAds.length)], '_blank');if (clickCount >= 2) {adOverlay.classList.add('disabled');const nVid = document.getElementById('nativeVideo');if (nVid) nVid.play();}});}loadRelatedCarousel(currentMovie, filmId);}// HANDLING LOAD CAROUSEL FILM SERUPAasync function loadRelatedCarousel(currentMovie, filmId) {const relatedGrid = document.getElementById('relatedGrid');if (!relatedGrid) return;try {const res = await fetch(${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&region=ID&page=1);if (res.ok) {const data = await res.json();if (data.results) {const indonesianOnly = data.results.filter(m => m.original_language === 'id');const carouselData = indonesianOnly.map(m => ({title: m.title,image: m.poster_path ? ${TMDB_IMAGE_URL}${m.poster_path} : 'placeholder.com',internalId: TMDB_${m.id}})).filter(m => m.internalId !== filmId);carouselData.slice(0, 10).forEach(movie => {const item = document.createElement('a');item.className = "movie-card";item.href = watch.html?id=${movie.internalId};item.innerHTML = <div class="poster-wrapper"> <img src="${movie.image}" alt="${movie.title}" loading="lazy"> </div> <h3>${movie.title}</h3>;relatedGrid.appendChild(item);});}}} catch(e) {console.error(e);}const btnPrev = document.getElementById('slidePrev');const btnNext = document.getElementById('slideNext');if (btnPrev && btnNext) {btnPrev.addEventListener('click', () => relatedGrid.scrollLeft -= 250);btnNext.addEventListener('click', () => relatedGrid.scrollLeft += 250);}}
