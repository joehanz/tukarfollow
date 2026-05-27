// ==================== BAGIAN 1: KONFIGURASI & HALAMAN UTAMA ====================
// DAFTAR DOMAIN IKLAN MANDIRI ANDA (UTUH & AKTIF)
const AD_DOMAINS = [
    'https://rajarayap.com',
    'https://blogspot.com',
    'https://blogspot.com'
];

let ALL_MOVIES = [];

// Inisialisasi Utama Halaman Web
document.addEventListener("DOMContentLoaded", async () => {
    initNavbar();
    await loadGlobalMoviesData();
    
    // Membaca parameter URL kiriman operan dari halaman lain (jika ada)
    const urlParams = new URLSearchParams(window.location.search);
    const filterGenre = urlParams.get('filterGenre');
    const filterYear = urlParams.get('filterYear');
    const filterSearch = urlParams.get('filterSearch');

    if (document.getElementById('movieGrid')) {
        let filtered = [...ALL_MOVIES];
        const sectionTitle = document.getElementById('sectionTitle');

        if (filterGenre) {
            if (sectionTitle) sectionTitle.innerText = `Genre: ${filterGenre}`;
            filtered = ALL_MOVIES.filter(m => m.genre && m.genre.toString().toLowerCase().includes(filterGenre.toLowerCase()));
        } else if (filterYear) {
            if (sectionTitle) sectionTitle.innerText = `Tahun Rilis: ${filterYear === 'klasik' ? 'Klasik (<2024)' : filterYear}`;
            filtered = ALL_MOVIES.filter(m => {
                if (!m.release_date) return false;
                return new Date(m.release_date).getFullYear() === parseInt(filterYear);
            });
        } else if (filterSearch) {
            if (sectionTitle) sectionTitle.innerText = `Hasil Pencarian: "${filterSearch}"`;
            filtered = ALL_MOVIES.filter(m => m.title.toLowerCase().includes(filterSearch.toLowerCase()));
            
            // Set kolom input agar tetap terisi teks pencariannya
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = filterSearch;
        }

        renderGrid(filtered);
    }
    if (document.getElementById('videoContainer')) {
        loadWatchPageData();
    }
});

// MENGGABUNGKAN DATA JSON LOKAL
async function loadGlobalMoviesData() {
    let localData = [];

    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            localData = data.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
        }
    } catch (e) {
        console.error("Gagal membaca movies.json lokal:", e);
    }

    ALL_MOVIES = [...localData].sort((a, b) => {
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
            const grid = document.getElementById('movieGrid');

            // OPER KE INDEX: Jika mencari film saat berada di watch.html, langsung lempar ke index.html
            if (!grid) {
                if (keyword.length > 1) {
                    window.location.href = `index.html?filterSearch=${encodeURIComponent(e.target.value)}`;
                }
                return;
            }

            const filtered = ALL_MOVIES.filter(m => m.title.toLowerCase().includes(keyword));
            renderGrid(filtered);
        });
    }

    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const grid = document.getElementById('movieGrid');
            const genre = link.getAttribute('data-genre');
            const year = link.getAttribute('data-year');

            // OPER KE INDEX: Jika memilih kategori saat berada di watch.html, langsung lempar ke index.html beserta datanya
            if (!grid) {
                if (genre) {
                    window.location.href = `index.html?filterGenre=${encodeURIComponent(genre)}`;
                } else if (year) {
                    window.location.href = `index.html?filterYear=${encodeURIComponent(year)}`;
                }
                return;
            }

            let filtered = [...ALL_MOVIES];
            const sectionTitle = document.getElementById('sectionTitle');

            if (genre) {
                if (sectionTitle) sectionTitle.innerText = `Genre: ${genre}`;
                filtered = ALL_MOVIES.filter(m => m.genre && m.genre.toString().toLowerCase().includes(genre.toLowerCase()));
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

    if (selectedMovie) {
        document.getElementById("watchTitle").innerText = selectedMovie.title;
        document.getElementById("watchSinopsis").innerText = selectedMovie.sinopsis;
        document.getElementById("watchGenre").innerText = selectedMovie.genre;
        document.getElementById("watchRelease").innerText = selectedMovie.release_date;
        document.getElementById("watchCountry").innerText = selectedMovie.country;
        
        const videoContainer = document.getElementById("videoContainer");
        let finalSrc = selectedMovie.iframe || selectedMovie.video || "";
        
        videoContainer.innerHTML = `
            <iframe id="moviePlayer" src="${finalSrc}" allowfullscreen frameborder="0" width="100%" height="100%"></iframe>
        `;

        // INJEKSI DAN PEMBUATAN LIST SEMUA VIDEO (ABAIKAN FILTER GENRE)
        const relatedGrid = document.getElementById('relatedGrid');
        if (relatedGrid) {
            relatedGrid.innerHTML = "";
            
            // Menampilkan semua video dari database selain film yang sedang ditonton
            let allOtherMovies = ALL_MOVIES.filter(m => m.internalId !== movieId);

            if (allOtherMovies.length === 0) {
                relatedGrid.innerHTML = "<div class='loading-text'>Tidak ada film ditemukan.</div>";
            } else {
                // ACAK URUTAN VIDEO (RANDOM SHUFFLE)
                allOtherMovies.sort(() => Math.random() - 0.5);

                // BATASI MAKSIMAL HANYA 10 VIDEO SAJA
                let limitedMovies = allOtherMovies.slice(0, 10);

                const fragment = document.createDocumentFragment();
                limitedMovies.forEach(movie => {
                    const card = document.createElement('a');
                    // DIPERBAIKI: Menggunakan class asli halaman utama agar panjang lebar sama persis
                    card.className = "movie-card"; 
                    card.href = `watch.html?id=${movie.internalId}`;
                    // DIPERBAIKI: Judul dipindahkan ke bagian atas sebelum elemen gambar poster
                    card.innerHTML = `
                        <h3>${movie.title}</h3>
                        <div class="poster-wrapper"><img src="${movie.image}" alt="${movie.title}" loading="lazy"></div>
                    `;
                    fragment.appendChild(card);
                });
                relatedGrid.appendChild(fragment);
            }
        }

        // KONTROL TOMBOL PANAH CAROUSEL SLIDER (DESKTOP)
        const slidePrev = document.getElementById('slidePrev');
        const slideNext = document.getElementById('slideNext');
        
        if (slidePrev && slideNext && relatedGrid) {
            slidePrev.addEventListener('click', () => {
                relatedGrid.scrollBy({ left: -300, behavior: 'smooth' });
            });
            slideNext.addEventListener('click', () => {
                relatedGrid.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }

        // SISTEM IKLAN SENSOR FILTER DAN 2X KLIK
        const adOverlay = document.querySelector('.ad-overlay');
        const isAbyss = finalSrc.toLowerCase().includes('abyssplayer.com');
        const isCinematic = finalSrc.toLowerCase().includes('playcinematic.com');

        if (isAbyss && adOverlay) {
            adOverlay.style.display = 'none';
        } 
        else if ((isCinematic) && adOverlay) {
            let clickCount = 0;
            let availableAds = [...AD_DOMAINS];

            adOverlay.addEventListener('click', () => {
                clickCount++;

                if (availableAds.length === 0) availableAds = [...AD_DOMAINS];
                const randomIndex = Math.floor(Math.random() * availableAds.length);
                const randomAd = availableAds.splice(randomIndex, 1); 

                if (clickCount === 1) {
                    window.open(randomAd, '_blank');
                } 
                else if (clickCount === 2) {
                    window.open(randomAd, '_blank');
                    adOverlay.style.display = 'none';

                    const player = document.getElementById('moviePlayer');
                    if (player) {
                        const currentSrc = player.src;
                        const separator = currentSrc.includes('?') ? '&' : '?';
                        player.src = currentSrc + separator + "autoplay=1";
                    }
                }
            });
        } else if (adOverlay) {
            adOverlay.style.display = 'none';
        }
    }
}

