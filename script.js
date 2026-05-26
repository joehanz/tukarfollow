// ==================== BAGIAN 1: KONFIGURASI & HALAMAN UTAMA ====================
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org'; 
const TMDB_IMAGE_URL = 'https://themoviedb.org'; 

// FIX: Alamat iklan dikembalikan utuh sesuai skrip awal Anda tanpa dikurangi
const AD_DOMAINS = [
    'https://rajarayap.com',
    'https://blogspot.com',
    'https://blogspot.com'
];

let ALL_MOVIES = [];

document.addEventListener("DOMContentLoaded", async () => {
    initNavbar();
    await loadGlobalMoviesData();
    
    if (document.getElementById('movieGrid')) {
        renderGrid(ALL_MOVIES);
    }
    if (document.getElementById('videoContainer')) {
        loadWatchPageData();
    }
});

async function loadGlobalMoviesData() {
    let localData = [];
    let tmdbData = [];

    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            localData = data.map((item, idx) => {
                let cleanGenres = [];
                if (item.genre) {
                    if (Array.isArray(item.genre)) {
                        cleanGenres = item.genre.map(g => g.toString().trim().toLowerCase());
                    } else {
                        cleanGenres = item.genre.toString().split(',').map(g => g.trim().toLowerCase());
                    }
                } else {
                    cleanGenres = ["uncategorized"];
                }
                
                return {
                    title: item.title || "Untitled",
                    image: item.image || "https://placeholder.com",
                    iframe: item.iframe || item.video || "", 
                    sinopsis: item.sinopsis || "Sinopsis tidak tersedia.",
                    genre: cleanGenres,
                    release_date: item.release_date || "0000-00-00",
                    country: item.country || "Unknown",
                    internalId: `LOCAL_${idx}`
                };
            });
        }
    } catch (e) {
        console.error("Gagal membaca movies.json lokal:", e);
    }

    try {
        const today = new Date().toISOString().split('T');
        const endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=primary_release_date.desc&release_date.lte=${today}&language=id-ID`;
        const res = await fetch(endpoint);
        
        if (res.ok) {
            const data = await res.json();
            if (data.results) {
                tmdbData = data.results.map(movie => {
                    const posterPath = movie.poster_path ? movie.poster_path.replace(/^\//, '') : '';
                    return {
                        title: movie.title,
                        image: posterPath ? `${TMDB_IMAGE_URL}/${posterPath}` : 'https://placeholder.com',
                        iframe: `https://vidsrc.me{movie.id}`,
                        sinopsis: movie.overview || "Sinopsis belum tersedia untuk film ini.",
                        genre: ["indonesia movie"], 
                        release_date: movie.release_date || "0000-00-00",
                        country: "Indonesia",
                        internalId: `TMDB_${movie.id}`
                    };
                });
            }
        }
    } catch (e) {
        console.error("Gagal sinkronisasi dengan API TMDB:", e);
    }

    ALL_MOVIES = [...localData, ...tmdbData].sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(b.release_date) - new Date(a.release_date);
    });
}

function initNavbar() {
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener('click', () => {
            burgerBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    const dropBtns = document.querySelectorAll('.dropbtn');
    dropBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const content = btn.nextElementSibling;
                if (content) content.classList.toggle('open-mobile');
            }
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = ALL_MOVIES.filter(m => m.title.toLowerCase().includes(keyword));
            
            const grid = document.getElementById('movieGrid');
            if (grid) {
                renderGrid(filtered);
            } else {
                window.location.href = `index.html?search=${encodeURIComponent(keyword)}`;
            }
        });
    }

    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            const grid = document.getElementById('movieGrid');
            const genre = link.getAttribute('data-genre');
            const year = link.getAttribute('data-year');

            if (!grid) {
                if (genre) window.location.href = `index.html?genre=${encodeURIComponent(genre)}`;
                if (year) window.location.href = `index.html?year=${encodeURIComponent(year)}`;
                return;
            }

            e.preventDefault();
            let filtered = [...ALL_MOVIES];
            const sectionTitle = document.getElementById('sectionTitle');

            if (genre) {
                if (sectionTitle) sectionTitle.innerText = `Genre: ${genre}`;
                filtered = ALL_MOVIES.filter(m => m.genre && m.genre.includes(genre.toLowerCase().trim()));
            } else if (year) {
                if (sectionTitle) sectionTitle.innerText = `Tahun Rilis: ${year === 'klasik' ? 'Klasik (<2024)' : year}`;
                filtered = ALL_MOVIES.filter(m => {
                    if (!m.release_date) return false;
                    return new Date(m.release_date).getFullYear() === parseInt(year);
                });
            }
            renderGrid(filtered);
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const filterGenre = urlParams.get('genre');
    const filterYear = urlParams.get('year');
    const filterSearch = urlParams.get('search');
    
    if (document.getElementById('movieGrid')) {
        if (filterGenre) {
            document.getElementById('sectionTitle').innerText = `Genre: ${filterGenre}`;
            renderGrid(ALL_MOVIES.filter(m => m.genre && m.genre.includes(filterGenre.toLowerCase().trim())));
        } else if (filterYear) {
            document.getElementById('sectionTitle').innerText = `Tahun Rilis: ${filterYear}`;
            renderGrid(ALL_MOVIES.filter(m => m.release_date && new Date(m.release_date).getFullYear() === parseInt(filterYear)));
        } else if (filterSearch) {
            renderGrid(ALL_MOVIES.filter(m => m.title.toLowerCase().includes(decodeURIComponent(filterSearch).toLowerCase())));
            if(document.getElementById('searchInput')) document.getElementById('searchInput').value = decodeURIComponent(filterSearch);
        }
    }
}

function renderGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    
    grid.innerHTML = "";
    if (!moviesList || moviesList.length === 0) {
        grid.innerHTML = "<div class='loading-text'>Tidak ada film ditemukan.</div>";
        return;
    }

    const fragment = document.createDocumentFragment();
    moviesList.forEach(movie => {
        const card = document.createElement('a');
        card.className = "movie-card";
        card.href = `watch.html?id=${movie.internalId}`;
        card.innerHTML = `
            <div class="poster-wrapper"><img src="${movie.image}" alt="${movie.title}" loading="lazy"></div>
            <h3>${movie.title}</h3>
        `;
        fragment.appendChild(card);
    });
    grid.appendChild(fragment);
}
// ==================== BAGIAN 2: HALAMAN NONTON & SISTEM IKLAN ====================
async function loadWatchPageData() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        document.getElementById("watchTitle").innerText = "Film Tidak Ditemukan";
        return;
    }

    let selectedMovie = ALL_MOVIES.find(m => m.internalId === movieId);

    if (!selectedMovie && movieId.startsWith("TMDB_")) {
        const tmdbId = movieId.replace("TMDB_", "");
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=id-ID`);
            if (res.ok) {
                const movie = await res.json();
                const posterPath = movie.poster_path ? movie.poster_path.replace(/^\//, '') : '';
                selectedMovie = {
                    title: movie.title,
                    sinopsis: movie.overview || "Sinopsis belum tersedia.",
                    genre: ["indonesia movie"],
                    release_date: movie.release_date,
                    country: "Indonesia",
                    iframe: `https://vidsrc.me{tmdbId}`,
                    image: posterPath ? `${TMDB_IMAGE_URL}/${posterPath}` : 'https://placeholder.com',
                    internalId: movieId
                };
            }
        } catch (e) {
            console.error("Gagal memuat detail darurat TMDB:", e);
        }
    }

    if (selectedMovie) {
        document.getElementById("watchTitle").innerText = selectedMovie.title;
        document.getElementById("watchSinopsis").innerText = selectedMovie.sinopsis;
        
        const displayGenres = selectedMovie.genre.map(g => g.charAt(0).toUpperCase() + g.slice(1));
        document.getElementById("watchGenre").innerText = displayGenres.join(", ");
        document.getElementById("watchRelease").innerText = selectedMovie.release_date;
        document.getElementById("watchCountry").innerText = selectedMovie.country;
        
        const videoContainer = document.getElementById("videoContainer");
        videoContainer.innerHTML = ""; 
        
        if (selectedMovie.iframe) {
            const iframeElemen = document.createElement('iframe');
            iframeElemen.src = selectedMovie.iframe;
            iframeElemen.setAttribute('allowfullscreen', 'true');
            iframeElemen.setAttribute('frameborder', '0');
            iframeElemen.style.width = "100%";
            iframeElemen.style.height = "100%";
            videoContainer.appendChild(iframeElemen);
        } else {
            videoContainer.innerHTML = "<div class='loading-text'>Tautan pemutar video tidak tersedia.</div>";
        }

        generateRelatedCarousel(selectedMovie, ALL_MOVIES);
    }

    // FIX: Fungsi klik paksa pembuka tab baru iklan dikembalikan utuh 100% tanpa dikurangi
    const adOverlay = document.querySelector('.ad-overlay');
    if (adOverlay) {
        adOverlay.addEventListener('click', () => {
            if (AD_DOMAINS.length > 0) {
                const randomAd = AD_DOMAINS[Math.floor(Math.random() * AD_DOMAINS.length)];
                window.open(randomAd, '_blank');
            }
        });
    }
}

function generateRelatedCarousel(currentMovie, allMovies) {
    const carousel = document.querySelector('.movie-carousel');
    if (!carousel) return;
    carousel.innerHTML = "";

    const currentGenres = currentMovie.genre;

    const related = allMovies.filter(movie => {
        if (movie.internalId === currentMovie.internalId || movie.title === currentMovie.title) return false;
        if (!movie.genre) return false;
        return movie.genre.some(g => currentGenres.includes(g));
    });

    if (related.length === 0) {
        carousel.innerHTML = "<div style='color:#8e8e93; padding: 10px; font-size:14px;'>Tidak ada film serupa ditemukan.</div>";
        return;
    }

    related.forEach(movie => {
        const card = document.createElement('a');
        card.className = "movie-card";
        card.style.flex = "0 0 140px";
        card.style.width = "140px";
        card.style.display = "block";
        card.href = `watch.html?id=${movie.internalId}`;
        card.innerHTML = `
            <div class="poster-wrapper" style="width:100%; aspect-ratio:2/3; overflow:hidden; border-radius:8px;">
                <img src="${movie.image}" alt="${movie.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <h3 style="margin-top:8px; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500;">${movie.title}</h3>
        `;
        carousel.appendChild(card);
    });
}
