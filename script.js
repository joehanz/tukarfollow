// ==================== BAGIAN 1: KONFIGURASI & HALAMAN UTAMA ====================
const AD_DOMAINS = [
    'https://rajarayap.com',
    'https://ptdwiprima.blogspot.com',
    'https://caturbangunsentosa.blogspot.com'
];

let ALL_MOVIES = [];
let CURRENT_PAGE = 1;
const ITEMS_PER_PAGE = 26;

function generateSlug(title) {
    if (!title) return '';
    return title.toLowerCase()
        .replace(/[^a-z0-9\s()-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

document.addEventListener("DOMContentLoaded", async () => {
    initNavbar();
    await loadGlobalMoviesData();
    
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
    if (sectionTitle) sectionTitle.innerText = `Tahun Rilis: ${filterYear === 'klasik' ? 'Klasik (< 2024)' : filterYear}`;
    
    filtered = ALL_MOVIES.filter(m => {
        if (!m.release_date) return false;
        
        // Memotong string "15-05-2026" berdasarkan tanda "-" dan mengambil bagian tahun (paling belakang)
        const dateParts = m.release_date.split('-');
        const movieYear = parseInt(dateParts[2]); // Mengambil angka tahun saja
        
        if (filterYear === 'klasik') {
            // Jika memilih klasik, tampilkan film yang tahunnya di bawah 2024
            return movieYear < 2024;
        } else {
            // Jika memilih tahun spesifik, cocokkan tahunnya secara pas
            return movieYear === parseInt(filterYear);
        }
    });

        } else if (filterSearch) {
            if (sectionTitle) sectionTitle.innerText = `Hasil Pencarian: "${filterSearch}"`;
            filtered = ALL_MOVIES.filter(m => m.title.toLowerCase().includes(filterSearch.toLowerCase()));
            
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = filterSearch;
        }

        CURRENT_PAGE = 1;
        renderPaginationGrid(filtered);
    }
    if (document.getElementById('videoContainer')) {
        loadWatchPageData();
    }
});

async function loadGlobalMoviesData() {
    let localData = [];
    try {
        const res = await fetch('movies.json');
        if (res.ok) {
            const data = await res.json();
            localData = data.map((item) => {
                const slugId = generateSlug(item.title);
                return { ...item, internalId: slugId };
            });
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

            if (!grid) {
                if (keyword.length > 1) {
                    window.location.href = `index.html?filterSearch=${encodeURIComponent(e.target.value)}`;
                }
                return;
            }

            const filtered = ALL_MOVIES.filter(m => m.title.toLowerCase().includes(keyword));
            CURRENT_PAGE = 1;
            renderPaginationGrid(filtered);
        });
    }

    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const grid = document.getElementById('movieGrid');
            const genre = link.getAttribute('data-genre');
            const year = link.getAttribute('data-year');

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
                if (sectionTitle) sectionTitle.innerText = `Tahun Rilis: ${year === 'klasik' ? 'Klasik (< 2024)' : year}`;
                filtered = ALL_MOVIES.filter(m => {
                    if (!m.release_date) return false;
                    
                    // Mengambil 4 angka paling belakang dari string tanggal (Sangat Aman)
                    const cleanDate = m.release_date.toString().trim();
                    const movieYear = parseInt(cleanDate.slice(-4));
                    
                    if (isNaN(movieYear)) return false;

                    if (year === 'klasik') {
                        return movieYear < 2024; // Mengambil tahun di bawah 2024
                    } else {
                        return movieYear === parseInt(year); // Mengambil tahun yang cocok persis
                    }
                });
            }
            CURRENT_PAGE = 1;
            renderPaginationGrid(filtered);
        });
    });
}

function renderPaginationGrid(moviesList) {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;

    // Hapus kontainer tombol pagination lama jika ada
    const oldPager = document.getElementById('paginationContainer');
    if (oldPager) oldPager.remove();

    grid.innerHTML = "";
    if (!moviesList || moviesList.length === 0) {
        grid.innerHTML = "<div class='loading-text'>Tidak ada film ditemukan.</div>";
        return;
    }

    // Kalkulasi index pemotongan data film (26 per halaman)
    const startIndex = (CURRENT_PAGE - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = moviesList.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();
    paginatedItems.forEach(movie => {
        const card = document.createElement('a');
        card.className = "movie-card";
        card.href = `watch.html?id=${movie.internalId}`; 
        card.setAttribute("style", "position: relative; display: block; width: 180px; height: 260px; overflow: hidden; border-radius: 8px; margin: 10px; text-decoration: none;");
        
        card.innerHTML = `
            <div class="poster-wrapper" style="width: 100%; height: 100%;">
                <img src="${movie.image}" alt="${movie.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;">
            </div>
            <h3 style="position: absolute; bottom: 0; left: 0; width: 100%; margin: 0; padding: 10px; background: rgba(0, 0, 0, 0.75); color: #fff; font-size: 13px; text-align: center; box-sizing: border-box; white-space: normal; overflow: visible; word-wrap: break-word;">
                ${movie.title}
            </h3>
        `;
        fragment.appendChild(card);
    });
    grid.appendChild(fragment);

    function renderPaginationGrid(moviesList) {
    const totalPages = Math.ceil(moviesList.length / ITEMS_PER_PAGE);

// Membuat elemen tombol Navigasi Halaman (Pagination UI)
    const totalPages = Math.ceil(moviesList.length / ITEMS_PER_PAGE);
    if (totalPages > 1) {
        const pager = document.createElement('div');
        pager.id = 'paginationContainer';
        pager.setAttribute("style", "display: flex; justify-content: center; align-items: center; width: 100%; margin: 20px 0; gap: 15px; clear: both;");

        // Tombol Sebelumnya
        const prevBtn = document.createElement('button');
        prevBtn.innerText = "Prev";
        prevBtn.disabled = CURRENT_PAGE === 1;
        prevBtn.setAttribute("style", "padding: 8px 16px; background: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer; opacity: " + (CURRENT_PAGE === 1 ? "0.5" : "1") + ";");
        prevBtn.addEventListener('click', () => {
            if (CURRENT_PAGE > 1) {
                CURRENT_PAGE--;
                renderPaginationGrid(moviesList);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Info Halaman Aktif
        const pageInfo = document.createElement('span');
        pageInfo.innerText = ` ${CURRENT_PAGE} / ${totalPages}`;
        pageInfo.setAttribute("style", "color: #fff; font-size: 14px; font-weight: bold;");

        // Tombol Selanjutnya
        const nextBtn = document.createElement('button');
        nextBtn.innerText = "Next";
        nextBtn.disabled = CURRENT_PAGE === totalPages;
        nextBtn.setAttribute("style", "padding: 8px 16px; background: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer; opacity: " + (CURRENT_PAGE === totalPages ? "0.5" : "1") + ";");
        nextBtn.addEventListener('click', () => {
            if (CURRENT_PAGE < totalPages) {
                CURRENT_PAGE++;
                renderPaginationGrid(moviesList);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        pager.appendChild(prevBtn);
        pager.appendChild(pageInfo);
        pager.appendChild(nextBtn);
        grid.parentNode.insertBefore(pager, grid.nextSibling);
    }
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

        const relatedGrid = document.getElementById('relatedGrid');
        if (relatedGrid) {
            relatedGrid.innerHTML = "";
            let relatedMovies = [];

            const currentGenres = (selectedMovie.genre || "").toString().toLowerCase().split(/[\s,]+/);
            relatedMovies = ALL_MOVIES.filter(m => {
                const isDifferentMovie = m.internalId !== movieId;
                if (!isDifferentMovie || !m.genre) return false;
                
                const movieGenreText = m.genre.toString().toLowerCase();
                return currentGenres.some(g => g.trim() && movieGenreText.includes(g.trim()));
            });

            if (relatedMovies.length === 0) {
                relatedGrid.innerHTML = "<div class='loading-text'>Tidak ada film serupa ditemukan.</div>";
            } else {
                const fragment = document.createDocumentFragment();
                relatedMovies.forEach(movie => {
                    const card = document.createElement('a');
                    card.className = "movie-card"; 
                    card.href = `watch.html?id=${movie.internalId}`;
                    card.setAttribute("style", "position: relative; display: block; width: 180px; height: 260px; overflow: hidden; border-radius: 8px; flex-shrink: 0; margin-right: 15px; text-decoration: none;");
                    
                    card.innerHTML = `
                        <div class="poster-wrapper" style="width: 100%; height: 100%;">
                            <img src="${movie.image}" alt="${movie.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                        </div>
                        <h3 style="position: absolute; bottom: 0; left: 0; width: 100%; margin: 0; padding: 10px; background: rgba(0, 0, 0, 0.75); color: #fff; font-size: 13px; text-align: center; box-sizing: border-box; white-space: normal; overflow: visible; word-wrap: break-word;">
                            ${movie.title}
                        </h3>
                    `;
                    fragment.appendChild(card);
                });
                relatedGrid.appendChild(fragment);
            }
        }

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

        const safeSrc = (finalSrc || '').toLowerCase();

const adOverlay = document.querySelector('.ad-overlay');

const isAbyss = safeSrc.includes('abyssplayer.com');

const isCinematic =
  safeSrc.includes('playcinematic.com') ||
  safeSrc.includes('vsembed.ru') ||
  safeSrc.includes('vsembed.su');
        
        if (isAbyss && adOverlay) { adOverlay.style.display = 'none'; } 
        else if (isCinematic && adOverlay) { 
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

// ==================== BAGIAN 3: TOLAK KLIK KANAN, ANTI COPAS DAN WATERMARK ====================
    //<![CDATA[
    (function () {

      /* ===============================
         KONFIGURASI
      =============================== */
      var REDIRECT_URL = "/akses-ditolak.html"; // ganti jika mau
      var DETECT_DELAY = 1200; // ms

      /* ===============================
         OVERLAY WARNING
      =============================== */
      function showWarning(msg){
        if(document.getElementById('antiWarn')) return;
        var d = document.createElement('div');
        d.id = 'antiWarn';
        d.innerHTML = msg || '⚠️ Akses dibatasi. Aktivitas Anda tercatat.';
        d.style = `
          position:fixed;
          top:0;left:0;
          width:100%;height:100%;
          background:rgba(0,0,0,.92);
          color:#fff;
          z-index:999999;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          font-size:22px;
          font-family:Arial,sans-serif
        `;
        document.body.appendChild(d);

        setTimeout(function(){
          location.href = REDIRECT_URL;
        }, 2500);
      }

      /* ===============================
         DISABLE KLIK KANAN
      =============================== */
      document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showWarning('🚫 Klik kanan dinonaktifkan');
      });

      /* ===============================
         DISABLE SHORTCUT KEY
      =============================== */
      document.addEventListener('keydown', function (e) {

        if (
          (e.ctrlKey && [65,67,83,85,88,80].includes(e.keyCode)) || // A C S U X P
          (e.ctrlKey && e.shiftKey && [73,74,67].includes(e.keyCode)) || // I J C
          e.keyCode === 123 // F12
        ) {
          e.preventDefault();
          showWarning('🚫 Akses developer tidak diizinkan');
        }

      });

      /* ===============================
         DETEKSI DEVTOOLS (TRICK CONSOLE)
      =============================== */
      setInterval(function(){
        var t = new Image();
        Object.defineProperty(t,'id',{
          get:function(){
            showWarning('🛑 DevTools terdeteksi');
            throw 'DevTools Blocked';
          }
        });
        console.log(t);
      }, DETECT_DELAY);

      /* ===============================
         DISABLE SELECT & DRAG
      =============================== */
      var css = document.createElement('style');
      css.innerHTML = `
        body {
          -webkit-user-select:none;
          -moz-user-select:none;
          -ms-user-select:none;
          user-select:none;
        }
        img {
          pointer-events:none;
        }
      `;
      document.head.appendChild(css);

      /* ===============================
         WATERMARK HALUS
      =============================== */
     var wm = document.createElement('div');

  wm.innerHTML = 'Web design by joehanz';

  wm.title = 'Providing website creation services at affordable prices';

  wm.onclick = function(){
    window.open('https://www.freelancer.co.id/u/Colokjitu','_blank');
  };

  wm.style.position = 'fixed';
  wm.style.bottom = '6px';
  wm.style.right = '5%';
  wm.style.opacity = '.25';
  wm.style.fontSize = '11px';
  wm.style.zIndex = '999999';
  wm.style.color = '#fff';
  wm.style.cursor = 'pointer';

  document.body.appendChild(wm);
    })();
    //]]>

// ==================== BAGIAN 4: BERKAITAN DENGAN TV ====================
// Mengambil elemen modal berdasarkan ID template Anda
var modal = document.getElementById("myModal");

// Mengambil elemen iframe di dalam modal
var iframe = document.getElementById("modalTVFrame");

// Mengambil elemen <span> (x) untuk menutup modal
var span = document.getElementsByClassName("close")[0]; // Ditambahkan [0] agar mengunci elemen pertama dengan tepat

// FUNGSI: Membuka modal dan MELENYAPKAN total bar scroll dari layar
function openTVModal(url) {
    if (modal && iframe) {
        iframe.src = url; 
        modal.style.display = "block"; 
        
        // Trik jitu: Matikan dan sembunyikan total bar scroll dari seluruh browser (HTML & Body)
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden"; 
    }
}

// Logika menutup modal saat tombol (x) diklik & mengembalikan scrollbar
if (span) {
    span.onclick = function() {
        modal.style.display = "none";
        iframe.src = ""; 
        
        // Munculkan kembali bar scroll seperti semula
        document.documentElement.style.overflow = "auto";
        document.body.style.overflow = "auto"; 
    }
}

// Logika menutup modal jika klik area luar & mengembalikan scrollbar
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        iframe.src = ""; 
        
        // Munculkan kembali bar scroll seperti semula
        document.documentElement.style.overflow = "auto";
        document.body.style.overflow = "auto"; 
    }
}

// ==================== BAGIAN 5: BERKAITAN DENGAN TMDB INDO ====================
const API_KEY = "b3b893873ed1bb7f175b2707afeea2a0";

const indoMovieGrid = document.getElementById("indoMovieGrid");
const indoPagination = document.getElementById("indoPagination");

let indoCurrentPage = 1;
let indoTotalPages = 500;

// FETCH
async function fetchIndoMovies(page = 1){

  indoMovieGrid.innerHTML = `
    <h2 style="grid-column:1/-1;text-align:center;padding:50px;">
      Loading...
    </h2>
  `;

  try{

    const url = `
      https://api.themoviedb.org/3/discover/movie
      ?api_key=${API_KEY}
      &with_original_language=id
      &sort_by=popularity.desc
      &page=${page}
    `.replace(/\s+/g,'');

    const res = await fetch(url);

    const data = await res.json();

    indoTotalPages = data.total_pages;

    renderIndoMovies(data.results);

    renderIndoPagination();

  }catch(err){

    indoMovieGrid.innerHTML = `
      <h2 style="
        grid-column:1/-1;
        text-align:center;
        padding:50px;
        color:red;
      ">
        Gagal memuat film
      </h2>
    `;

  }

}

// RENDER
function renderIndoMovies(movies){

  indoMovieGrid.innerHTML = "";

  movies.forEach(movie => {

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : `https://via.placeholder.com/500x750?text=No+Image`;

    const card = document.createElement("div");

    card.className = "indo-movie-card";

    card.innerHTML = `
  <div class="indo-poster-wrap">

    <img src="${poster}" alt="${movie.title}">

    <div class="indo-movie-title">
      ${movie.title}
    </div>

  </div>
`;
    card.onclick = () => {
      openIndoPlayer(movie.id);
    };

    indoMovieGrid.appendChild(card);

  });

}

// PAGINATION
function renderIndoPagination(){

  indoPagination.innerHTML = "";

  let start = indoCurrentPage - 2;
  let end = indoCurrentPage + 2;

  if(start < 1) start = 1;
  if(end > indoTotalPages) end = indoTotalPages;

  if(indoCurrentPage > 1){

    const prev = document.createElement("button");

    prev.innerText = "‹";

    prev.onclick = () => {

      indoCurrentPage--;

      fetchIndoMovies(indoCurrentPage);

    };

    indoPagination.appendChild(prev);

  }

  for(let i = start; i <= end; i++){

    const btn = document.createElement("button");

    btn.innerText = i;

    if(i === indoCurrentPage){
      btn.classList.add("active");
    }

    btn.onclick = () => {

      indoCurrentPage = i;

      fetchIndoMovies(indoCurrentPage);

    };

    indoPagination.appendChild(btn);

  }

  if(indoCurrentPage < indoTotalPages){

    const next = document.createElement("button");

    next.innerText = "›";

    next.onclick = () => {

      indoCurrentPage++;

      fetchIndoMovies(indoCurrentPage);

    };

    indoPagination.appendChild(next);

  }

}

// PLAYER
function openIndoPlayer(tmdbId){

  document.getElementById("indoPlayerFrame").src =
    `https://vsembed.ru/embed/movie?tmdb=${tmdbId}`;

  document.getElementById("indoPlayerModal").style.display = "flex";

}

function closeIndoPlayer(){

  document.getElementById("indoPlayerModal").style.display = "none";

  document.getElementById("indoPlayerFrame").src = "";

}

// INIT
fetchIndoMovies();

// ==================== BAGIAN 6: BERKAITAN DENGAN AUTO CLOSE BURGER ====================
// AUTO CLOSE MOBILE MENU
document.querySelectorAll('.nav-menu a').forEach(link => {

    link.addEventListener('click', () => {

        const navMenu = document.getElementById('navMenu');
        const burgerBtn = document.getElementById('burgerBtn');

        if(navMenu){
            navMenu.classList.remove('open');
        }

        if(burgerBtn){
            burgerBtn.classList.remove('open');
        }

    });

});
