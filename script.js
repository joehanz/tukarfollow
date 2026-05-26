const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org';
const TMDB_IMAGE_URL = 'https://tmdb.org';

let LOCAL_MOVIES = [], ALL_RENDERED_MOVIES = [];
let currentPage = 1, isLoading = false, currentKeyword = "";

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    if (document.getElementById('movieGrid')) startStreamingPlatform();
    if (document.getElementById('playerArea')) initWatchPage();
});

async function startStreamingPlatform() {
    try {
        const res = await fetch('movies.json');
        const data = await res.json();
        LOCAL_MOVIES = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
    } catch (e) { console.error("Gagal baca movies.json", e); }

    await loadMoreTMDBMovies(currentPage);

    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 600) {
            if (!isLoading && currentKeyword === "") { 
                currentPage++;
                loadMoreTMDBMovies(currentPage);
            }
        }
    });
}

async function loadMoreTMDBMovies(page) {
    isLoading = true;
    const today = new Date().toISOString().split('T')[0];
    try {
        const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&release_date.lte=${today}&page=${page}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const mappedTMDB = data.results.map(movie => ({
                title: movie.title,
                image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                video: "", iframe: `https://vidsrc.to{movie.id}`, 
                sinopsis: movie.overview || "Sinopsis belum tersedia.",
                genre: "Indonesia Movie", release_date: movie.release_date || "0000-00-00",
                country: "Indonesia", internalId: `TMDB_${movie.id}`
            }));
            ALL_RENDERED_MOVIES = page === 1 ? [...LOCAL_MOVIES, ...mappedTMDB] : [...ALL_RENDERED_MOVIES, ...mappedTMDB];
            renderGrid(ALL_RENDERED_MOVIES);
        }
    } catch (e) { console.error("TMDB Error", e); } finally { isLoading = false; }
}

function renderGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    if (moviesList.length === 0 && currentPage === 1) {
        grid.innerHTML = "<div class='loading-text'>Tidak ada film ditemukan.</div>"; return;
    }
    if (currentPage === 1 && currentKeyword === "") grid.innerHTML = "";
    else if (currentKeyword !== "") grid.innerHTML = "";

    const documentFragment = document.createDocumentFragment();
    moviesList.forEach(movie => {
        if (!grid.querySelector(`[data-id="${movie.internalId}"]`)) {
            const card = document.createElement('a');
            card.className = "movie-card"; card.href = `watch.html?id=${movie.internalId}`;
            card.setAttribute('data-id', movie.internalId);
            card.innerHTML = `<div class="poster-wrapper"><img src="${movie.image}" alt="${movie.title}" loading="lazy"></div><h3>${movie.title}</h3>`;
            documentFragment.appendChild(card);
        }
    });
    grid.appendChild(documentFragment);
}
function initNavbar() {
    const burgerBtn = document.getElementById('burgerBtn'), navMenu = document.getElementById('navMenu');
    if (burgerBtn) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('open'); navMenu.classList.toggle('open');
        });
    }
    document.querySelectorAll('.dropbtn').forEach(btn => {
        btn.addEventListener('click', () => { if (window.innerWidth <= 768) btn.nextElementSibling.classList.toggle('open-mobile'); });
    });
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentKeyword = e.target.value.toLowerCase();
            renderGrid(currentKeyword === "" ? ALL_RENDERED_MOVIES : ALL_RENDERED_MOVIES.filter(m => m.title.toLowerCase().includes(currentKeyword)));
        });
    }
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); let filtered = [...ALL_RENDERED_MOVIES];
            const genre = link.getAttribute('data-genre'), year = link.getAttribute('data-year');
            if (genre) {
                document.getElementById('sectionTitle').innerText = `Genre: ${genre}`;
                filtered = ALL_RENDERED_MOVIES.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
            } else if (year) {
                document.getElementById('sectionTitle').innerText = `Tahun Rilis: ${year === 'klasik' ? 'Klasik (<2024)' : year}`;
                filtered = ALL_RENDERED_MOVIES.filter(m => {
                    const rYear = new Date(m.release_date).getFullYear();
                    return year === 'klasik' ? rYear < 2024 : rYear === parseInt(year);
                });
            }
            renderGrid(filtered);
            if(navMenu) { navMenu.classList.remove('open'); if(burgerBtn) burgerBtn.classList.remove('open'); }
        });
    });
}

async function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search), filmId = urlParams.get('id');
    if (!filmId) return;
    let localData = [];
    try { const res = await fetch('movies.json'); localData = await res.json(); } catch(e){}
    localData = localData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
    let currentMovie = localData.find(m => m.internalId === filmId);

    if (!currentMovie && filmId.startsWith('TMDB_')) {
        const tmdbId = filmId.replace('TMDB_', '');
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
            const movie = await res.json();
            currentMovie = {
                title: movie.title, image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                video: "", iframe: `https://vidsrc.to{movie.id}`,
                sinopsis: movie.overview || "Sinopsis belum tersedia.", genre: "Indonesia Movie",
                release_date: movie.release_date, country: "Indonesia", internalId: filmId
            };
        } catch(e){}
    }
    if (!currentMovie) return;

    document.getElementById('watchTitle').innerText = currentMovie.title;
    document.getElementById('watchGenre').innerText = currentMovie.genre;
    document.getElementById('watchRelease').innerText = currentMovie.release_date;
    document.getElementById('watchCountry').innerText = currentMovie.country;
    document.getElementById('watchSinopsis').innerText = currentMovie.sinopsis;

    const container = document.getElementById('videoContainer'), adOverlay = document.getElementById('adOverlay');
    if (currentMovie.iframe) container.innerHTML = `<iframe src="${currentMovie.iframe}" allowfullscreen></iframe>`;
    else if (currentMovie.video) container.innerHTML = `<video id="nativeVideo" src="${currentMovie.video}" controls></video>`;

    if ((currentMovie.iframe || currentMovie.video).includes('abyssplayer.com')) adOverlay.classList.add('disabled');
    else {
        let clickCount = 0; const targetAds = ["https://rajarayap.com", "https://blogspot.com", "https://blogspot.com"];
        adOverlay.addEventListener('click', () => {
            clickCount++; window.open(targetAds[Math.floor(Math.random() * targetAds.length)], '_blank');
            if (clickCount >= 2) { adOverlay.classList.add('disabled'); const nVid = document.getElementById('nativeVideo'); if (nVid) nVid.play(); }
        });
    }
    loadRelatedCarousel(currentMovie, filmId);
}

async function loadRelatedCarousel(currentMovie, filmId) {
    const relatedGrid = document.getElementById('relatedGrid'); if (!relatedGrid) return;
    if(ALL_RENDERED_MOVIES.length === 0) {
        try {
            const res = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=1`);
            const data = await res.json();
            if(data.results) ALL_RENDERED_MOVIES = data.results.map(m => ({ title: m.title, image: m.poster_path ? `${TMDB_IMAGE_URL}${m.poster_path}` : 'https://placeholder.com', iframe: `https://vidsrc.to{m.id}`, genre: "Indonesia Movie", internalId: `TMDB_${m.id}` }));
        } catch(e){}
    }
    ALL_RENDERED_MOVIES.filter(m => m.internalId !== filmId).slice(0, 10).forEach(movie => {
        const item = document.createElement('a'); item.className = "movie-card"; item.href = `watch.html?id=${movie.internalId}`;
        item.innerHTML = `<div class="poster-wrapper"><img src="${movie.image}" alt="${movie.title}" loading="lazy"></div><h3>${movie.title}</h3>`;
        relatedGrid.appendChild(item);
    });
    const btnPrev = document.getElementById('slidePrev'), btnNext = document.getElementById('slideNext');
    if (btnPrev && btnNext) { btnPrev.addEventListener('click', () => relatedGrid.scrollLeft -= 250); btnNext.addEventListener('click', () => relatedGrid.scrollLeft += 250); }
}
