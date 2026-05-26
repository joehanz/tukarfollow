// CONFIG UTAMA API WATCH
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org';
const TMDB_IMAGE_URL = 'https://tmdb.org'; 

// JALANKAN SAAT HALAMAN SELESAI DI-LOAD
window.addEventListener('DOMContentLoaded', () => {
    const triggerBurger = document.getElementById('burgerBtn');
    const panelMenu = document.getElementById('navMenu');
    if (triggerBurger && panelMenu) {
        triggerBurger.addEventListener('click', () => {
            triggerBurger.classList.toggle('open');
            panelMenu.classList.toggle('open');
        });
    }
    executeWatchPageSystem();
});

async function executeWatchPageSystem() {
    const urlSearchQuery = new URLSearchParams(window.location.search);
    const targetFilmId = urlSearchQuery.get('id');
    if (!targetFilmId) return;

    let resolvedMovieObject = null;

    // AMBIL DATA LOKAL JIKA ID LOCAL
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
    // AMBIL DATA TMDB JIKA ID TMDB
    else if (targetFilmId.startsWith('TMDB_')) {
        const rawId = targetFilmId.replace('TMDB_', '');
        try {
            const fetchTmdbRes = await fetch(`${TMDB_BASE_URL}/movie/${rawId}?api_key=${TMDB_API_KEY}`);
            if (fetchTmdbRes.ok) {
                const apiData = await fetchTmdbRes.json();
                resolvedMovieObject = {
                    title: apiData.title,
                    // Menggunakan vidsrc.me untuk mengamankan link dari proteksi frame-refused di Github Pages
                    iframe: `https://vidsrc.me{apiData.id}`,
                    sinopsis: apiData.overview || "Sinopsis deskripsi belum tersedia resmi.",
                    genre: "Indonesia Movie", 
                    release_date: apiData.release_date || "Unknown", 
                    country: "Indonesia"
                };
            }
        } catch (e) { console.error(e); }
    }

    // CETAK DATA KE HALAMAN NONTON
    if (resolvedMovieObject) {
        document.getElementById('watchTitle').innerText = resolvedMovieObject.title;
        document.getElementById('watchGenre').innerText = resolvedMovieObject.genre;
        document.getElementById('watchRelease').innerText = resolvedMovieObject.release_date;
        document.getElementById('watchCountry').innerText = resolvedMovieObject.country;
        document.getElementById('watchSinopsis').innerText = resolvedMovieObject.sinopsis;

        const playerBox = document.getElementById('videoContainer');
        const overlayAds = document.getElementById('adOverlay');
        
        if (playerBox) {
            if (resolvedMovieObject.iframe) {
                playerBox.innerHTML = `<iframe src="${resolvedMovieObject.iframe}" allowfullscreen referrerpolicy="origin" sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"></iframe>`;
            } else if (resolvedMovieObject.video) {
                playerBox.innerHTML = `<video id="nativeVideo" src="${resolvedMovieObject.video}" controls></video>`;
            }
        }

        // LOGIKA PENANGANAN KLIK IKLAN RANDOM 2X
        const currentSourceString = resolvedMovieObject.iframe || resolvedMovieObject.video;
        if (currentSourceString && currentSourceString.includes('abyssplayer.com')) {
            if(overlayAds) overlayAds.classList.add('disabled');
        } else if (overlayAds) {
            let registrationClicks = 0;
            const linkAdsPool = ["https://rajarayap.com", "https://blogspot.com", "https://blogspot.com"];
            overlayAds.addEventListener('click', () => {
                registrationClicks++;
                window.open(linkAdsPool[Math.floor(Math.random() * linkAdsPool.length)], '_blank');
                if (registrationClicks >= 2) {
                    overlayAds.classList.add('disabled');
                    const html5Video = document.getElementById('nativeVideo');
                    if (html5Video) html5Video.play();
                }
            });
        }
        buildWatchCarouselLayout(targetFilmId);
    }
}

async function buildWatchCarouselLayout(currentActiveId) {
    const sliderContainerGrid = document.getElementById('relatedGrid');
    if (!sliderContainerGrid) return;

    try {
        const res = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=1`);
        if (res.ok) {
            const parsedCarousel = await res.json();
            if (parsedCarousel.results) {
                sliderContainerGrid.innerHTML = ""; 
                parsedCarousel.results.slice(0, 10).forEach(movie => {
                    const blockAnchor = document.createElement('a');
                    blockAnchor.className = "movie-card";
                    blockAnchor.href = `watch.html?id=TMDB_${movie.id}`;
                    blockAnchor.innerHTML = `<div class="poster-wrapper"><img src="${TMDB_IMAGE_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy"></div><h3>${movie.title}</h3>`;
                    sliderContainerGrid.appendChild(blockAnchor);
                });
            }
        }
    } catch(err) { console.error(err); }
}
