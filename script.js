const API_KEY = 'c000d7b8b0f5ee16b98b6103009745d8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w780';

const MOVIES_JSON_PATH = 'movies.json';
const VSEMBED_URL = 'https://vsembed.com/player.html';

const feedContainer = document.getElementById('feedContainer');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const infoPanel = document.getElementById('infoPanel');
const panelContentArea = document.getElementById('panelContentArea');
const videoPlayerContainer = document.getElementById('videoPlayerContainer');
const playerArea = document.getElementById('playerArea');

let moviesData = [];
let activeMovieIndex = 0;
let currentPage = 1;
let currentActiveSection = null; 
let isDesktop = false;
let playerTerbuka = false;
let idFilmAktif = null;
let playerAltBtn = null;

// ==============================================
// 📱 Deteksi Perangkat
// ==============================================
function detectDevice() {
    isDesktop = window.innerWidth >= 1024;
    const arrows = document.querySelectorAll('.arrow-actions-container');
    arrows.forEach(arrow => {
        if (arrow) arrow.style.display = isDesktop ? 'flex' : 'none';
    });
}

// ==============================================
// 🚀 Selebaran Promosi
// ==============================================
function initPromoNotifier() {
  const notifier = document.getElementById('desktopNotifier');
  const promoCard = document.getElementById('promoCard');
  const promoTitle = document.getElementById('promoTitle');
  const promoCountry = document.getElementById('promoCountry');
  const promoGenres = document.getElementById('promoGenres');
  const promoSinopsis = document.getElementById('promoSinopsis');
  const promoWatchBtn = document.getElementById('promoWatchBtn');

  if (!notifier || !promoCard) return;

  let latestMovie = {
    title: "Avatar: The Way of Water",
    country: "US",
    release_date: "2022-12-16",
    sinopsis: "Jake Sully tinggal bersama keluarga barunya di planet Pandora...",
    genre: ["Aksi", "Fiksi Ilmiah"],
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000",
    tmdb_id: 76600
  };

  fetch(MOVIES_JSON_PATH)
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(movies => {
      if (Array.isArray(movies) && movies.length > 0) latestMovie = movies[0];
      tampilkanFlyer();
    })
    .catch(() => tampilkanFlyer());

  function tampilkanFlyer() {
    if (latestMovie.image) promoCard.style.backgroundImage = `url('${latestMovie.image}')`;
    if (promoTitle) promoTitle.textContent = latestMovie.title || 'Judul Film';
    if (promoCountry) {
      const tahun = latestMovie.release_date ? latestMovie.release_date.split('-')[0] : '';
      promoCountry.textContent = `${latestMovie.country || 'Unknown'} • ${tahun}`;
    }
    if (promoSinopsis) promoSinopsis.textContent = latestMovie.sinopsis || 'Tidak ada sinopsis.';
    if (promoGenres && latestMovie.genre) {
      promoGenres.innerHTML = '';
      latestMovie.genre.forEach(g => {
        const span = document.createElement('span');
        span.textContent = g;
        promoGenres.appendChild(span);
      });
    }
    if (promoWatchBtn) {
      promoWatchBtn.onclick = () => {
        closeNotifier();
        const id = latestMovie.tmdb_id || latestMovie.id;
        id ? playMovie(id) : (latestMovie.iframe && (videoPlayerContainer.style.display = 'block', playerArea.innerHTML = `<iframe src="${latestMovie.iframe}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`));
      };
    }
    notifier.style.cssText = 'display:flex !important; position:fixed !important; z-index:99999 !important; opacity:1;';
    if (window.lucide) lucide.createIcons();
  }
}

function closeNotifier() {
  const notifier = document.getElementById('desktopNotifier');
  if (notifier) {
    notifier.style.opacity = '0';
    setTimeout(() => notifier.style.display = 'none', 300);
  }
}

// ==============================================
// 🎯 Gulir Daftar Film
// ==============================================
function scrollFeed(direction) {
    if (!feedContainer) return;
    feedContainer.scrollBy({ top: direction === 'down' ? window.innerHeight : -window.innerHeight, behavior: 'smooth' });
}

// ==============================================
// 🎬 Ambil Data TMDB
// ==============================================
async function fetchMovies(page = 1) {
    try {
        const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=${page}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        moviesData = page === 1 ? data.results : [...moviesData, ...data.results];
        renderFeed(moviesData);
    } catch {
        loadFallbackData();
    }
}

function loadFallbackData() {
    const fallback = [
        { id: 726888, title: 'Heartbeast', overview: 'Elina, rapper Finlandia...', release_date: '2022-11-04', poster_path: '', origin_country: ['FI'] },
        { id: 157336, title: 'Interstellar', overview: 'Sekelompok penjelajah melintasi lubang cacing...', release_date: '2014-11-05', poster_path: '/gEU2Qv0vHB77Yp7v6v94goI86v3.jpg', origin_country: ['US'] }
    ];
    moviesData = moviesData.length ? [...moviesData, ...fallback] : fallback;
    renderFeed(moviesData);
}

// ==============================================
// 🖼️ Tampilkan Daftar Film
// ==============================================
function renderFeed(movies) {
    if (!feedContainer) return;
    feedContainer.innerHTML = '';
    movies.forEach((movie, index) => {
        const posterUrl = movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500';
        const year = movie.release_date ? movie.release_date.split('-')[0] : '-';
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.backgroundImage = `url('${posterUrl}')`;
        card.innerHTML = `
            <div class="overlay"></div>
            <div class="top-title">${movie.title}</div>
            <div class="play-btn-container" onclick="playMovie(${movie.id})">
                <div class="play-circle"><i data-lucide="play" fill="#fff" size="32"></i></div>
            </div>
            <div class="main-content">
                <div class="side-actions">
                    <div class="arrow-actions-container" style="display: ${isDesktop ? 'flex' : 'none'};">
                        <div class="inline-scroll-arrow" onclick="scrollFeed('up')"><i data-lucide="chevron-up" size="22"></i></div>
                        <div class="inline-scroll-arrow" onclick="scrollFeed('down')"><i data-lucide="chevron-down" size="22"></i></div>
                    </div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'info')"><i data-lucide="info" size="28"></i><span>Info</span></div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'release')"><i data-lucide="calendar" size="28"></i><span>${year}</span></div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'genre')"><i data-lucide="clapperboard" size="28"></i><span>Genre</span></div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'country')"><i data-lucide="globe" size="28"></i><span>Negara</span></div>
                </div>
            </div>
        `;
        feedContainer.appendChild(card);
    });
    const lastCard = feedContainer.lastChild;
    if (lastCard) {
        const loadMore = document.createElement('div');
        loadMore.className = 'inline-load-more';
        loadMore.innerHTML = `<button class="load-more-btn-inline" onclick="loadNextPage()"><i data-lucide="plus" size="16"></i> Muat Lebih Banyak</button>`;
        lastCard.querySelector('.main-content')?.appendChild(loadMore);
    }
    if (window.lucide) lucide.createIcons();
}

function loadNextPage() {
    currentPage++;
    fetchMovies(currentPage);
}

// ==============================================
// ℹ️ Panel Info
// ==============================================
async function toggleSection(event, index, section) {
    event.stopPropagation();
    if (!infoPanel || !panelContentArea) return;
    const movie = moviesData[index];
    if (!movie) return;
    if (infoPanel.classList.contains('show') && currentActiveSection === section) {
        infoPanel.classList.remove('show');
        currentActiveSection = null;
        return;
    }
    currentActiveSection = section;
    panelContentArea.innerHTML = '<div style="padding:20px; color:#fff;">Memuat...</div>';
    infoPanel.classList.add('show');
    try {
        const res = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=id-ID`);
        const detail = await res.json();
        const genreMap = {28:'Aksi',12:'Petualangan',16:'Animasi',35:'Komedi',80:'Kejahatan',99:'Dokumenter',18:'Drama',10751:'Keluarga',14:'Fantasi',36:'Sejarah',27:'Horor',10402:'Musik',9648:'Misteri',10749:'Romantis',878:'Fiksi Ilmiah',53:'Thriller',10752:'Perang',37:'Barat'};
        const negaraMap = {'US':'Amerika Serikat','FI':'Finlandia','KR':'Korea Selatan','JP':'Jepang','ID':'Indonesia','GB':'Inggris','FR':'Prancis','CN':'Cina','HK':'Hong Kong','TH':'Thailand','IN':'India'};
        let html = '';
        switch(section) {
            case 'info': html = `<p style="line-height:1.7; color:#fff;">${detail.overview || movie.overview || 'Tidak ada sinopsis.'}</p>`; break;
            case 'release': html = `<p style="color:#fff;"><strong>Tanggal Rilis:</strong><br>${detail.release_date || movie.release_date || 'Tidak diketahui'}</p>`; break;
            case 'genre': const genres = detail.genres?.map(g=>g.name) || movie.genre_ids?.map(id=>genreMap[id]||'Lainnya'); html = `<p style="color:#fff;"><strong>Genre:</strong><br>${genres.join(', ')||'Tidak ditentukan'}</p>`; break;
            case 'country': const countries = detail.production_countries?.map(c=>c.name) || movie.origin_country?.map(c=>negaraMap[c]||c); html = `<p style="color:#fff;"><strong>Negara:</strong><br>${countries.join(', ')||'Tidak ditentukan'}</p>`; break;
        }
        panelContentArea.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    } catch {
        panelContentArea.innerHTML = '<p style="color:#ff6b6b;">Gagal memuat detail.</p>';
    }
}

// ==============================================
// 🔍 Cek Film & Kontrol Tombol
// ==============================================
async function playMovie(tmdbId) {
    if (!tmdbId) return;
    idFilmAktif = tmdbId;
    try {
        const res = await fetch(MOVIES_JSON_PATH);
        if (!res.ok) throw new Error();
        const daftar = await res.json();
        const ketemu = daftar.find(f => f.tmdb_id && (String(f.tmdb_id).trim() === String(tmdbId).trim() || Number(f.tmdb_id) === Number(tmdbId)));
        if (ketemu) {
            if (playerAltBtn) playerAltBtn.style.display = 'flex';
            const judul = encodeURIComponent((ketemu.title || ketemu.judul || 'film').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''));
            window.location.href = `watch.html?id=${tmdbId}&title=${judul}`;
        } else {
            if (playerAltBtn) playerAltBtn.style.display = 'none';
            window.location.href = `watch.html?id=${tmdbId}&title=mdmax`;
        }
    } catch {
        if (playerAltBtn) playerAltBtn.style.display = 'none';
        window.location.href = `watch.html?id=${tmdbId}&title=mdmax`;
    }
}

// ==============================================
// 🎬 Buka/Tutup Pemutar
// ==============================================
function bukaVsEmbed(id) {
    if (!videoPlayerContainer || !playerArea) return;
    videoPlayerContainer.style.display = 'block';
    videoPlayerContainer.style.position = 'relative';
    playerArea.innerHTML = `<iframe src="${VSEMBED_URL}?tmdb=${id}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
    playerTerbuka = true;
}
function tutupPemutar() {
    if (!videoPlayerContainer || !playerArea) return;
    videoPlayerContainer.style.display = 'none';
    playerArea.innerHTML = '';
    playerTerbuka = false;
}

// ==============================================
// ⌨️ Pencarian
// ==============================================
let searchLayer = document.getElementById('searchResultsLayer');
if (!searchLayer) {
    searchLayer = document.createElement('div');
    searchLayer.id = 'searchResultsLayer';
    searchLayer.className = 'search-results-layer';
    searchLayer.innerHTML = `<div class="search-header"><h4>Hasil Pencarian</h4><button class="close-search" onclick="tutupCari()"><i data-lucide="x" size="20"></i></button></div><div class="search-content" id="searchContent"></div>`;
    document.body.appendChild(searchLayer);
}
function tutupCari() { searchLayer.classList.remove('active'); searchInput && (searchInput.value = ''); }
async function cariFilm(kata) {
    if (!kata || kata.length < 2) return;
    const konten = document.getElementById('searchContent');
    konten.innerHTML = '<div style="padding:30px; color:#fff; text-align:center;">Mencari...</div>';
    searchLayer.classList.add('active');
    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=id-ID&query=${encodeURIComponent(kata)}&page=1&include_adult=false`);
        const data = await res.json();
        konten.innerHTML = data.results?.map(m => `
            <div class="search-item-row" onclick="playMovie(${m.id})">
                <div class="search-item-thumb" style="background:url('${m.poster_path?IMAGE_URL+m.poster_path:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'}') center/cover"></div>
                <div class="search-item-info"><h4>${m.title}</h4><p>${m.release_date?.split('-')[0]||'-'}</p><p style="font-size:12px; opacity:0.7;">${m.overview?.substring(0,80)+'...'||'Tidak ada sinopsis'}</p></div>
            </div>
        `).join('') || '<div style="padding:40px; color:#aaa; text-align:center;">Tidak ada hasil</div>';
        if (window.lucide) lucide.createIcons();
    } catch {
        konten.innerHTML = '<div style="padding:40px; color:#ff6b6b; text-align:center;">Gagal terhubung</div>';
    }
}
searchInput?.addEventListener('keydown', e => e.key==='Enter' && (e.preventDefault(), cariFilm(searchInput.value.trim())));

// ==============================================
// 🧭 Navigasi & Buat Tombol Player Alt PASTI TAMPIL
// ==============================================
const navSearch = document.getElementById('navSearch');
const navHome = document.getElementById('navHome');

function buatTombolPlayerAlt() {
    const nav = document.querySelector('nav') || navSearch?.parentNode;
    if (!nav) return console.warn('Navigasi tidak ditemukan!');
    nav.style.position = 'relative';
    playerAltBtn = document.getElementById('playerAltBtn');
    if (!playerAltBtn) {
        const wadahTengah = document.createElement('div');
        wadahTengah.style.cssText = 'position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:2px; z-index:999;';
        playerAltBtn = document.createElement('button');
        playerAltBtn.id = 'playerAltBtn';
        playerAltBtn.style.cssText = 'background:transparent; border:none; color:inherit; cursor:pointer; display:none; flex-direction:column; align-items:center; padding:6px;';
        playerAltBtn.innerHTML = `<i data-lucide="camera" size="24"></i><span style="font-size:11px; opacity:0.9; white-space:nowrap;">Player Alt</span>`;
        playerAltBtn.onclick = () => idFilmAktif && (playerTerbuka ? tutupPemutar() : bukaVsEmbed(idFilmAktif));
        wadahTengah.appendChild(playerAltBtn);
        nav.appendChild(wadahTengah);
    }
    if (window.lucide) lucide.createIcons();
}

navSearch?.addEventListener('click', e => {
    e.stopPropagation();
    if (!searchContainer) return;
    searchContainer.classList.toggle('show');
    searchContainer.classList.contains('show') ? setTimeout(()=>searchInput?.focus(),100) : tutupCari();
});
navHome?.addEventListener('click', () => {
    searchInput && (searchInput.value = ''); tutupCari(); searchContainer?.classList.remove('show'); feedContainer && (feedContainer.scrollTop = 0);
});
feedContainer?.addEventListener('scroll', () => {
    const idx = Math.round(feedContainer.scrollTop / window.innerHeight);
    idx !== activeMovieIndex && (activeMovieIndex = idx, infoPanel?.classList.remove('show'), currentActiveSection = null);
});

// ==============================================
// 📦 Logika Instal PWA
// ==============================================
let deferredPrompt;
const installBtn = document.getElementById('installPwaBtn');

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'flex';
    if (playerAltBtn) playerAltBtn.style.display = 'none';
});
installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    outcome === 'accepted' && console.log('PWA diinstal');
    deferredPrompt = null;
});
window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installBtn) installBtn.style.display = 'none';
    if (playerAltBtn) playerAltBtn.style.display = 'flex';
    console.log('Aplikasi terpasang, tombol diganti');
    if (window.lucide) lucide.createIcons();
});

// ==============================================
// 🚀 Jalankan Semua
// ==============================================
window.addEventListener('DOMContentLoaded', () => {
    detectDevice();
    buatTombolPlayerAlt(); // Pasti dibuat duluan
});
window.addEventListener('load', () => {
    fetchMovies();
    setTimeout(initPromoNotifier, 400);
});
window.addEventListener('resize', detectDevice);
typeof lucide !== 'undefined' && lucide.createIcons();
