script.js

const KEY = "b3b893873ed1bb7f175b2707afeea2a0";

let page = 1;
let mode = "movie";
let query = "";
let timer;
let postedIds = new Set();

/* ELEMENTS */
const slider = document.getElementById("slider");
const grid = document.getElementById("movieGrid");
const pagination = document.getElementById("pagination");
const search = document.getElementById("search");
const mobileSearch = document.getElementById("mobileSearch");
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const topBtn = document.getElementById("topBtn");

/* MOBILE MENU */
burger?.addEventListener("click", () => {
  if (!mobileMenu) return;
  mobileMenu.style.display =
    mobileMenu.style.display === "flex" ? "none" : "flex";
});

/* TOP BUTTON */
window.addEventListener("scroll", () => {
  if (topBtn) {
    topBtn.style.display = window.scrollY > 500 ? "block" : "none";
  }
});

topBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* LOAD INDEX */
async function loadMovies() {
  if (!grid) return;

  if (postedIds.size === 0) {
    try {
      const localMovies =
        await fetch("movies.json")
        .then(r => r.json());

      postedIds =
        new Set(
          localMovies.map(
            m => Number(m.tmdb_id)
          )
        );

      console.log("MATCH IDS:", postedIds.size);
      
    } catch (e) {
      console.log("movies.json gagal dimuat");
    }
  }

  grid.innerHTML = `<div class="loading">Loading...</div>`;

  let url = "";

  if (query) {
    url = `https://api.themoviedb.org/3/search/${mode}?api_key=${KEY}&query=${encodeURIComponent(query)}&page=${page}`;
  } else {
    url = `https://api.themoviedb.org/3/discover/${mode}?api_key=${KEY}&sort_by=popularity.desc&page=${page}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  const results = data.results || [];

  results.sort((a, b) => {

    const aMatch =
      postedIds.has(Number(a.id));

    const bMatch =
      postedIds.has(Number(b.id));

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;

    return 0;
  });

  renderHero(results?.[0]);
  renderGrid(results);
  renderPagination(
    Math.min(data.total_pages || 1, 500)
  );
}

/* HERO */
function renderHero(m) {
  if (!slider || !m) return;

  slider.innerHTML = `
  <div style="width:100%;height:100%;
  background:linear-gradient(to top,rgba(0,0,0,.9),transparent),
  url(https://image.tmdb.org/t/p/original${m.backdrop_path});
  background-size:cover;background-position:center;
  display:flex;align-items:end;padding:30px;">
  <div>
  <h1>${m.title || m.name}</h1>
  <p>${m.overview || ""}</p>
  </div>
  </div>
  `;
}

/* GRID (LOCK FIX ONLY) */
function renderGrid(data) {
  if (!grid) return;

  grid.innerHTML = "";

  data.forEach(m => {
    if (!m.poster_path) return;

    grid.innerHTML += `
      <div class="card" onclick="goWatch('${m.id}', \`${m.title || m.name}\`)">
        <img src="https://image.tmdb.org/t/p/w500${m.poster_path}">
        <h3>${m.title || m.name}</h3>
      </div>
    `;
  });
}

/* NAV (LOCK FIX ONLY) */
function goWatch(id, title) {
  location.href =
    `watch.html?id=${encodeURIComponent(id)}&title=${encodeURIComponent(title || "")}`;
}

/* PAGINATION */
function renderPagination(total) {
  if (!pagination) return;

  let html = "";
  const group = 6;

  const start = Math.floor((page - 1) / group) * group + 1;
  const end = Math.min(start + group - 1, total);

  if (start > 1) html += `<button onclick="goto(${start - group})">&lt;</button>`;

  for (let i = start; i <= end; i++) {
    html += `<button onclick="goto(${i})" class="${i === page ? "active" : ""}">${i}</button>`;
  }

  if (end < total) html += `<button onclick="goto(${end + 1})">&gt;</button>`;

  pagination.innerHTML = html;
}

function goto(p) {
  page = p;
  window.scrollTo({ top: 0, behavior: "smooth" });
  loadMovies();
}

/* SEARCH */
search?.addEventListener("keyup", e => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    query = e.target.value;
    page = 1;
    loadMovies();
  }, 400);
});

mobileSearch?.addEventListener("keyup", e => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    query = e.target.value;
    page = 1;
    loadMovies();
  }, 400);
});

/* MODE SWITCH */
document.getElementById("moviesBtn")?.addEventListener("click", () => {
  mode = "movie";
  query = "";
  page = 1;
  loadMovies();
});

document.getElementById("seriesBtn")?.addEventListener("click", () => {
  mode = "tv";
  query = "";
  page = 1;
  loadMovies();
});

/* ADS SYSTEM (NO CHANGE) */
const ads = [
  "https://rajarayap.com",
  "https://caturbangunsentosa.blogspot.com",
  "https://ptdwiprima.blogspot.com"
];

let adsState = false;

/* PLAY LAYER ADS */
const playLayer = document.getElementById("playLayer");

if (playLayer) {
  playLayer.onclick = function () {
    if (!adsState) {
      adsState = true;
      window.open(ads[Math.floor(Math.random() * ads.length)], "_blank");
      return;
    }

    this.style.display = "none";

    const id = new URLSearchParams(location.search).get("id");

    document.getElementById("player").src =
      `https://vsembed.ru/embed/movie?tmdb=${id}`;
  };
}

/* DETAIL PAGE (UNCHANGED) */
async function loadDetail() {
  const id = new URLSearchParams(location.search).get("id");

  let m = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}&language=id-ID`
  ).then(r => r.json());

  if (!m.overview) {
    const backup = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}`
    ).then(r => r.json());

    m.overview = backup.overview;
  }

  document.getElementById("info").innerHTML = `
    <h2>${m.title}</h2>
    <p>⭐ Rating : ${m.vote_average.toFixed(1)}</p>
    <p>📅 Rilis : ${m.release_date || "-"}</p>
    <p>🌍 Negara : ${(m.production_countries || []).map(c => c.name).join(", ")}</p>
    <p>🎭 Genre : ${(m.genres || []).map(g => g.name).join(", ")}</p>
    <p style="margin-top:15px;line-height:1.7;opacity:.9;">
      ${m.overview || "Sinopsis tidak tersedia"}
    </p>
  `;
}

/* OVERLAY SEARCH (UNCHANGED) */
let overlayPage = 1;
let overlayMode = "";
let currentQuery = "";

async function loadOverlay() {
  const id = new URLSearchParams(location.search).get("id");

  let url = "";

  if (overlayMode === "search") {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${encodeURIComponent(currentQuery)}&page=${overlayPage}`;
  }

  if (overlayMode === "local") {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_origin_country=ID&page=${overlayPage}`;
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
      <div class="card" onclick="goWatch('${v.id}')">
        <img src="https://image.tmdb.org/t/p/w500${v.poster_path}">
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
    h += `<button onclick="changeOverlayPage(${i})"
    style="padding:8px 14px;background:${i===page?'#ff2e2e':'#1a1a22'};color:#fff;border:none;border-radius:8px;">
    ${i}</button>`;
  }

  if (page < total) {
    h += `<button onclick="changeOverlayPage(${page + 1})">›</button>`;
  }

  el.innerHTML = h;
}

function changeOverlayPage(p) {
  overlayPage = p;
  loadOverlay();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* BOOT */
loadMovies();
