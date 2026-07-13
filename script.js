const API_KEY = 'c000d7b8b0f5ee16b98b6103009745d8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w780';
const MOVIES_JSON_PATH = 'movies.json';

const feedContainer = document.getElementById('feedContainer');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const infoPanel = document.getElementById('infoPanel');
const panelContentArea = document.getElementById('panelContentArea');

let moviesData = [];
let activeMovieIndex = 0;
let currentPage = 1;
let currentActiveSection = null; 
let isDesktop = false;

function detectDevice() {
    isDesktop = window.innerWidth >= 1024;
    const arrows = document.querySelectorAll('.arrow-actions-container');
    arrows.forEach(arrow => {
        if (arrow) arrow.style.display = isDesktop ? 'flex' : 'none';
    });
}

function scrollFeed(direction) {
    if (!feedContainer) return;
    const cardHeight = window.innerHeight;
    feedContainer.scrollBy({ 
        top: direction === 'down' ? cardHeight : -cardHeight, 
        behavior: 'smooth' 
    });
}

// ==============================================
// 🚀 1. FLYER BACA DATA DARI MOVIES.JSON (AUTO)
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

  // Baca file JSON kamu terlebih dahulu
  fetch(MOVIES_JSON_PATH, { cache: "no-store" })
    .then(response => response.json())
    .then(movies => {
      if (Array.isArray(movies) && movies.length > 0) {
        // Ambil data film paling atas di JSON kamu untuk dijadikan Flyer
        const latestMovie = movies[0];
        
        if (latestMovie.image) promoCard.style.backgroundImage = `url('${latestMovie.image}')`;
        if (promoTitle) promoTitle.textContent = latestMovie.title || '';
        if (promoSinopsis) promoSinopsis.textContent = latestMovie.sinopsis || '';
        if (promoCountry) {
          const tahun = latestMovie.release_date ? latestMovie.release_date.split('-')[0] : '';
          promoCountry.textContent = `${latestMovie.country || ''} • ${tahun}`;
        }
        if (promoGenres && latestMovie.genre) {
          promoGenres.innerHTML = '';
          latestMovie.genre.forEach(g => {
            const span = document.createElement('span');
            span.textContent = g;
            promoGenres.appendChild(span);
          });
        }

        // Saat tombol Flyer diklik, langsung kirim ID bersih ke watch.html
        if (promoWatchBtn) {
          promoWatchBtn.onclick = function() {
            closeNotifier();
            const targetId = latestMovie.tmdb_id || latestMovie.id;
            window.location.href = `watch.html?id=${targetId}`;
          };
        }
      }
      
      notifier.style.setProperty('display', 'flex', 'important');
      if (window.lucide) lucide.createIcons();
    })
    .catch(err => {
      console.error("Gagal memuat flyer dari JSON:", err);
    });
}

function closeNotifier() {
  const notifier = document.getElementById('desktopNotifier');
  if (notifier) notifier.style.display = 'none';
}

// ==============================================
// 🎬 2. AMBIL DATA FILM DARI TMDB UNTUK GRID
// ==============================================
async function fetchMovies(page = 1) {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=id-ID&page=${page}`);
        if (!response.ok) throw new Error('Gagal memuat');
        const data = await response.json();
        
        moviesData = page === 1 ? data.results : [...moviesData, ...data.results];
        renderFeed(moviesData);
    } catch (error) {
        console.warn('Menggunakan data cadangan');
    }
}

// ==============================================
// 🖼️ 3. RENDER GRID (LINK SANGAT BERSIH)
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
            
            <!-- Link bersih sesuai permintaanmu: watch.html?id=[ID_FILM] -->
            <div class="play-btn-container" onclick="window.location.href='watch.html?id=${movie.id}'">
                <div class="play-circle"><i data-lucide="play" fill="#fff" size="32"></i></div>
            </div>

            <div class="main-content">
                <div class="side-actions">
                    <div class="arrow-actions-container" style="display: ${isDesktop ? 'flex' : 'none'};">
                        <div class="inline-scroll-arrow" onclick="scrollFeed('up')"><i data-lucide="chevron-up" size="22"></i></div>
                        <div class="inline-scroll-arrow" onclick="scrollFeed('down')"><i data-lucide="chevron-down" size="22"></i></div>
                    </div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'info')">
                        <i data-lucide="info" size="28"></i>
                        <span>Info</span>
                    </div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'release')">
                        <i data-lucide="calendar" size="28"></i>
                        <span>${year}</span>
                    </div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'genre')">
                        <i data-lucide="clapperboard" size="28"></i>
                        <span>Genre</span>
                    </div>
                    <div class="action-item" onclick="toggleSection(event, ${index}, 'country')">
                        <i data-lucide="globe" size="28"></i>
                        <span>Negara</span>
                    </div>
                </div>
            </div>
        `;
        feedContainer.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}

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
    panelContentArea.innerHTML = `<div style="padding:20px; color:#fff;">Memuat...</div>`;
    infoPanel.classList.add('show');

    try {
        const resDetail = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=id-ID`);
        const detailData = await resDetail.json();
        let html = '';

        switch (section) {
            case 'info': html = `<p style="line-height:1.7; color:#fff; margin:0;">${detailData.overview || movie.overview || 'Sinopsis tidak tersedia.'}</p>`; break;
            case 'release': html = `<p style="color:#fff; margin:0;"><strong>Tanggal Rilis:</strong><br>${detailData.release_date || movie.release_date || 'Tidak diketahui'}</p>`; break;
            case 'genre':
                const genres = detailData.genres?.map(g => g.name) || [];
                html = `<p style="color:#fff; margin:0;"><strong>Genre:</strong><br>${genres.join(', ') || 'Tidak ditentukan'}</p>`;
                break;
            case 'country':
                const countries = detailData.production_countries?.map(c => c.name) || [];
                html = `<p style="color:#fff; margin:0;"><strong>Negara:</strong><br>${countries.join(', ') || 'Tidak ditentukan'}</p>`;
                break;
        }
        panelContentArea.innerHTML = html;
    } catch (err) {
        panelContentArea.innerHTML = `<p style="color:#ff6b6b;">Gagal memuat detail.</p>`;
    }
}

// ==============================================
// 🔍 PENCARIAN FILM (LINK JUGA BERSIH)
// ==============================================
let searchResultsLayer = document.getElementById('searchResultsLayer');
if (!searchResultsLayer) {
    searchResultsLayer = document.createElement('div');
    searchResultsLayer.id = 'searchResultsLayer';
    searchResultsLayer.className = 'search-results-layer';
    searchResultsLayer.innerHTML = `
        <div class="search-header">
            <h4>Hasil Pencarian</h4>
            <button class="close-search" onclick="tutupPencarian()"><i data-lucide="x" size="20"></i></button>
        </div>
        <div class="search-content" id="searchContent"></div>
    `;
    document.body.appendChild(searchResultsLayer);
}

function tutupPencarian() {
    searchResultsLayer.classList.remove('active');
    if (searchInput) searchInput.value = '';
}

async function cariFilm(kata) {
    if (!kata || kata.trim().length < 2) return;
    const searchContent = document.getElementById('searchContent');
    if (searchContent) searchContent.innerHTML = `<div style="padding:30px; color:#fff; text-align:center;">Mencari...</div>`;
    searchResultsLayer.classList.add('active');

    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=id-ID&query=${encodeURIComponent(kata)}&page=1&include_adult=false`);
        const data = await res.json();
        const hasilHTML = data.results?.map(movie => `
            <div class="search-item-row" onclick="window.location.href='watch.html?id=${movie.id}'">
                <div class="search-item-thumb" style="background-image:url('${movie.poster_path ? IMAGE_URL + movie.poster_path : ''}')"></div>
                <div class="search-item-info">
                    <h4>${movie.title}</h4>
                    <p>${movie.release_date ? movie.release_date.split('-')[0] : '-'}</p>
                </div>
            </div>
        `).join('') || `<div style="padding:40px; color:#aaa; text-align:center;">Tidak ada hasil ditemukan</div>`;

        if (searchContent) searchContent.innerHTML = hasilHTML;
        if (window.lucide) lucide.createIcons();
    } catch (err) {
        if (searchContent) searchContent.innerHTML = `<div style="padding:40px; color:#ff6b6b; text-align:center;">Gagal terhubung</div>`;
    }
}

if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            cariFilm(searchInput.value.trim());
        }
    });
}

window.addEventListener('DOMContentLoaded', detectDevice);
window.addEventListener('load', () => {
    fetchMovies();
    setTimeout(initPromoNotifier, 400);
});
window.addEventListener('resize', detectDevice);
