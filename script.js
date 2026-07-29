const API_KEY = 'c000d7b8b0f5ee16b98b6103009745d8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w780';

// 📁 Alamat file data film kamu
const MOVIES_JSON_PATHS = ['movies.json', 'movies2025.json', 'movies2024.json', 'moviesclassic.json'];

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

// ==============================================
// 📱 Fungsi Deteksi Perangkat
// ==============================================
function detectDevice() {
    isDesktop = window.innerWidth >= 1024;
    const arrows = document.querySelectorAll('.arrow-actions-container');
    arrows.forEach(arrow => {
        if (arrow) arrow.style.display = isDesktop ? 'flex' : 'none';
    });
}

// ==============================================
// 🚀 Modul Selebaran Promosi
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

  // Ambil data dari semua file JSON
  (async () => {
    for (const file of MOVIES_JSON_PATHS) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          const movies = await response.json();
          if (Array.isArray(movies) && movies.length > 0) {
            latestMovie = movies[0];
            break;
          }
        }
      } catch (err) {
        console.warn(`Gagal baca ${file}`, err);
      }
    }
    tampilkanFlyer();
  })();

  function tampilkanFlyer() {
    if (latestMovie.image) promoCard.style.backgroundImage = `url('${latestMovie.image}')`;
    if (promoTitle) promoTitle.textContent = latestMovie.title || 'Judul Film';
    if (promoCountry) {
      const tahun = latestMovie.release_date ? latestMovie.release_date.split('-')[0] : '';
      promoCountry.textContent = `${latestMovie.country || 'Unknown'} • ${tahun}`;
    }
    if (promoSinopsis) promoSinopsis.textContent = latestMovie.sinopsis || 'Tidak ada sinopsis.';
    if (promoGenres) {
      promoGenres.innerHTML = '';
      if (latestMovie.genre && Array.isArray(latestMovie.genre)) {
        latestMovie.genre.forEach(g => {
          const span = document.createElement('span');
          span.textContent = g;
          promoGenres.appendChild(span);
        });
      }
    }
    if (promoWatchBtn) {
      promoWatchBtn.onclick = function() {
        closeNotifier();
        const targetedId = latestMovie.tmdb_id || latestMovie.id;
        if (targetedId) {
           playMovie(targetedId); 
        } else if (latestMovie.iframe) {
           if (videoPlayerContainer && playerArea) {
              videoPlayerContainer.style.display = 'block';
              playerArea.innerHTML = `<iframe src="${latestMovie.iframe}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
           }
        }
      };
    }
    notifier.style.setProperty('display', 'flex', 'important');
    notifier.style.setProperty('position', 'fixed', 'important');
    notifier.style.setProperty('z-index', '99999', 'important');
    notifier.style.opacity = '1';
    if (window.lucide) lucide.createIcons();
  }
}

function closeNotifier() {
  const notifier = document.getElementById('desktopNotifier');
  if (notifier) {
    notifier.style.opacity = '0';
    notifier.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      notifier.style.display = 'none';
      notifier.style.opacity = '1';
    }, 300);
  }
}

// ==============================================
// 🎬 Ambil Data Film Lokal + TMDB
// ==============================================
async function loadLocalMovies() {
  let allMovies = [];
  for (const file of MOVIES_JSON_PATHS) {
    try {
      const res = await fetch(file);
      if (res.ok) {
        const movies = await res.json();
        if (Array.isArray(movies)) {
          allMovies = [...allMovies, ...movies];
        }
      }
    } catch (err) {
      console.warn(`Gagal baca ${file}`, err);
    }
  }
  if (allMovies.length > 0) {
    moviesData = allMovies;
    renderFeed(moviesData);
  }
}

async function fetchMovies(page = 1) {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=${page}`);
    if (!response.ok) throw new Error('Gagal memuat data');
    const data = await response.json();
    if (page === 1) moviesData = data.results;
    else moviesData = [...moviesData, ...data.results];
    renderFeed(moviesData);
  } catch (error) {
    console.warn('Gagal terhubung ke TMDB, gunakan data cadangan:', error);
    loadFallbackData();
  }
}

// ==============================================
// 📂 Data Cadangan
// ==============================================
function loadFallbackData() {
  const fallback = [
    { id: 726888, title: 'Heartbeast', overview: 'Elina, rapper Finlandia...', release_date: '2022-11-04', poster_path: '', origin_country: ['FI'] },
    { id: 157336, title: 'Interstellar', overview: 'Sekelompok penjelajah...', release_date: '2014-11-05', poster_path: '/gEU2Qv0vHB77Yp7v6v94goI86v3.jpg', origin_country: ['US'] }
  ];
  if (moviesData.length === 0) moviesData = fallback;
  else moviesData = [...moviesData, ...fallback];
  renderFeed(moviesData);
}

// ==============================================
// 🖼️ Render Grid
// ==============================================
function renderFeed(movies) {
  if (!feedContainer) return;
  feedContainer.innerHTML = '';
  movies.forEach((movie, index) => {
    const posterUrl = movie.poster_path 
      ? `${IMAGE_URL}${movie.poster_path}` 
      : movie.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500';
    const year = movie.release_date ? movie.release_date.split('-')[0] : '-';
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.backgroundImage = `url('${posterUrl}')`;
    card.innerHTML = `
      <div class="overlay"></div>
      <div class="top-title">${movie.title}</div>
      <div class="play-btn-container" onclick="playMovie(${movie.tmdb_id || movie.id})">
        <div class="play-circle"><i data-lucide="play" fill="#fff" size="32"></i></div>
      </div>
      <div class="main-content">
        <div class="side-actions">
          <div class="action-item"><i data-lucide="calendar" size="28"></i><span>${year}</span></div>
        </div>
      </div>
    `;
    feedContainer.appendChild(card);
  });
  if (window.lucide) lucide.createIcons();
}

// ==============================================
// 🚀 Jalankan
// ==============================================
window.addEventListener('load', () => {
  loadLocalMovies();
  fetchMovies();
  setTimeout(() => initPromoNotifier(), 400);
});
