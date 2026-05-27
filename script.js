// ==================== BAGIAN 1: KONFIGURASI & HALAMAN UTAMA ====================

// DAFTAR DOMAIN IKLAN MANDIRI ANDA
const AD_DOMAINS = [
    'https://rajarayap.com',
    'https://ptdwiprima.blogspot.com',
    'https://caturbangunsentosa.blogspot.com'
];

let ALL_MOVIES = [];

// Inisialisasi Utama Halaman Web
document.addEventListener("DOMContentLoaded", async () => {

    initNavbar();

    await loadGlobalMoviesData();

    // Membaca parameter URL
    const urlParams = new URLSearchParams(window.location.search);

    const filterGenre = urlParams.get('filterGenre');
    const filterYear = urlParams.get('filterYear');
    const filterSearch = urlParams.get('filterSearch');

    if (document.getElementById('movieGrid')) {

        let filtered = [...ALL_MOVIES];

        const sectionTitle =
            document.getElementById('sectionTitle');

        if (filterGenre) {

            if (sectionTitle)
                sectionTitle.innerText = `Genre: ${filterGenre}`;

            filtered = ALL_MOVIES.filter(m =>
                m.genre &&
                m.genre.toString().toLowerCase()
                .includes(filterGenre.toLowerCase())
            );

        } else if (filterYear) {

            if (sectionTitle)
                sectionTitle.innerText =
                `Tahun Rilis: ${filterYear}`;

            filtered = ALL_MOVIES.filter(m => {

                if (!m.release_date) return false;

                return new Date(m.release_date)
                    .getFullYear() === parseInt(filterYear);

            });

        } else if (filterSearch) {

            if (sectionTitle)
                sectionTitle.innerText =
                `Hasil Pencarian: "${filterSearch}"`;

            filtered = ALL_MOVIES.filter(m =>
                m.title.toLowerCase()
                .includes(filterSearch.toLowerCase())
            );

            const searchInput =
                document.getElementById('searchInput');

            if (searchInput)
                searchInput.value = filterSearch;
        }

        renderGrid(filtered);
    }

    if (document.getElementById('videoContainer')) {
        loadWatchPageData();
    }

});

// LOAD MOVIES.JSON SAJA
async function loadGlobalMoviesData() {

    try {

        const res = await fetch('movies.json');

        if (!res.ok) return;

        const data = await res.json();

        ALL_MOVIES = data.map((item, idx) => ({
            ...item,
            internalId: `MOVIE_${idx}`
        }));

    } catch (e) {

        console.error(
            "Gagal membaca movies.json:",
            e
        );

    }

}
-------------------------------------------------------
async function loadWatchPageData() {

    const urlParams =
        new URLSearchParams(window.location.search);

    const movieId = urlParams.get('id');

    if (!movieId) {

        document.getElementById("watchTitle")
            .innerText = "Film Tidak Ditemukan";

        return;
    }

    // cari film dari database lokal
    const selectedMovie =
        ALL_MOVIES.find(m => m.internalId === movieId);

    if (!selectedMovie) {

        document.getElementById("watchTitle")
            .innerText = "Film Tidak Ditemukan";

        return;
    }

    // isi detail
    document.getElementById("watchTitle")
        .innerText = selectedMovie.title;

    document.getElementById("watchSinopsis")
        .innerText = selectedMovie.sinopsis || "-";

    document.getElementById("watchGenre")
        .innerText = selectedMovie.genre || "-";

    document.getElementById("watchRelease")
        .innerText = selectedMovie.release_date || "-";

    document.getElementById("watchCountry")
        .innerText = selectedMovie.country || "-";

    // player
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

    // ================= RELATED MOVIES =================

    const relatedGrid =
        document.getElementById('relatedGrid');

    if (relatedGrid) {

        relatedGrid.innerHTML = "";

        // baca genre film aktif
        const currentGenres =
            (selectedMovie.genre || "")
            .toLowerCase()
            .split(/[,|]/)
            .map(g => g.trim())
            .filter(Boolean);

        // filter film segenre
        let relatedMovies = ALL_MOVIES.filter(movie => {

            // jangan tampilkan film yg sama
            if (movie.internalId === movieId)
                return false;

            if (!movie.genre)
                return false;

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

        // batasi 12 film
        relatedMovies = relatedMovies.slice(0, 12);

        // render
        if (relatedMovies.length === 0) {

            relatedGrid.innerHTML =
                "<div class='loading-text'>Tidak ada film serupa ditemukan.</div>";

        } else {

            const fragment =
                document.createDocumentFragment();

            relatedGrid.style.display = "grid";

            relatedGrid.style.gridTemplateColumns =
                "repeat(auto-fill,minmax(160px,1fr))";

            relatedGrid.style.gap = "16px";

            relatedMovies.forEach(movie => {

                const card =
                    document.createElement('a');

                card.className = "movie-card";

                card.href =
                    `watch.html?id=${movie.internalId}`;

                // ukuran sama rata
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

    // tombol slider
    const slidePrev =
        document.getElementById('slidePrev');

    const slideNext =
        document.getElementById('slideNext');

    if (slidePrev && slideNext && relatedGrid) {

        slidePrev.addEventListener('click', () => {

            relatedGrid.scrollBy({
                left: -300,
                behavior: 'smooth'
            });

        });

        slideNext.addEventListener('click', () => {

            relatedGrid.scrollBy({
                left: 300,
                behavior: 'smooth'
            });

        });
    }

    // ================= IKLAN =================

    const adOverlay =
        document.querySelector('.ad-overlay');

    if (adOverlay) {

        let clickCount = 0;

        let availableAds = [...AD_DOMAINS];

        adOverlay.addEventListener('click', () => {

            clickCount++;

            if (availableAds.length === 0)
                availableAds = [...AD_DOMAINS];

            const randomIndex =
                Math.floor(
                    Math.random() * availableAds.length
                );

            const randomAd =
                availableAds.splice(randomIndex, 1)[0];

            if (clickCount === 1) {

                window.open(randomAd, '_blank');

            } else if (clickCount === 2) {

                window.open(randomAd, '_blank');

                adOverlay.style.display = 'none';

                const player =
                    document.getElementById('moviePlayer');

                if (player) {

                    const currentSrc = player.src;

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
