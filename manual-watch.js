const movieId = new URLSearchParams(location.search).get("movie");
const KEY = "b3b893873ed1bb7f175b2707afeea2a0";

const ads = [
  "https://rajarayap.com",
  "https://ptdwiprima.blogspot.com",
  "https://caturbangunsentosa.blogspot.com"
];

let movies = [];
let movie = null;
let adsState = false;

/* STATE PENCARIAN (SAMA PERSIS SEPERTI IDMOVIES.JS) */
let page = 1;
let query = "";

/* BURGER */
function toggleMenu() {
  document.getElementById("mobileMenu").classList.toggle("show");
}

/* LOAD UTAMA (LOGIKA GABUNGAN FILM MANUAL DAN PENCARIAN TMDB) */
async function load() {
  // Jika tidak ada query pencarian, jalankan fungsi default memuat halaman video manual
  if (!query) {
    // Tampilkan kembali elemen pemutar video orisinal halaman ini
    toggleMainElements(true);

    if (movies.length === 0) {
      const res = await fetch("movies.json");
      movies = await res.json();
    }
    movie = movies[movieId];
    loadMovie();
    return;
  }

  // JIKA ADA QUERY: REPLACE HALAMAN DENGAN MENEMBAK API PENCARIAN TMDB
  toggleMainElements(false);
  
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${encodeURIComponent(query)}&page=${page}`;
  const data = await fetch(url).then(r => r.json());

  render(data.results);
  renderPagination(data.page);
}

/* LOAD DETAIL FILM MANUAL */
function loadMovie() {
  if (!movie) return;

  document.getElementById("info").innerHTML = `
    <h2>${movie.title}</h2>
    <p>📅 Rilis : ${movie.release_date || "-"}</p>
    <p>🌍 Negara : ${movie.country || "-"}</p>
    <p>🎭 Genre : ${movie.genre.join(", ")}</p>
    <p style="margin-top:15px; line-height:1.7; opacity:.9;">
      ${movie.sinopsis}
    </p>

    <div style="margin:20px 0 15px 0; padding:14px; border-radius:12px; background:#111; border:1px solid rgba(255,255,255,.08);">
      <a href="javascript:void(0);" onclick="history.back();" style="color:gold; font-weight:bold; text-decoration:none; display:inline-block;">
        ⚙️ Reset to Original
      </a>
    </div>
  `;

  renderRelated();
}

/* PLAYER */
document.getElementById("playLayer").onclick = function () {
  const checkSrc = movie.iframe.toLowerCase();
  const bypass = checkSrc.includes("abyssplayer.com");

  if (!bypass && !adsState) {
    adsState = true;
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    window.open(randomAd, "_blank");
  }

  this.style.display = "none";
  document.getElementById("player").src = movie.iframe;
};

/* RELATED MOVIES KECIL */
function renderRelated() {
  let h = "";
  const related = movies
    .filter(m => m !== movie)
    .sort(() => Math.random() - 0.5)
    .slice(0, 15);

  related.forEach(v => {
    h += `
      <div class="rel-card" onclick="go(${movies.indexOf(v)})">
        <img src="${v.image}">
      </div>
    `;
  });

  document.getElementById("rel").innerHTML = h;
}

function move(dir) {
  document.getElementById("rel").scrollBy({
    left: dir * 300,
    behavior: "smooth"
  });
}

function go(i) {
  location.href = `manual-watch.html?movie=${i}`;
}

/* RENDER GRID HASIL PENCARIAN (SAMA SEPERTI IDMOVIES.JS) */
function render(data) {
  let h = "";
  data.forEach(m => {
    if (!m.poster_path) return;
    h += `
      <div class="card" onclick="goWatch(${m.id})">
        <img src="https://image.tmdb.org/t/p/w300${m.poster_path}">
        <div class="title">${m.title}</div>
      </div>
    `;
  });

  document.getElementById("grid").innerHTML = h;
}

/* PAGINATION PENCARIAN (SAMA SEPERTI IDMOVIES.JS) */
function renderPagination(p) {
  let h = "";
  if (p > 1) {
    h += `<button onclick="prevSet()">‹</button>`;
  }

  for (let i = 1; i <= 6; i++) {
    let num = p + i - 1;
    h += `
      <button onclick="goPage(${num})"
        style="background:${num === page ? '#ff2e2e' : '#1a1a22'}; color:#fff; border:none; padding:6px 10px; margin:2px; border-radius:6px; cursor:pointer;">
        ${num}
      </button>
    `;
  }

  h += `<button onclick="nextSet()">›</button>`;
  document.getElementById("pagination").innerHTML = h;
}

function goPage(p) {
  page = p;
  load();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextSet() {
  page = page + 1;
  load();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function prevSet() {
  page = Math.max(1, page - 1);
  load();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* TARGET KLIK FILM HASIL CARI MEMBUKA WATCH.HTML BERBASIS ID TMDB */
function goWatch(id) {
  location.href = `watch.html?id=${id}`;
}

/* FUNGSI PENCARIAN NAV (SAMA SEPERTI IDMOVIES.JS) */
function searchMovie() {
  query = document.getElementById("search").value;
  page = 1;
  load();
}

function searchMovieMobile() {
  query = document.querySelector("#mobileMenu input").value;
  page = 1;
  load();
}

/* FUNGSI BANTU UNTUK SWITCH/REPLACE TAMPILAN HALAMAN BERSIH */
function toggleMainElements(showOriginal) {
  const mainGrid = document.getElementById("grid");
  const mainPag = document.getElementById("pagination");
  const playerWrap = document.querySelector(".player");
  const infoWrap = document.getElementById("info");
  const relWrap = document.querySelector(".rel-wrap1");

  if (showOriginal) {
    if (mainGrid) mainGrid.style.display = "none";
    if (mainPag) mainPag.style.display = "none";
    if (playerWrap) playerWrap.style.display = "flex";
    if (infoWrap) infoWrap.style.display = "block";
    if (relWrap) relWrap.style.display = "none";
  } else {
    if (mainGrid) mainGrid.style.display = "grid";
    if (mainPag) mainPag.style.display = "flex";
    if (playerWrap) playerWrap.style.display = "none";
    if (infoWrap) infoWrap.style.display = "none";
    if (relWrap) relWrap.style.display = "none";
  }
}

// Eksekusi muat data awal
load();


  function toggleSeriesMobile(){

document
.getElementById(
"mobileSeries"
)
.classList
.toggle(
"show"
);

}
