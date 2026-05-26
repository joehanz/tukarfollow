// KONFIGURASI PARAMETER UTAMA
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org';
const TMDB_IMAGE_URL = 'https://tmdb.org';

// STORAGE DATA GLOBAL
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

// MEMULAI PLATFORM & MENGAMBIL DATA AWAL
async function startStreamingPlatform() {
    // 1. Ambil data lokal dari movies.json
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            LOCAL_MOVIES = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
        }
    } catch (e) {
        console.error("Gagal membaca movies.json", e);
    }

    // 2. Ambil halaman pertama dari TMDB
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

// FUNGSI PENARIKAN DATA AUTOMATIC DARI SERVER TMDB
async function loadMoreTMDBMovies(page) {
    isLoading = true;
    const today = new Date().toISOString().split('T')[0];

    try {
        const urlEndpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&release_date.lte=${today}&page=${page}`;
        const res = await fetch(urlEndpoint);
        if (!res.ok) throw new Error("Respon server API bermasalah");
        
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
            const mappedTMDB = data.results.map(movie => ({
                title: movie.title,
                image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                video: "",
                iframe: `https://vidsrc.to{movie.id}`, 
                sinopsis: movie.overview || "Sinopsis untuk film ini belum tersedia.",
                genre: "Indonesia Movie", 
                release_date: movie.release_date || "0000-00-00",
                country: "Indonesia",
                internalId: `TMDB_${movie.id}`
            }));

            // Tumpuk data TMDB baru ke penyimpanan global
            TMDB_MOVIES = [...TMDB_MOVIES, ...mappedTMDB];
            
            // Satukan kembali dengan data lokal buatan Anda
            ALL_MOVIES_DATA = [...LOCAL_MOVIES, ...TMDB_MOVIES];

            renderGrid(ALL_MOVIES_DATA);
        }
    } catch (e) {
        console.error("Gagal sinkronisasi data dengan server TMDB", e);
        // Fallback: Jika TMDB down/gagal terhubung, pastikan film lokal Anda tetap tampil
        if(page === 1) {
            ALL_MOVIES_DATA = [...LOCAL_MOVIES];
            renderGrid(ALL_MOVIES_DATA);
        }
    } finally {
        isLoading = false;
    }
}

// PENCETAK GRID POSTER IDENTIK
function renderGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    
    // Hapus elemen pemuat/loading text pada renderan pertama kali
    grid.innerHTML = "";

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

    // Real-Time Search Input Handler
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

    // 2. Jika tidak ada di lokal, tembak API TMDB secara langsung bypass loading
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

    // Pastikan status loading dihentikan dengan menyuntikkan konten teks fungsional
    if (!currentMovie) {
        document.getElementById('watchTitle').innerText = "Film Tidak Ditemukan";
        return;
    }

    // Cetak data ke DOM komponen watch.html
    document.getElementById('watchTitle').innerText = currentMovie.title;
    document.getElementById('watchGenre').innerText = currentMovie.genre;
    document.getElementById('watchRelease').innerText = currentMovie.release_date;
    document.getElementById('watchCountry').innerText = currentMovie.country;
    document.getElementById('watchSinopsis').innerText = currentMovie.sinopsis;

    const container = document.getElementById('videoContainer');
    const adOverlay = document.getElementById('adOverlay');
    
    if (currentMovie.iframe) {
        container.innerHTML = `<iframe src="${currentMovie.iframe}" allowfullscreen></iframe>`;
    } else if (currentMovie.video) {
        container.innerHTML = `<video id="nativeVideo" src="${currentMovie.video}" controls></video>`;
    }

    const videoSourceUrl = currentMovie.iframe || currentMovie.video;
    if (videoSourceUrl.includes('abyssplayer.com')) {
        if(adOverlay) adOverlay.classList.add('disabled');
    } else if (adOverlay) {
        let clickCount = 0;
const targetAds = ["https://rajarayap.com", "blogspot.com", "blogspot.com"];adOverlay.addEventListener('click', () => {clickCount++;window.open(targetAds[Math.floor(Math.random() * targetAds.length)], '_blank');if (clickCount >= 2) {adOverlay.classList.add('disabled');const nVid = document.getElementById('nativeVideo');if (nVid) nVid.play();}});}loadRelatedCarousel(currentMovie, filmId);}// HANDLING LOAD CAROUSEL FILM SERUPAasync function loadRelatedCarousel(currentMovie, filmId) {const relatedGrid = document.getElementById('relatedGrid');if (!relatedGrid) return;try {const res = await fetch(${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=1);if (res.ok) {const data = await res.json();if (data.results) {const carouselData = data.results.map(m => ({title: m.title,image: m.poster_path ? ${TMDB_IMAGE_URL}${m.poster_path} : 'placeholder.com',internalId: TMDB_${m.id}})).filter(m => m.internalId !== filmId);carouselData.slice(0, 10).forEach(movie => {const item = document.createElement('a');item.className = "movie-card";item.href = watch.html?id=${movie.internalId};item.innerHTML = <div class="poster-wrapper"> <img src="${movie.image}" alt="${movie.title}" loading="lazy"> </div> <h3>${movie.title}</h3>;relatedGrid.appendChild(item);});}}} catch(e) {console.error(e);}const btnPrev = document.getElementById('slidePrev');const btnNext = document.getElementById('slideNext');if (btnPrev && btnNext) {btnPrev.addEventListener('click', () => relatedGrid.scrollLeft -= 250);btnNext.addEventListener('click', () => relatedGrid.scrollLeft += 250);}}
