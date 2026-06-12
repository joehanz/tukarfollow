const TMDB_API_KEY = 'b3b893873ed1bb7f175b2707afeea2a0';
const TMDB_BASE_URL = 'https://themoviedb.org';
let currentPage = 1;
let currentQuery = '';
let currentGenre = '';
let currentYear = '';

// Inisialisasi Utama
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    setupDropdownGenres();
    
    if (document.getElementById('movieGrid')) {
        // Logika Halaman Utama (Index)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('year')) {
            filterByYear(urlParams.get('year'));
        } else {
            fetchDiscoverGrid();
        }
        setupSearch();
        setupYearFilters();
    } else if (document.getElementById('videoPlayer')) {
        // Logika Halaman Pemutar (Watch)
        initWatchPage();
    }
});

// Sistem Navigasi & Burger Mobile
function initNavbar() {
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Mengambil Data Genre Langsung dari TMDB
async function setupDropdownGenres() {
    try {
        const res = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=id`);
        const data = await res.json();
        const genreMenu = document.getElementById('genreMenu');
        
        genreMenu.innerHTML = data.genres.map(g => `
            <a href="#" class="genre-link" data-id="${g.id}">${g.name}</a>
        `).join('');

        document.querySelectorAll('.genre-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if(!document.getElementById('movieGrid')) {
                    window.location.href = `index.html?genre=${e.target.dataset.id}`;
                    return;
                }
                currentGenre = e.target.dataset.id;
                currentQuery = ''; currentYear = ''; currentPage = 1;
                document.getElementById('sectionTitle').innerText = `Genre: ${e.target.innerText}`;
                fetchDiscoverGrid();
            });
        });
    } catch (err) { console.error("Gagal load genre", err); }
}

// Mengambil Data Film Campuran Acak (Movies & Series) dari TMDB
async function fetchDiscoverGrid() {
    const grid = document.getElementById('movieGrid');
    grid.innerHTML = '<p>Memuat konten...</p>';
    
    let url = `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&page=${currentPage}`;
    
    if (currentQuery) {
        url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
    } else if (currentGenre) {
        url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${currentGenre}&page=${currentPage}`;
    } else if (currentYear) {
        const yearQuery = currentYear === 'classic' ? 'release_date.lte=2023-12-31' : `primary_release_year=${currentYear}`;
        url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&${yearQuery}&page=${currentPage}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderGrid(data.results);
        renderPagination(data.total_pages || 10);
    } catch (err) { grid.innerHTML = '<p>Gagal memuat data dari TMDB.</p>'; }
}

// Render Tampilan Card Film di Grid
function renderGrid(items) {
    const grid = document.getElementById('movieGrid');
    if (!items || items.length === 0) {
        grid.innerHTML = '<p>Konten tidak ditemukan.</p>';
        return;
    }

    grid.innerHTML = items.filter(item => item.media_type !== 'person' && (item.title || item.name)).map(item => {
        const isMovie = item.media_type === 'movie' || item.release_date;
        const title = isMovie ? item.title : item.name;
        const releaseDate = isMovie ? (item.release_date || '') : (item.first_air_date || '');
        const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
        const poster = item.poster_path ? `https://tmdb.org{item.poster_path}` : 'https://placeholder.com';
        
        return `
            <div class="movie-card" onclick="goToWatch(${item.id}, '${escape(title)}')">
                <span class="badge badge-left">${isMovie ? 'WEBRip' : 'SERIES'}</span>
                <span class="badge badge-right">${year}</span>
                <img src="${poster}" alt="${title}">
                <div class="card-title-overlay">${title}</div>
            </div>
        `;
    }).join('');
}

// Fungsi Navigasi Halaman Detail Watch
function goToWatch(id, title) {
    window.location.href = `watch.html?id=${id}&title=${encodeURIComponent(unescape(title))}`;
}

// Filter Pencarian dan Tahun
function setupSearch() {
    document.getElementById('searchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        currentQuery = document.getElementById('searchInput').value;
        currentGenre = ''; currentYear = ''; currentPage = 1;
        document.getElementById('sectionTitle').innerText = `Hasil Pencarian: "${currentQuery}"`;
        fetchDiscoverGrid();
    });
}

function setupYearFilters() {
    document.querySelectorAll('.year-filter').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const year = e.target.dataset.year || e.target.dataset.type;
            filterByYear(year);
        });
    });
}

function filterByYear(year) {
    currentYear = year;
    currentQuery = ''; currentGenre = ''; currentPage = 1;
    document.getElementById('sectionTitle').innerText = year === 'classic' ? 'Film Klasik (Di bawah 2024)' : `Rilis Tahun: ${year}`;
    fetchDiscoverGrid();
}

// Logika Pagination Pintar (1 2 3 .. >)
function renderPagination(totalPages) {
    const pContainer = document.getElementById('pagination');
    let html = '';
    const maxPages = Math.min(totalPages, 20); // Batasi maks 20 halaman demi performa

    if (currentPage > 1) html += `<button onclick="changePage(${currentPage - 1})">‹</button>`;
    
    for (let i = 1; i <= maxPages; i++) {
        if (i === 1 || i === maxPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span>...</span>`;
        }
    }
    
    if (currentPage < maxPages) html += `<button onclick="changePage(${currentPage + 1})">›</button>`;
    pContainer.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchDiscoverGrid();
}

// Logika Validasi movies.json & Player Anti-Adblock / Overlay Timer Halaman Watch
async function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const tmdbId = parseInt(urlParams.get('id'));
    const title = urlParams.get('title');

    try {
        // Konfirmasi dengan Lokal movies.json
        const localRes = await fetch('movies.json');
        const localData = await localRes.json();
        
        const matchedMovie = localData.find(m => m.tmdb_id === tmdbId);

        if (matchedMovie) {
            // JIKA MATCH: Ambil player & data lokal dari movies.json
            document.getElementById('movieTitle').innerText = matchedMovie.title;
            document.getElementById('movieMeta').innerText = `${matchedMovie.country} | ${matchedMovie.release_date} | ${matchedMovie.genre.join(', ')}`;
            document.getElementById('movieSynopsis').innerText = matchedMovie.sinopsis;
            
            // Set Player Iframe
            const iframeUrl = matchedMovie.iframe || "https://playcinematic.com";
            document.getElementById('videoPlayer').src = iframeUrl;
            
            // Mekanisme Layer Timer 6 Detik
            startPlayerTimer();
        } else {
            // JIKA TIDAK MATCH: Ambil Fallback langsung data detail dari TMDB
            const tmdbRes = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=id`);
            const tmdbMovie = await tmdbRes.json();
            
            document.getElementById('movieTitle').innerText = tmdbMovie.title || title;
            document.getElementById('movieMeta').innerText = `Rilis: ${tmdbMovie.release_date || 'N/A'} | Rating: ${tmdbMovie.vote_average}`;
            document.getElementById('movieSynopsis').innerText = tmdbMovie.overview || 'Sinopsis belum tersedia untuk bahasa ini.';
            document.getElementById('videoPlayer').src = "https://vidsrc.to" + tmdbId; // player cadangan universal gratis
            
            startPlayerTimer();
        }
    } catch (err) {
        console.error(err);
        document.getElementById('movieTitle').innerText = title || "Nonton Film";
    }
}

function startPlayerTimer() {
    const adsLayer = document.getElementById('adsLayer');
    const adsImage = document.getElementById('adsImage');
    
    // Detik 0-3: Gambar Segera Dimulai (Sudah terpasang di HTML default)
    
    // Detik ke-3 ganti ke Banner Web Situs Sponsor
    setTimeout(() => {
        adsImage.src = "https://githubusercontent.com"; 
        // Anda bisa mengganti URL di atas ke banner situs1.com / situs2.com Anda sendiri
    }, 3000);

    // Detik ke-6: Hapus total layer penutup untuk menampilkan tombol play/iframe film asli
    setTimeout(() => {
        adsLayer.style.display = 'none';
    }, 6000);
}
