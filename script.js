// ==================== BAGIAN 1: KONFIGURASI & HALAMAN UTAMA ====================

// DOMAIN IKLAN
const AD_DOMAINS = [
    'https://rajarayap.com',
    'https://ptdwiprima.blogspot.com',
    'https://caturbangunsentosa.blogspot.com'
];

// DATABASE FILM
let ALL_MOVIES = [];

// ==================== START WEBSITE ====================

document.addEventListener("DOMContentLoaded", async () => {

    initNavbar();

    await loadGlobalMoviesData();

    const urlParams =
        new URLSearchParams(window.location.search);

    const filterGenre =
        urlParams.get('filterGenre');

    const filterYear =
        urlParams.get('filterYear');

    const filterSearch =
        urlParams.get('filterSearch');

    // HALAMAN GRID
    if (document.getElementById('movieGrid')) {

        let filtered = [...ALL_MOVIES];

        const sectionTitle =
            document.getElementById('sectionTitle');

        // FILTER GENRE
        if (filterGenre) {

            if (sectionTitle) {

                sectionTitle.innerText =
                    `Genre: ${filterGenre}`;

            }

            filtered = ALL_MOVIES.filter(movie => {

                if (!movie.genre)
                    return false;

                return movie.genre
                    .toLowerCase()
                    .includes(filterGenre.toLowerCase());

            });

        }

        // FILTER TAHUN
        else if (filterYear) {

            if (sectionTitle) {

                sectionTitle.innerText =
                    `Tahun Rilis: ${filterYear}`;

            }

            filtered = ALL_MOVIES.filter(movie => {

                if (!movie.release_date)
                    return false;

                return new Date(movie.release_date)
                    .getFullYear() === parseInt(filterYear);

            });

        }

        // FILTER SEARCH
        else if (filterSearch) {

            if (sectionTitle) {

                sectionTitle.innerText =
                    `Hasil Pencarian: "${filterSearch}"`;

            }

            filtered = ALL_MOVIES.filter(movie => {

                return movie.title
                    .toLowerCase()
                    .includes(filterSearch.toLowerCase());

            });

            const searchInput =
                document.getElementById('searchInput');

            if (searchInput) {

                searchInput.value =
                    filterSearch;

            }

        }

        renderGrid(filtered);

    }

    // HALAMAN WATCH
    if (document.getElementById('videoContainer')) {

        loadWatchPageData();

    }

});

// ==================== LOAD MOVIES.JSON ====================

async function loadGlobalMoviesData() {

    try {

        const response =
            await fetch('movies.json');

        if (!response.ok) {

            console.error(
                'movies.json gagal dibaca'
            );

            return;

        }

        const data =
            await response.json();

        ALL_MOVIES = data.map((movie, index) => ({

            ...movie,

            internalId: `LOCAL_${index}`

        }));

    }

    catch (error) {

        console.error(
            'Gagal load movies.json:',
            error
        );

    }

}
// ==================== NAVBAR ====================

function initNavbar() {

    const burgerBtn =
        document.getElementById('burgerBtn');

    const navMenu =
        document.getElementById('navMenu');

    // BURGER MENU
    if (burgerBtn && navMenu) {

        burgerBtn.addEventListener('click', () => {

            burgerBtn.classList.toggle('open');

            navMenu.classList.toggle('open');

        });

    }

    // DROPDOWN MOBILE
    const dropBtns =
        document.querySelectorAll('.dropbtn');

    dropBtns.forEach(btn => {

        btn.addEventListener('click', () => {

            if (window.innerWidth <= 768) {

                const content =
                    btn.nextElementSibling;

                if (content) {

                    content.classList.toggle(
                        'open-mobile'
                    );

                }

            }

        });

    });

    // SEARCH
    const searchInput =
        document.getElementById('searchInput');

    if (searchInput) {

        searchInput.addEventListener('input', (e) => {

            const keyword =
                e.target.value.toLowerCase();

            const grid =
                document.getElementById('movieGrid');

            // jika di halaman watch
            if (!grid) {

                if (keyword.length > 1) {

                    window.location.href =
                        `index.html?filterSearch=${encodeURIComponent(e.target.value)}`;

                }

                return;

            }

            // filter realtime
            const filtered =
                ALL_MOVIES.filter(movie => {

                    return movie.title
                        .toLowerCase()
                        .includes(keyword);

                });

            renderGrid(filtered);

        });

    }

    // FILTER GENRE & TAHUN
    document.querySelectorAll(
        '.dropdown-content a'
    ).forEach(link => {

        link.addEventListener('click', (e) => {

            e.preventDefault();

            const grid =
                document.getElementById('movieGrid');

            const genre =
                link.getAttribute('data-genre');

            const year =
                link.getAttribute('data-year');

            // redirect dari watch
            if (!grid) {

                if (genre) {

                    window.location.href =
                        `index.html?filterGenre=${encodeURIComponent(genre)}`;

                }

                else if (year) {

                    window.location.href =
                        `index.html?filterYear=${encodeURIComponent(year)}`;

                }

                return;

            }

            let filtered =
                [...ALL_MOVIES];

            const sectionTitle =
                document.getElementById('sectionTitle');

            // genre
            if (genre) {

                if (sectionTitle) {

                    sectionTitle.innerText =
                        `Genre: ${genre}`;

                }

                filtered =
                    ALL_MOVIES.filter(movie => {

                        if (!movie.genre)
                            return false;

                        return movie.genre
                            .toLowerCase()
                            .includes(
                                genre.toLowerCase()
                            );

                    });

            }

            // tahun
            else if (year) {

                if (sectionTitle) {

                    sectionTitle.innerText =
                        `Tahun Rilis: ${year}`;

                }

                filtered =
                    ALL_MOVIES.filter(movie => {

                        if (!movie.release_date)
                            return false;

                        return new Date(
                            movie.release_date
                        ).getFullYear() === parseInt(year);

                    });

            }

            renderGrid(filtered);

        });

    });

}

// ==================== RENDER GRID ====================

function renderGrid(moviesList) {

    const grid =
        document.getElementById('movieGrid');

    if (!grid)
        return;

    grid.innerHTML = "";

    // kosong
    if (!moviesList || moviesList.length === 0) {

        grid.innerHTML =
            "<div class='loading-text'>Tidak ada film ditemukan.</div>";

        return;

    }

    // grid rata
    grid.style.display = "grid";

    grid.style.gridTemplateColumns =
        "repeat(auto-fill,minmax(160px,1fr))";

    grid.style.gap = "16px";

    const fragment =
        document.createDocumentFragment();

    moviesList.forEach(movie => {

        const card =
            document.createElement('a');

        card.className =
            "movie-card";

        card.href =
            `watch.html?id=${movie.internalId}`;

        // style card
        card.style.cssText = `
            position:relative;
            display:block;
            width:100%;
            aspect-ratio:2/3;
            overflow:hidden;
            border-radius:12px;
            background:#111;
            text-decoration:none;
        `;

        // isi card
        card.innerHTML = `
            <div style="
                width:100%;
                height:100%;
                position:relative;
            ">

                <img
                    src="${movie.image}"
                    alt="${movie.title}"
                    loading="lazy"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        display:block;
                    "
                >

                <div style="
                    position:absolute;
                    left:0;
                    right:0;
                    bottom:0;
                    padding:35px 10px 10px;
                    background:linear-gradient(
                        to top,
                        rgba(0,0,0,.95),
                        rgba(0,0,0,0)
                    );
                ">

                    <h3 style="
                        margin:0;
                        color:#fff;
                        font-size:14px;
                        line-height:1.3;
                        overflow:hidden;
                        display:-webkit-box;
                        -webkit-line-clamp:2;
                        -webkit-box-orient:vertical;
                    ">
                        ${movie.title}
                    </h3>

                </div>

            </div>
        `;

        fragment.appendChild(card);

    });

    grid.appendChild(fragment);

}
// ==================== HALAMAN WATCH ====================

async function loadWatchPageData() {

    const urlParams =
        new URLSearchParams(window.location.search);

    const movieId =
        urlParams.get('id');

    // cek id
    if (!movieId) {

        document.getElementById("watchTitle")
            .innerText =
            "Film Tidak Ditemukan";

        return;

    }

    // cari film
    const selectedMovie =
        ALL_MOVIES.find(movie =>
            movie.internalId === movieId
        );

    // jika tidak ada
    if (!selectedMovie) {

        document.getElementById("watchTitle")
            .innerText =
            "Film Tidak Ditemukan";

        return;

    }

    // ==================== DETAIL FILM ====================

    document.getElementById("watchTitle")
        .innerText =
        selectedMovie.title || "-";

    document.getElementById("watchSinopsis")
        .innerText =
        selectedMovie.sinopsis || "-";

    document.getElementById("watchGenre")
        .innerText =
        selectedMovie.genre || "-";

    document.getElementById("watchRelease")
        .innerText =
        selectedMovie.release_date || "-";

    document.getElementById("watchCountry")
        .innerText =
        selectedMovie.country || "-";

    // ==================== PLAYER ====================

    const videoContainer =
        document.getElementById("videoContainer");

    const finalSrc =
        selectedMovie.iframe ||
        selectedMovie.video ||
        "";

    videoContainer.innerHTML = `
        <iframe
            id="moviePlayer"
            src="${finalSrc}"
            allowfullscreen
            frameborder="0"
            width="100%"
            height="100%">
        </iframe>
    `;

    // ==================== RELATED MOVIES ====================

    const relatedGrid =
        document.getElementById('relatedGrid');

    if (relatedGrid) {

        relatedGrid.innerHTML = "";

        // ambil genre film aktif
        const currentGenres =
            (selectedMovie.genre || "")
            .toLowerCase()
            .split(/[,|]/)
            .map(g => g.trim())
            .filter(Boolean);

        // filter film segenre
        let relatedMovies =
            ALL_MOVIES.filter(movie => {

                // jangan tampilkan film sendiri
                if (movie.internalId === movieId)
                    return false;

                // jika tidak punya genre
                if (!movie.genre)
                    return false;

                // genre film lain
                const movieGenres =
                    movie.genre
                    .toLowerCase()
                    .split(/[,|]/)
                    .map(g => g.trim());

                // cocokkan genre
                return currentGenres.some(g =>
                    movieGenres.includes(g)
                );

            });

        // batasi jumlah
        relatedMovies =
            relatedMovies.slice(0, 12);

        // kosong
        if (relatedMovies.length === 0) {

            relatedGrid.innerHTML =
                "<div class='loading-text'>Tidak ada film serupa ditemukan.</div>";

        }

        // tampilkan
        else {

            relatedGrid.style.display = "grid";

            relatedGrid.style.gridTemplateColumns =
                "repeat(auto-fill,minmax(160px,1fr))";

            relatedGrid.style.gap = "16px";

            const fragment =
                document.createDocumentFragment();

            relatedMovies.forEach(movie => {

                const card =
                    document.createElement('a');

                card.className =
                    "movie-card";

                card.href =
                    `watch.html?id=${movie.internalId}`;

                // ukuran rata
                card.style.cssText = `
                    position:relative;
                    display:block;
                    width:100%;
                    aspect-ratio:2/3;
                    overflow:hidden;
                    border-radius:12px;
                    background:#111;
                    text-decoration:none;
                `;

                // isi card
                card.innerHTML = `
                    <div style="
                        width:100%;
                        height:100%;
                        position:relative;
                    ">

                        <img
                            src="${movie.image}"
                            alt="${movie.title}"
                            loading="lazy"
                            style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                                display:block;
                            "
                        >

                        <div style="
                            position:absolute;
                            left:0;
                            right:0;
                            bottom:0;
                            padding:35px 10px 10px;
                            background:linear-gradient(
                                to top,
                                rgba(0,0,0,.95),
                                rgba(0,0,0,0)
                            );
                        ">

                            <h3 style="
                                margin:0;
                                color:#fff;
                                font-size:14px;
                                line-height:1.3;
                                overflow:hidden;
                                display:-webkit-box;
                                -webkit-line-clamp:2;
                                -webkit-box-orient:vertical;
                            ">
                                ${movie.title}
                            </h3>

                        </div>

                    </div>
                `;

                fragment.appendChild(card);

            });

            relatedGrid.appendChild(fragment);

        }

    }

    // ==================== IKLAN ====================

    const adOverlay =
        document.querySelector('.ad-overlay');

    if (adOverlay) {

        let clickCount = 0;

        let availableAds =
            [...AD_DOMAINS];

        adOverlay.addEventListener('click', () => {

            clickCount++;

            // reset daftar iklan
            if (availableAds.length === 0) {

                availableAds =
                    [...AD_DOMAINS];

            }

            // random iklan
            const randomIndex =
                Math.floor(
                    Math.random() *
                    availableAds.length
                );

            const randomAd =
                availableAds.splice(randomIndex, 1)[0];

            // klik pertama
            if (clickCount === 1) {

                window.open(
                    randomAd,
                    '_blank'
                );

            }

            // klik kedua
            else if (clickCount === 2) {

                window.open(
                    randomAd,
                    '_blank'
                );

                adOverlay.style.display =
                    'none';

                const player =
                    document.getElementById('moviePlayer');

                if (player) {

                    const currentSrc =
                        player.src;

                    const separator =
                        currentSrc.includes('?')
                        ? '&'
                        : '?';

                    player.src =
                        currentSrc +
                        separator +
                        "autoplay=1";

                }

            }

        });

    }

}
