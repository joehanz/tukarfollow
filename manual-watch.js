const movieId = new URLSearchParams(location.search).get("movie");
const KEY = "b3b893873ed1bb7f175b2707afeea2a0"; // Disamakan dengan KEY script.js agar bisa akses TMDB

const ads = [
  "https://rajarayap.com",
  "https://ptdwiprima.blogspot.com",
  "https://caturbangunsentosa.blogspot.com"
];

let movies = [];
let movie = null;
let adsState = false;

/* OVERLAY STATE (DISAMAKAN DENGAN SCRIPT.JS) */
let overlayPage = 1;
let overlayMode = "";
let currentQuery = "";

/* BURGER */
function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) {
    menu.classList.toggle("show");
  }
}

/* LOAD JSON */
async function load() {
  const res = await fetch("movies.json");
  movies = await res.json();
  movie = movies[movieId];
  loadMovie();
}

/* LOAD MOVIE */
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

    <!-- TOMBOL VERSI ORISINIL MENGARAH KE WATCH.HTML SESUAI GRID INDEX -->
    <div style="margin:20px 0 15px 0; padding:14px; border-radius:12px; background:#111; border:1px solid rgba(255,255,255,.08);">
      <a href="javascript:void(0);" onclick="history.back();" style="color:gold; font-weight:bold; text-decoration:none; display:inline-block;">
        🎬 Versi Orisinal
      </a>
    </div>
  `;

  renderRelated();
}

/* PLAYER (SUDAH DIPERBAIKI: ACAK & SATU NEWTAB) */
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

/* RELATED */
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
  const rel = document.getElementById("rel");
  if (!rel) return;
  rel.scrollBy({
    left: dir * 300,
    behavior: "smooth"
  });
}

function go(i) {
  location.href = `manual-watch.html?movie=${i}`;
}

/* ========================================================
   FUNGSI PENCARIAN & OVERLAY TMDB (SAMA SEPERTI SCRIPT.JS)
   ======================================================== */

async function loadOverlay() {
  let url = "";

  if (overlayMode === "search") {
    url = `https://themoviedb.org{KEY}&query=${encodeURIComponent(currentQuery)}&page=${overlayPage}`;
  }

  if (overlayMode === "local") {
    url = `https://themoviedb.org{KEY}&with_origin_country=ID&page=${overlayPage}`;
  }

  const data = await fetch(url).then(r => r.json());
  showOverlay(data.results);
  renderOverlayPagination(data.page, data.total_pages);
}

function showOverlay(data) {
  const overlay = document.getElementById("overlay");
  if (!overlay) return;

  overlay.style.display = "block";
  let h = "";

  data.forEach(v => {
    if (!v.poster_path) return;
    h += `
      <div class="card" onclick="goWatch(${v.id})">
        <img src="https://tmdb.org{v.poster_path}">
        <div class="title">${v.title || v.name}</div>
      </div>
    `;
  });

  document.getElementById("overlayGrid").innerHTML = h;
}

function renderOverlayPagination(page, total) {
  const el = document.getElementById("overlayPagination");
  if (!el) return;

  let h = "";
  let start = Math.max(1, page - 2);
  let end = Math.min(total, start + 5);

  for (let i = start; i <= end; i++) {
    h += `
      <button onclick="changeOverlayPage(${i})" style="padding:8px 14px; border:none; border-radius:8px; cursor:pointer; background:${i === page ? '#ff2e2e' : '#1a1a22'}; color:#fff; margin:2px;">
        ${i}
      </button>
    `;
  }

  if (page < total) {
    h += `
      <button onclick="changeOverlayPage(${page + 1})" style="padding:8px 14px; border:none; border-radius:8px; cursor:pointer; background:#1a1a22; color:#fff; margin:2px;">
        ›
      </button>
    `;
  }

  el.innerHTML = h;
}

function changeOverlayPage(p) {
  overlayPage = p;
  loadOverlay();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function searchMovie() {
  const input = document.getElementById("search");
  if (!input) return;

  const val = input.value;
  if (!val.trim()) return;

  currentQuery = val;
  overlayMode = "search";
  overlayPage = 1;
  loadOverlay();
}

function searchMovieMobile() {
  const input = document.querySelector("#mobileMenu input");
  if (!input) return;

  const val = input.value;
  if (!val.trim()) return;

  currentQuery = val;
  overlayMode = "search";
  overlayPage = 1;
  loadOverlay();
}

function loadLocal() {
  overlayMode = "local";
  overlayPage = 1;
  loadOverlay();
}

// Fungsi bantu saat film hasil cari di klik, dia langsung lompat ke halaman watch.html berbasis TMDB ID
function goWatch(tmdbId) {
  location.href = `watch.html?id=${tmdbId}`;
}

load();
