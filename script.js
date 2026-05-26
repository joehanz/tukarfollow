// CONFIG UTAMA API TMDB
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org';
const TMDB_IMAGE_URL = 'https://tmdb.org'; // Ukuran poster w300 agar loading gambar super cepat!

// GLOBAL DATA ACCUMULATOR
let LOCAL_MOVIES_DATA = [];      
let TMDB_MOVIES_DATA = [];       
let GLOBAL_COMBINED_MOVIES = [];   
let currentTmdbPage = 1;        
let currentSearchKeyword = "";    

// EKSEKUSI UTAMA (Dipicu mutlak saat browser selesai membaca kerangka HTML)
window.addEventListener('DOMContentLoaded', () => {
    initNavbarLayout();
    
    // Handler Khusus Halaman Utama (index.html)
    if (document.getElementById('movieGrid')) {
        executeHomepageSytem();
    }
    
    // Handler Khusus Halaman Pemutar (watch.html)
    if (document.getElementById('playerArea')) {
        executeWatchPageSystem();
    }
});

// ==========================================
//          LOGIKA HALAMAN UTAMA (INDEX)
// ==========================================

async function executeHomepageSytem() {
    // 1. Ambil Postingan Manual Anda Terlebih Dahulu (Jalur Terisolasi & Tercepat)
    try {
        const response = await fetch('movies.json');
        if (response.ok) {
            const parseData = await response.json();
            LOCAL_MOVIES_DATA = parseData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
            
            // Langsung pasang ke database global website
            GLOBAL_COMBINED_MOVIES = [...LOCAL_MOVIES_DATA];
            printMoviesToGrid(GLOBAL_COMBINED_MOVIES);
        }
    } catch (err) {
        console.error("Gagal sinkronisasi file lokal movies.json:", err);
    }

    // Hapus teks memuat film secara paksa agar halaman kebal dari efek stuck blank
    clearGridLoadingStatus();

    // 2. Tarik Suplemen Film Indonesia dari TMDB (Halaman Awal - Isi 20 Film)
    await pullIndonesianMoviesFromTMDB(currentTmdbPage);
    
    // 3. Buat Tombol Pagination Manual (Jauh lebih aman untuk RAM browser daripada scroll otomatis)
    injectPaginationButton();
}

async function pullIndonesianMoviesFromTMDB(pageNumber) {
    try {
        const urlRequest = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&page=${pageNumber}`;
        const res = await fetch(urlRequest);
        
        if (res.ok) {
            const jsonResult = await res.json();
            if (jsonResult.results && jsonResult.results.length > 0) {
                const cleanMappedData = jsonResult.results.map(movie => ({
                    title: movie.title,
                    image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                    video: "", 
                    iframe: `https://vidsrc.me{movie.id}`, 
                    sinopsis: movie.overview || "Sinopsis untuk film Indonesia ini belum tersedia.",
                    genre: "Indonesia Movie", 
                    release_date: movie.release_date || "2026-01-01",
                    country: "Indonesia",
                    internalId: `TMDB_${movie.id}`
                }));

                // Tumpuk data halaman baru tanpa merusak postingan manual Anda
                TMDB_MOVIES_DATA = [...TMDB_MOVIES_DATA, ...cleanMappedData];
                GLOBAL_COMBINED_MOVIES = [...LOCAL_MOVIES_DATA, ...TMDB_MOVIES_DATA];
                
                printMoviesToGrid(GLOBAL_COMBINED_MOVIES);
            }
        }
    } catch (error) {
        console.error("Server TMDB mengalami kendala interkoneksi jaringan:", error);
        printMoviesToGrid(GLOBAL_COMBINED_MOVIES);
    }
}

function printMoviesToGrid(arrayData) {
    const gridContainer = document.getElementById('movieGrid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = ""; // Bersihkan kontainer murni

    if (!arrayData || arrayData.length === 0) {
        gridContainer.innerHTML = "<div class='loading-text'>Tidak ada koleksi film yang ditemukan.</div>";
        return;
    }

    const fragmentContainer = document.createDocumentFragment();
    arrayData.forEach(movie => {
        const cardAnchor = document.createElement('a');
        cardAnchor.className = "movie-card";
        cardAnchor.href = `watch.html?id=${movie.internalId}`;
        cardAnchor.innerHTML = `
            <div class="poster-wrapper">
                <img src="${movie.image}" alt="${movie.title}" loading="lazy">
            </div>
            <h3>${movie.title}</h3>
        `;
        fragmentContainer.appendChild(cardAnchor);
    });
    gridContainer.appendChild(fragmentContainer);
}

function clearGridLoadingStatus() {
    const grid = document.getElementById('movieGrid');
    if (grid && grid.innerHTML.includes("Memuat film...")) {
        grid.innerHTML = "";
    }
}

function injectPaginationButton() {
    const gridElement = document.getElementById('movieGrid');
    if (!gridElement) return;

    // Cek jika tombol sudah terpasang agar tidak duplikat
    if (document.getElementById('loadMoreTmdbBtn')) return;

    const btnWrapper = document.createElement('div');
    btnWrapper.style.cssText = "grid-column: 1/-1; text-align: center; margin-top: 30px; margin-bottom: 20px;";
    
    const actionBtn = document.createElement('button');
    actionBtn.id = "loadMoreTmdbBtn";
    actionBtn.innerText = "Muat Lebih Banyak Film ▾";
    actionBtn.style.cssText = "background-color: #0084ff; color: white; border: none; padding: 12px 28px; font-size: 15px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.2s;";
    
    actionBtn.addEventListener('click', async () => {
        actionBtn.innerText = "Menghubungkan Server...";
        actionBtn.disabled = true;
        currentTmdbPage++;
        await pullIndonesianMoviesFromTMDB(currentTmdbPage);
        actionBtn.innerText = "Muat Lebih Banyak Film ▾";
        actionBtn.disabled = false;
    });

    btnWrapper.appendChild(actionBtn);
    gridElement.after(btnWrapper);
}

// ==========================================
//          LOGIKA HALAMAN WATCH (NONTON)
// ==========================================

async function executeWatchPageSystem() {
    const urlSearchQuery = new URLSearchParams(window.location.search);
    const targetFilmId = urlSearchQuery.get('id');
    
    if (!targetFilmId) {
        killWatchLoadingText("Akses Terblokir: Parameter ID Tidak Valid");
        return;
    }

    let resolvedMovieObject = null;

    // Skenario A: Mengurai Jika ID Merupakan Postingan Manual Anda
    if (targetFilmId.startsWith('LOCAL_')) {
        try {
            const fetchLocalRes = await fetch('movies.json');
            if (fetchLocalRes.ok) {
                const localArray = await fetchLocalRes.json();
                const processedLocal = localArray.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
                resolvedMovieObject = processedLocal.find(m => m.internalId === targetFilmId);
            }
        } catch (e) { console.error(e); }
    } 
    // Skenario B: Mengurai Jika ID Merupakan Koleksi Otomatis Server TMDB
    else if (targetFilmId.startsWith('TMDB_')) {
        const rawId = targetFilmId.replace('TMDB_', '');
        try {
            const fetchTmdbRes = await fetch(`${TMDB_BASE_URL}/movie/${rawId}?api_key=${TMDB_API_KEY}`);
            if (fetchTmdbRes.ok) {
                const apiData = await fetchTmdbRes.json();
                resolvedMovieObject = {
                    title: apiData.title,
                    image: apiData.poster_path ? `${TMDB_IMAGE_URL}${apiData.poster_path}` : 'https://placeholder.com',
                    video: "", 
                    iframe: `https://vidsrc.me{apiData.id}`,
                    sinopsis: apiData.overview || "Ulasan deskripsi sinopsis untuk film ini belum diterbitkan resmi.",
                    genre: "Indonesia Movie", 
                    release_date: apiData.release_date || "Unknown Release",
                    country: "Indonesia", 
                    internalId: targetFilmId
                };
            }
        } catch (e) { console.error(e); }
    }

    // Penyuntikan Data ke Struktur Halaman Nonton
    if (resolvedMovieObject) {
        if(document.getElementById('watchTitle')) document.getElementById('watchTitle').innerText = resolvedMovieObject.title;
        if(document.getElementById('watchGenre')) document.getElementById('watchGenre').innerText = resolvedMovieObject.genre;
        if(document.getElementById('watchRelease')) document.getElementById('watchRelease').innerText = resolvedMovieObject.release_date;
        if(document.getElementById('watchCountry')) document.getElementById('watchCountry').innerText = resolvedMovieObject.country;
        if(document.getElementById('watchSinopsis')) document.getElementById('watchSinopsis').innerText = resolvedMovieObject.sinopsis;

        const playerBox = document.getElementById('videoContainer');
        const overlayAds = document.getElementById('adOverlay');
        
        if (playerBox) {
            if (resolvedMovieObject.iframe) {
                // PERBAIKAN FATAL: Menambahkan properti penangkal blokir kebijakan 'Refused to Connect'
                playerBox.innerHTML = `<iframe src="${resolvedMovieObject.iframe}" allowfullscreen referrerpolicy="origin" sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"></iframe>`;
            } else if (resolvedMovieObject.video) {
                playerBox.innerHTML = `<video id="nativeVideo" src="${resolvedMovieObject.video}" controls></video>`;
            }
        }

        // Jalankan Operasi Script Pengaman Klik Iklan 2x
        const currentSourceString = resolvedMovieObject.iframe || resolvedMovieObject.video;
if (currentSourceString && currentSourceString.includes('abyssplayer.com')) {if(overlayAds) overlayAds.classList.add('disabled');} else if (overlayAds) {let registrationClicks = 0;const linkAdsPool = ["https://rajarayap.com", "blogspot.com", "blogspot.com"];overlayAds.addEventListener('click', () => {registrationClicks++;window.open(linkAdsPool[Math.floor(Math.random() * linkAdsPool.length)], '_blank');if (registrationClicks >= 2) {overlayAds.classList.add('disabled');const html5Video = document.getElementById('nativeVideo');if (html5Video) html5Video.play();}});}// Bangun Slider Rekomendasi Horizontal TerkaitbuildWatchCarouselLayout(targetFilmId);} else {killWatchLoadingText("Koneksi Timeout: Server Gagal Merespons.");}}function killWatchLoadingText(infoText) {const t = document.getElementById('watchTitle');const s = document.getElementById('watchSinopsis');if (t) t.innerText = infoText;if (s) s.innerText = "Saluran pemutar gagal diverifikasi. Pastikan koneksi internet Anda stabil lalu kembali ke beranda.";}async function buildWatchCarouselLayout(currentActiveId) {const sliderContainerGrid = document.getElementById('relatedGrid');if (!sliderContainerGrid) return;try {const res = await fetch(${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=1);if (res.ok) {const parsedCarousel = await res.json();if (parsedCarousel.results) {sliderContainerGrid.innerHTML = "";const clearedList = parsedCarousel.results.map(m => ({title: m.title,image: m.poster_path ? ${TMDB_IMAGE_URL}${m.poster_path} : 'placeholder.com',internalId: TMDB_${m.id}})).filter(m => m.internalId !== currentActiveId);clearedList.slice(0, 10).forEach(movie => {const blockAnchor = document.createElement('a');blockAnchor.className = "movie-card";blockAnchor.href = watch.html?id=${movie.internalId};blockAnchor.innerHTML = <div class="poster-wrapper"> <img src="${movie.image}" alt="${movie.title}" loading="lazy"> </div> <h3>${movie.title}</h3>;sliderContainerGrid.appendChild(blockAnchor);});}}} catch(err) { console.error(err); }const arrowLeft = document.getElementById('slidePrev');const arrowRight = document.getElementById('slideNext');if (arrowLeft && arrowRight) {arrowLeft.addEventListener('click', () => sliderContainerGrid.scrollLeft -= 250);arrowRight.addEventListener('click', () => sliderContainerGrid.scrollLeft += 250);}}// ==========================================//          NAVBAR & PANEL LIVE SEARCH// ==========================================function initNavbarLayout() {const triggerBurger = document.getElementById('burgerBtn');const panelMenu = document.getElementById('navMenu');if (triggerBurger && panelMenu) {triggerBurger.addEventListener('click', () => {triggerBurger.classList.toggle('open');panelMenu.classList.toggle('open');});}document.querySelectorAll('.dropbtn').forEach(btn => {btn.addEventListener('click', () => {if (window.innerWidth <= 768) {const subMenuPanel = btn.nextElementSibling;if(subMenuPanel) subMenuPanel.classList.toggle('open-mobile');}});});const searchInput = document.getElementById('searchInput');if (searchInput) {searchInput.addEventListener('input', (e) => {currentSearchKeyword = e.target.value.toLowerCase();if (currentSearchKeyword === "") {printMoviesToGrid(GLOBAL_COMBINED_MOVIES);} else {const filteredResults = GLOBAL_COMBINED_MOVIES.filter(m => m.title.toLowerCase().includes(currentSearchKeyword));printMoviesToGrid(filteredResults);}});}document.querySelectorAll('.dropdown-content a').forEach(link => {link.addEventListener('click', (e) => {e.preventDefault();let finalFilterArray = [...GLOBAL_COMBINED_MOVIES];const targetGenreAttr = link.getAttribute('data-genre');const targetYearAttr = link.getAttribute('data-year');const headerTitleLabel = document.getElementById('sectionTitle');if (targetGenreAttr) {if(headerTitleLabel) headerTitleLabel.innerText = Genre: ${targetGenreAttr};finalFilterArray = GLOBAL_COMBINED_MOVIES.filter(m => m.genre && m.genre.toLowerCase().includes(targetGenreAttr.toLowerCase()));} else if (targetYearAttr) {if(headerTitleLabel) headerTitleLabel.innerText = Tahun Rilis: ${targetYearAttr === 'klasik' ? 'Klasik (<2024)' : targetYearAttr};finalFilterArray = GLOBAL_COMBINED_MOVIES.filter(m => {if(!m.release_date) return false;const parsedExtractYear = new Date(m.release_date).getFullYear();return targetYearAttr === 'klasik' ? parsedExtractYear < 2024 : parsedExtractYear === parseInt(targetYearAttr);});}printMoviesToGrid(finalFilterArray);if(panelMenu && triggerBurger) {panelMenu.classList.remove('open');triggerBurger.classList.remove('open');}});});}
