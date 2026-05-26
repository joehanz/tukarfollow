// CONFIG UTAMA API TMDB
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://themoviedb.org';
const TMDB_IMAGE_URL = 'https://tmdb.org'; // Ukuran poster w300 agar loading gambar super cepat!

// GLOBAL DATA STORAGE
let LOCAL_MOVIES_DATA = [];      
let TMDB_MOVIES_DATA = [];       
let GLOBAL_COMBINED_MOVIES = [];   
let currentTmdbPage = 1;        
let currentSearchKeyword = "";    

// EKSEKUSI UTAMA HOMEPAGE (Jalan otomatis saat HTML siap)
window.addEventListener('DOMContentLoaded', () => {
    initNavbarLayout();
    executeHomepageSystem();
});

async function executeHomepageSystem() {
    const gridContainer = document.getElementById('movieGrid');
    if (!gridContainer) return;

    // 1. Ambil Postingan Manual Terlebih Dahulu (Jalur Cepat Terisolasi)
    try {
        const response = await fetch('movies.json');
        if (response.ok) {
            const parseData = await response.json();
            LOCAL_MOVIES_DATA = parseData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
            GLOBAL_COMBINED_MOVIES = [...LOCAL_MOVIES_DATA];
            printMoviesToGrid(GLOBAL_COMBINED_MOVIES);
        }
    } catch (err) {
        console.error("Gagal memuat movies.json:", err);
    }

    // Paksa hapus teks loading bawaan HTML
    gridContainer.innerHTML = "";
    if (GLOBAL_COMBINED_MOVIES.length > 0) {
        printMoviesToGrid(GLOBAL_COMBINED_MOVIES);
    }

    // 2. Tarik Data Tambahan Film Indonesia Baru dari TMDB (20 Film Pertama)
    await pullIndonesianMoviesFromTMDB(currentTmdbPage);
    
    // 3. Pasang Tombol Pagination Manual (Aman untuk memori browser)
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
                    genre: "Indonesia Movie", 
                    release_date: movie.release_date || "2026-01-01",
                    internalId: `TMDB_${movie.id}`
                }));

                TMDB_MOVIES_DATA = [...TMDB_MOVIES_DATA, ...cleanMappedData];
                GLOBAL_COMBINED_MOVIES = [...LOCAL_MOVIES_DATA, ...TMDB_MOVIES_DATA];
                printMoviesToGrid(GLOBAL_COMBINED_MOVIES);
            }
        }
    } catch (error) {
        console.error("Server TMDB Error:", error);
    }
}

function printMoviesToGrid(arrayData) {
    const gridContainer = document.getElementById('movieGrid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = ""; 

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

function injectPaginationButton() {
    const gridElement = document.getElementById('movieGrid');
    if (!gridElement || document.getElementById('loadMoreTmdbBtn')) return;

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

function initNavbarLayout() {
    const triggerBurger = document.getElementById('burgerBtn');
    const panelMenu = document.getElementById('navMenu');
    
    if (triggerBurger && panelMenu) {
        triggerBurger.addEventListener('click', () => {
            triggerBurger.classList.toggle('open');
            panelMenu.classList.toggle('open');
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchKeyword = e.target.value.toLowerCase();
            const filteredResults = GLOBAL_COMBINED_MOVIES.filter(m => m.title.toLowerCase().includes(currentSearchKeyword));
            printMoviesToGrid(filteredResults);
        });
    }
}
