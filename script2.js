const KEY = "b3b893873ed1bb7f175b2707afeea2a0";

let page = 1;
let mode = "movie";
let query = "";
let timer;

// =====================
// ELEMENTS
// =====================
const slider = document.getElementById("slider");
const grid = document.getElementById("movieGrid");
const pagination = document.getElementById("pagination");
const search = document.getElementById("search");
const mobileSearch = document.getElementById("mobileSearch");
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const topBtn = document.getElementById("topBtn");

// =====================
// NAV MOBILE
// =====================
burger?.addEventListener("click", () => {
if (!mobileMenu) return;
mobileMenu.style.display =
mobileMenu.style.display === "flex" ? "none" : "flex";
});

// =====================
// TOP BUTTON
// =====================
window.addEventListener("scroll", () => {
if (topBtn) {
topBtn.style.display = window.scrollY > 500 ? "block" : "none";
}
});

topBtn?.addEventListener("click", () => {
window.scrollTo({ top: 0, behavior: "smooth" });
});

// =====================
// LOAD TMDB INDEX
// =====================
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

renderHero(data.results?.[0]);
renderGrid(data.results || []);
renderPagination(Math.min(data.total_pages || 1, 500));
}

// =====================
// HERO
// =====================
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

// =====================
// GRID (ONLY LINK TO MASTER WATCH)
// =====================
function renderGrid(data) {
if (!grid) return;

grid.innerHTML = "";

data.forEach(m => {
if (!m.poster_path) return;

grid.innerHTML += `
<div class="card" onclick="goWatch(${m.id})">
<img src="https://image.tmdb.org/t/p/w500${m.poster_path}">
<h3>${m.title || m.name}</h3>
</div>
`;
});
}

// =====================
// ROUTE TO MASTER WATCH ONLY
// =====================
function goWatch(id) {
location.href = `watch.html?id=${id}`;
}

// =====================
// PAGINATION
// =====================
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

// =====================
// SEARCH
// =====================
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

// =====================
// MODE SWITCH
// =====================
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

// =====================
// INIT
// =====================
loadMovies();
