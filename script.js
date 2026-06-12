const KEY = "b3b893873ed1bb7f175b2707afeea2a0";

let page = 1;
let mode = "movie";
let query = "";
let timer;
let localDB = [];

/* ELEMENT */
const slider = document.getElementById("slider");
const grid = document.getElementById("movieGrid");
const pagination = document.getElementById("pagination");
const search = document.getElementById("search");
const mobileSearch = document.getElementById("mobileSearch");
const topBtn = document.getElementById("topBtn");

/* LOAD LOCAL DB */
fetch("movies.json")
  .then(r => r.json())
  .then(d => {
    localDB = d;
    loadMovies();
  });

/* =======================
   INDEX SYSTEM (TMDB + MARK)
======================= */

async function loadMovies() {
  if (!grid) return;

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

  // MARK LOCAL MATCH
  results.forEach(r => {
    r._local = localDB.find(l => String(l.tmdb_id) === String(r.id));
  });

  renderHero(results[0]);
  renderGrid(results);
  renderPagination(Math.min(data.total_pages || 1, 500));
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

/* GRID */
function renderGrid(data) {
  if (!grid) return;
  grid.innerHTML = "";

  data.forEach(m => {
    if (!m.poster_path) return;

    const badge = m._local ? "WEBP" : (mode === "tv" ? "SERIES" : "MOVIE");

    grid.innerHTML += `
      <div class="card" onclick="goWatch('${m.id}','${m.title || m.name}')">
        <div class="badge">${badge}</div>
        <img src="https://image.tmdb.org/t/p/w500${m.poster_path}">
        <h3>${m.title || m.name}</h3>
      </div>
    `;
  });
}

/* NAV TO WATCH */
function goWatch(id, title) {
  location.href = `watch.html?id=${id}&title=${encodeURIComponent(title || "")}`;
}

/* PAGINATION */
function renderPagination(total) {
  if (!pagination) return;

  let html = "";
  const group = 6;

  const start = Math.floor((page - 1) / group) * group + 1;
  const end = Math.min(start + group - 1, total);

  if (start > 1)
    html += `<button onclick="goto(${start - group})">&lt;</button>`;

  for (let i = start; i <= end; i++) {
    html += `<button onclick="goto(${i})" class="${i === page ? "active" : ""}">${i}</button>`;
  }

  if (end < total)
    html += `<button onclick="goto(${end + 1})">&gt;</button>`;

  pagination.innerHTML = html;
}

function goto(p) {
  page = p;
  window.scrollTo({ top: 0, behavior: "smooth" });
  loadMovies();
}

/* SEARCH */
search?.addEventListener("input", e => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    query = e.target.value;
    page = 1;
    loadMovies();
  }, 400);
});

mobileSearch?.addEventListener("input", e => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    query = e.target.value;
    page = 1;
    loadMovies();
  }, 400);
});

/* WATCH INIT */
const urlParams = new URLSearchParams(location.search);
const id = urlParams.get("id");
const titleParam = urlParams.get("title");

/* FIND LOCAL DATA */
function getLocalMovie(id) {
  return localDB.find(m => String(m.tmdb_id) === String(id));
}

/* INIT WATCH */
if (document.getElementById("heroPlayer")) {
  initWatch();
}

/* WATCH ENGINE */
async function initWatch() {
  const container = document.getElementById("heroPlayer");
  const info = document.getElementById("infoBox");

  const local = getLocalMovie(id);

  let data = local;

  // fallback jika tidak ada local data
  if (!data) {
    data = {
      tmdb_id: id,
      title: titleParam || "Unknown",
      iframe: "",
      sinopsis: "",
      genre: [],
      release_date: "",
      country: ""
    };
  }

  renderInfo(data);
  runPlayer(data);
  loadRelated(id);
}

/* PLAYER LOGIC (INTI 6 DETIK SYSTEM) */
function runPlayer(m) {
  const el = document.getElementById("heroPlayer");

  let finalSrc = "";

  // PRIORITY 1: iframe manual
  if (m.iframe && m.iframe.trim() !== "") {
    finalSrc = m.iframe;
  }

  // PRIORITY 2: VSEmbed fallback
  else {
    finalSrc = `https://vsembed.ru/embed/movie?tmdb=${m.tmdb_id}`;
  }

  el.innerHTML = `
    <div class="player-wrapper">
      
      <!-- LAYER 1: SEGERA DIMULAI -->
      <div id="layer1" class="splash-screen"></div>

      <!-- LAYER 2: SPONSOR -->
      <div id="layer2" class="hidden-layer"></div>

      <!-- PLAYER -->
      <iframe id="player" src="" allowfullscreen></iframe>

    </div>
  `;

  const layer1 = document.getElementById("layer1");
  const layer2 = document.getElementById("layer2");
  const player = document.getElementById("player");

  /* LOAD SPLASH 3 DETIK */
  setTimeout(() => {
    layer1.classList.add("fade-out");
  }, 3000);

  /* SHOW SPONSOR LAYER */
  setTimeout(() => {
    layer1.style.display = "none";
    layer2.style.display = "block";
  }, 3000);

  /* SPONSOR CLICK */
  let clicked = false;

  layer2.onclick = () => {
    if (!clicked) {
      clicked = true;
      window.open(
        ["https://rajarayap.com","https://caturbangunsentosa.blogspot.com","https://ptdwiprima.blogspot.com"]
        [Math.floor(Math.random()*3)],
        "_blank"
      );
    }
  };

  /* AUTO ENTER PLAYER AFTER 6s */
  setTimeout(() => {
    layer2.style.display = "none";
    player.src = finalSrc;
  }, 6000);
}

/* INFO BOX */

function renderInfo(m) {
  const el = document.getElementById("infoBox");

  if (!el) return;

  el.innerHTML = `
    <h2>${m.title}</h2>
    <div>
      <span class="badge">${(m.genre || []).join(", ")}</span>
      <span class="badge">${m.release_date || "-"}</span>
      <span class="badge">${m.country || "-"}</span>
    </div>
    <p>${m.sinopsis || "No description available"}</p>
  `;
}

/* RELATED SYSTEM (12 ITEM) */
async function loadRelated() {
  const url = mode === "tv"
    ? `https://api.themoviedb.org/3/tv/${id}/similar?api_key=${KEY}`
    : `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  renderRelated(data.results || []);
}

function renderRelated(list) {
  const el = document.getElementById("relGrid");
  if (!el) return;

  el.innerHTML = "";

  list.slice(0, 12).forEach(m => {
    if (!m.poster_path) return;

    el.innerHTML += `
      <div class="relCard" onclick="goWatch('${m.id}','${m.title || m.name}')">
        <img src="https://image.tmdb.org/t/p/w300${m.poster_path}">
        <div>${m.title || m.name}</div>
      </div>
    `;
  });
}

