// ==========================================
// 🔑 KONFIGURASI UTAMA
// ==========================================
const TMDB_API_KEY = "b3b893873ed1bb7f175b2707afeea2a0"; 
const TMDB_BASE_URL = "https://themoviedb.org";
const TMDB_IMAGE_URL = "https://tmdb.org";

document.addEventListener("DOMContentLoaded", () => {
    // 📱 Logika Navigasi Burger Menu (Mobile View)
    const burgerToggle = document.getElementById("burgerToggle2");
    const navMenu = document.getElementById("navMenu2");
    
    if (burgerToggle && navMenu) {
        burgerToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            burgerToggle.classList.toggle("open");
        });
    }

    // 🕵️ Deteksi Halaman Aktif Otomatis
    if (document.getElementById("movieGrid2")) {
        initIndexPage();
    } else if (document.getElementById("videoPlayer2")) {
        initWatchPage();
    }
    
    // Aktifkan kolom pencarian di semua halaman
    setupSearchListener();
});

// ==========================================
// 🏠 LOGIKA HALAMAN UTAMA (INDEX2.HTML)
// ==========================================
async function initIndexPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let page = parseInt(urlParams.get('page')) || 1;
    let searchQuery = urlParams.get('search') || "";

    try {
        let tmdbUrl = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=id-ID&page=${page}`;
        
        // Jika user sedang mencari sesuatu, ganti endpoint ke Search API
        if (searchQuery !== "") {
            tmdbUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=id-ID&page=${page}`;
        }

        const response = await fetch(tmdbUrl);
        const tmdbData = await response.json();

        // Ambil judul & poster dari TMDB untuk di-render ke Grid
        renderTMDBGrid(tmdbData.results);
        
        // Buat komponen pagination dinamis
        setupPagination(tmdbData.total_pages, page, searchQuery);

    } catch (error) {
        console.error("Gagal terhubung dengan server TMDB:", error);
    }
}

function renderTMDBGrid(movies) {
    const grid = document.getElementById("movieGrid2");
    grid.innerHTML = "";

    if (!movies || movies.length === 0) {
        grid.innerHTML = "<p class='empty-msg'>Film tidak ditemukan di TMDB.</p>";
        return;
    }

    movies.forEach(movie => {
        const movieTitle = movie.title || movie.original_title;
        const posterPath = movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placehold.co';

        const card = document.createElement("div");
        card.className = "movie-card2";
        
        // Melempar String Judul TMDB murni ke URL halaman watch2.html
        card.innerHTML = `
            <a href="watch2.html?title=${encodeURIComponent(movieTitle)}">
                <img src="${posterPath}" alt="${movieTitle}" loading="lazy">
                <h3>${movieTitle}</h3>
            </a>
        `;
        grid.appendChild(card);
    });
}

function setupPagination(totalPages, currentPage, searchQuery) {
    const pagination = document.getElementById("pagination2");
    pagination.innerHTML = "";

    const maxPages = Math.min(totalPages, 500); // Batasan aman halaman dari TMDB API
    if (maxPages <= 1) return;

    const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

    // Tombol Sebelumnya (<)
    if (currentPage > 1) {
        pagination.innerHTML += `<a href="index2.html?page=${currentPage - 1}${searchParam}">&lt;</a>`;
    }

    // Tampilkan rentang halaman aktif terdekat (Sistem pagination pintar)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(maxPages, currentPage + 3);

    for (let i = startPage; i <= endPage; i++) {
        pagination.innerHTML += `<a href="index2.html?page=${i}${searchParam}" class="${i === currentPage ? 'active' : ''}">${i}</a>`;
    }

    // Tombol Selanjutnya (>)
    if (currentPage < maxPages) {
        pagination.innerHTML += `<a href="index2.html?page=${currentPage + 1}${searchParam}">&gt;</a>`;
    }
}

function setupSearchListener() {
    const searchInput = document.getElementById("searchInput2");
    if (!searchInput) return;

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const keyword = searchInput.value.trim();
            if (keyword !== "") {
                window.location.href = `index2.html?search=${encodeURIComponent(keyword)}`;
            } else {
                window.location.href = "index2.html";
            }
        }
    });
}

// ==========================================
// 🎬 LOGIKA HALAMAN NONTON (WATCH2.HTML)
// ==========================================
function initWatchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const tmdbMovieTitle = urlParams.get('title'); 

    if (!tmdbMovieTitle) {
        window.location.href = "index2.html";
        return;
    }

    const decodedTitle = decodeURIComponent(tmdbMovieTitle);

    // Ambil data lokal movies.json untuk dilakukan pencocokan (matching)
    fetch("movies.json")
        .then(res => res.json())
        .then(localMovies => {
            const titleEl = document.getElementById("movieTitle2");
            const player = document.getElementById("videoPlayer2");
            const errorNotif = document.getElementById("errorNotif2");
            const sinopsisEl = document.getElementById("movieSinopsis2");

            titleEl.innerText = decodedTitle;

            let matchedMovie = null;
            let highestScore = 0;
            const SCORE_THRESHOLD = 0.8; // Target toleransi kecocokan judul minimal 80%

            // Bandingkan judul dari TMDB dengan semua baris judul di movies.json
            localMovies.forEach(movie => {
                const score = getTitleSimilarity(decodedTitle, movie.title);
                
                if (score > highestScore && score >= SCORE_THRESHOLD) {
                    highestScore = score;
                    matchedMovie = movie;
                }
            });

            // Log Console untuk Debugging Admin (Tekan F12 di browser untuk melihat skor)
            if (matchedMovie) {
                console.log(`[MATCH SUCCESS] TMDB: "${decodedTitle}" -> JSON: "${matchedMovie.title}" (${(highestScore * 100).toFixed(1)}% Cocok)`);
            } else {
                console.log(`[MATCH FAILED] TMDB: "${decodedTitle}" tidak menemukan kemiripan ≥ 80% di movies.json`);
            }

            // Eksekusi Logika Pemutar atau Tampilkan Error Notif
            if (matchedMovie) {
                // Judul Lolos Matching & Link Iframe Tersedia
                if (matchedMovie.iframe && matchedMovie.iframe.trim() !== "") {
                    // Gabungkan playcinematic.com dengan link iframe video dari json Anda
                    player.src = `https://playcinematic.com{encodeURIComponent(matchedMovie.iframe)}`;
                    player.style.display = "block";
                    errorNotif.style.display = "none";
                    sinopsisEl.innerText = matchedMovie.sinopsis || "Sinopsis tersedia di data lokal.";
                } else {
                    // Judul Lolos Matching tapi field iframe di JSON dikosongkan ""
                    player.style.display = "none";
                    errorNotif.style.display = "flex";
                    sinopsisEl.innerText = "Deskripsi film belum tersedia.";
                }
            } else {
                // Judul dari TMDB gagal lolos matching 80% (Tidak ada di database lokal)
                player.style.display = "none";
                errorNotif.style.display = "flex"; 
                sinopsisEl.innerText = "Film ini belum diunggah ke server lokal kami.";
            }
        })
        .catch(err => {
            console.error("Gagal membaca file movies.json lokal:", err);
            document.getElementById("errorNotif2").style.display = "flex";
        });
}

// ==========================================
// 🧠 ALGORITMA DICE'S COEFFICIENT (80% SIMILARITY)
// ==========================================
function getTitleSimilarity(str1, str2) {
    // 1. Fungsi membersihkan teks dari tanda baca/simbol dan spasi berlebih
    const cleanString = (str) => {
        return str.toLowerCase()
                  .replace(/[^a-z0-9\s]/g, '') 
                  .replace(/\s+/g, ' ')        
                  .trim();
    };

    const s1 = cleanString(str1);
    const s2 = cleanString(str2);

    if (s1 === s2) return 1.0; // Jika sama persis setelah diclean, otomatis 100% cocok
    if (s1.length < 2 || s2.length < 2) return 0.0;

    // 2. Pecah teks menjadi susunan 2-karakter (Bigrams)
    const getBigrams = (str) => {
        const bigrams = new Set();
        for (let i = 0; i < str.length - 1; i++) {
            bigrams.add(str.substring(i, i + 2));
        }
        return bigrams;
    };

    const bigrams1 = getBigrams(s1);
    const bigrams2 = getBigrams(s2);

    // 3. Hitung karakter berpasangan yang beririsan sama
    let intersection = 0;
    bigrams1.forEach(bigram => {
        if (bigrams2.has(bigram)) {
            intersection++;
        }
    });

    // 4. Hitung persentase rumus Sørensen-Dice
    return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
}
