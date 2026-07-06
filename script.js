const API_KEY = 'c000d7b8b0f5ee16b98b6103009745d8'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w780';

const feedContainer = document.getElementById('feedContainer');
const searchContainer = document.getElementById('searchContainer');
const infoPanel = document.getElementById('infoPanel');
const panelContentArea = document.getElementById('panelContentArea');
const videoPlayerContainer = document.getElementById('videoPlayerContainer');
const playerArea = document.getElementById('playerArea');

let moviesData = [];
let activeMovieIndex = 0;
let currentPage = 1;
let currentActiveSection = null; 
let myCustomMovies = []; 

// 1. Ambil data lokal movies.json
async function loadLocalMovies() {
    try {
        const res = await fetch('movies.json');
        if(res.ok) {
            myCustomMovies = await res.json();
            console.log("Data movies.json berhasil dimuat!", myCustomMovies);
        }
    } catch(e) {
        console.warn("Gagal memuat movies.json atau file belum dibuat.", e);
    }
}

// 2. Ambil Data dari TMDB
async function fetchMovies(page = 1) {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        if(page === 1) moviesData = data.results;
        else moviesData = [...moviesData, ...data.results];

        renderFeed(moviesData);
    } catch (error) {
        loadFallbackData();
    }
}

function loadFallbackData() {
    const fallback = [
        { id: 726888, title: 'Heartbeast', overview: 'Elina, rapper Finlandia, jatuh cinta pada Sofia...', release_date: '2022-11-04', poster_path: '' },
        { id: 157336, title: 'Interstellar', overview: 'Ketika Bumi semakin tidak layak dihuni...', release_date: '2014-11-05', poster_path: '/gEU2Qv0vHB77Yp7v6v94goI86v3.jpg' }
    ];
    moviesData = [...moviesData, ...fallback];
    renderFeed(moviesData);
}

// 3. Render ke Feed Layar Penuh
function renderFeed(movies) {
    feedContainer.innerHTML = '';
    movies.forEach((movie, index) => {
        const customData = myCustomMovies.find(m => m.tmdb_id === movie.id);
        
        let posterFullUrl = '';
        if (customData && customData.image) {
            posterFullUrl = customData.image;
        } else if (movie.poster_path) {
            posterFullUrl = `${IMAGE_URL}${movie.poster_path}`;
        } else {
            posterFullUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500'; 
        }

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.backgroundImage = `url('${posterFullUrl}')`;
        
        let releaseDateStr = customData ? customData.release_date : movie.release_date;
        const year = releaseDateStr ? releaseDateStr.split('-')[0] : '-';

        card.innerHTML = `
            <div class="overlay"></div>
            <div class="top-title">${customData ? customData.title : movie.title}</div>
            
            <div class="play-btn-container" onclick="playMovie(${movie.id})">
                <div class="play-circle"><i data-lucide="play" fill="#fff" size="32" style="margin-left:5px;"></i></div>
            </div>

                    <div class="main-content">
                        <div class="side-actions">
                            <div class="action-item" onclick="toggleSection(event, ${index}, 'info')">
                                <i data-lucide="info" size="28"></i>
                                <span>info</span>
                            </div>
                            <div class="action-item" onclick="toggleSection(event, ${index}, 'release')">
                                <i data-lucide="calendar" size="28"></i>
                                <span>${year}</span>
                            </div>
                            <div class="action-item" onclick="toggleSection(event, ${index}, 'genre')">
                                <i data-lucide="clapperboard" size="28"></i>
                                <span>Film</span>
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

    // Tombol Load More untuk Pagination
    const loadMoreCard = document.createElement('div');
    loadMoreCard.className = 'load-more-card';
    loadMoreCard.innerHTML = `<button class="load-more-btn" onclick="loadNextPage()">Load More (Page ${currentPage + 1})</button>`;
    feedContainer.appendChild(loadMoreCard);

    lucide.createIcons();
}

function loadNextPage() {
    currentPage++;
    fetchMovies(currentPage);
}

// 4. Logika Cicilan Info Dinamis (Klik buka, klik lagi nutup)
function toggleSection(event, index, section) {
    event.stopPropagation();
    const movie = moviesData[index];
    if (!movie) return;

    const customData = myCustomMovies.find(m => m.tmdb_id === movie.id);

    if (infoPanel.classList.contains('show') && currentActiveSection === section) {
        infoPanel.classList.remove('show');
        currentActiveSection = null;
        return;
    }

    currentActiveSection = section;
    let htmlContent = '';

    switch(section) {
        case 'info':
            const sinopsis = customData ? customData.sinopsis : movie.overview;
            htmlContent = `<i data-lucide="info" size="22"></i><p>${sinopsis || 'Tidak ada deskripsi.'}</p>`;
            break;
        case 'release':
            const rilis = customData ? customData.release_date : movie.release_date;
            htmlContent = `<i data-lucide="calendar" size="22"></i><p>Tanggal Rilis: <strong>${rilis || '-'}</strong></p>`;
            break;
        case 'genre':
            let genreStr = 'Movie (TMDB)';
            if (customData && customData.genre) {
                genreStr = Array.isArray(customData.genre) ? customData.genre.join(', ') : customData.genre;
            }
            htmlContent = `<i data-lucide="clapperboard" size="22"></i><p>Kategori: <strong>${genreStr}</strong></p>`;
            break;
        case 'country':
            const negara = customData ? customData.country : 'International';
            htmlContent = `<i data-lucide="globe" size="22"></i><p>Negara Produksi: <strong>${negara}</strong></p>`;
            break;
    }

    panelContentArea.innerHTML = htmlContent;
    infoPanel.classList.add('show');
    lucide.createIcons();
}

// 5. Pemutar Video Cerdas Sesuai Isi JSON Kamu
function playMovie(tmdbId) {
    const customMovie = myCustomMovies.find(m => m.tmdb_id === tmdbId);
    playerArea.innerHTML = ''; 

    if (customMovie) {
        if (customMovie.iframe && customMovie.iframe.trim() !== "") {
            playerArea.innerHTML = `<iframe src="${customMovie.iframe}" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
        } else if (customMovie.video && customMovie.video.trim() !== "") {
            playerArea.innerHTML = `<video src="${customMovie.video}" controls autoplay playsinline></video>`;
        } else {
            playerArea.innerHTML = `<iframe src="https://vidsrc.me/embed/movie?tmdb=${tmdbId}" allowfullscreen></iframe>`;
        }
    } else {
        playerArea.innerHTML = `<iframe src="https://vidsrc.me/embed/movie?tmdb=${tmdbId}" allowfullscreen></iframe>`;
    }

    videoPlayerContainer.classList.add('active');
}

document.getElementById('closePlayerBtn').addEventListener('click', () => {
    playerArea.innerHTML = ''; 
    videoPlayerContainer.classList.remove('active');
});

// 6. Pemantau Gerakan Scroll Aktif dengan Auto-Update Judul
feedContainer.addEventListener('scroll', () => {
    const index = Math.round(feedContainer.scrollTop / window.innerHeight);
    
    if (index !== activeMovieIndex) {
        activeMovieIndex = index;
        
        infoPanel.classList.remove('show');
        currentActiveSection = null;
        
        const currentMovie = moviesData[activeMovieIndex];
        if (currentMovie) {
            const customData = myCustomMovies.find(m => m.tmdb_id === currentMovie.id);
            const topTitles = document.querySelectorAll('.top-title');
            
            if (topTitles[activeMovieIndex]) {
                topTitles[activeMovieIndex].innerText = customData ? customData.title : currentMovie.title;
            }
        }
    }
});

// Search Bar Toggle
document.getElementById('navSearch').addEventListener('click', (e) => {
    e.stopPropagation();
    searchContainer.classList.toggle('show');
});

document.getElementById('navHome').addEventListener('click', () => {
    feedContainer.scrollTo({ top: 0, behavior: 'smooth' });
});

// Booting Aplikasi
async function init() {
    await loadLocalMovies();
    await fetchMovies(currentPage);
}

init();
