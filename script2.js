const KEY = "b3b893873ed1bb7f175b2707afeea2a0";

// =====================
// DETECT PAGE
// =====================
const isWatch = location.pathname.includes("watch2");

// =====================
// INDEX ELEMENTS
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
// WATCH ELEMENTS
// =====================
const playerBox = document.getElementById("playerBox");
const judul = document.getElementById("judul");
const sinopsis = document.getElementById("sinopsis");
const meta = document.getElementById("meta");
const recommend = document.getElementById("recommendGrid");

// =====================
let page = 1;
let mode = "movie";
let query = "";
let timer;

// =====================
// MOBILE MENU
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
// INDEX LOAD
// =====================
async function loadMovies() {
if (!grid) return;

try {
grid.innerHTML = `<div class="loading">Loading Movie...</div>`;

let url = "";

if (query) {
url = `https://api.themoviedb.org/3/search/${mode}?api_key=${KEY}&query=${encodeURIComponent(query)}&page=${page}`;
} else {
url = `https://api.themoviedb.org/3/discover/${mode}?api_key=${KEY}&sort_by=popularity.desc&page=${page}`;
}

const res = await fetch(url);
const data = await res.json();

renderHero(data.results?.[0]);
renderMovies(data.results || []);
renderPagination(Math.min(data.total_pages, 500));

} catch (err) {
grid.innerHTML = `<div class="loading">Gagal memuat film</div>`;
}
}

// =====================
// HERO
// =====================
function renderHero(movie) {
if (!slider || !movie) return;

const title = movie.title || movie.name;

slider.innerHTML = `
<div style="
width:100%;
height:100%;
background:
linear-gradient(to top,rgba(0,0,0,.9),transparent),
url(https://image.tmdb.org/t/p/original${movie.backdrop_path});
background-size:cover;
background-position:center;
display:flex;
align-items:end;
padding:30px;">
<div>
<h1>${title}</h1>
<p>${movie.overview || ""}</p>
</div>
</div>
`;
}

// =====================
// INDEX GRID
// =====================
function renderMovies(items) {
if (!grid) return;

grid.innerHTML = "";

items
.filter(m => m.poster_path)
.forEach(movie => {

const title = movie.title || movie.name || "Untitled";

grid.innerHTML += `
<div class="card"
onclick="goWatch('${encodeURIComponent(title)}')">
<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
<h3>${title}</h3>
</div>
`;

});
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

if (start > 1) {
html += `<button onclick="gotoPage(${start - group})">&lt;</button>`;
}

for (let i = start; i <= end; i++) {
html += `<button class="${i === page ? "active" : ""}" onclick="gotoPage(${i})">${i}</button>`;
}

if (end < total) {
html += `<button onclick="gotoPage(${end + 1})">&gt;</button>`;
}

pagination.innerHTML = html;
}

// =====================
// NAV FUNCTIONS
// =====================
function gotoPage(p) {
page = p;
window.scrollTo({ top: 0, behavior: "smooth" });
loadMovies();
}

function doSearch(value) {
clearTimeout(timer);
timer = setTimeout(() => {
query = value;
page = 1;
loadMovies();
}, 500);
}

search?.addEventListener("keyup", e => doSearch(e.target.value));
mobileSearch?.addEventListener("keyup", e => doSearch(e.target.value));

// =====================
// BUTTON MODE
// =====================
document.getElementById("moviesBtn")?.addEventListener("click", e => {
e.preventDefault();
mode = "movie";
query = "";
page = 1;
loadMovies();
});

document.getElementById("seriesBtn")?.addEventListener("click", e => {
e.preventDefault();
mode = "tv";
query = "";
page = 1;
loadMovies();
});

document.getElementById("mobileMovies")?.addEventListener("click", e => {
e.preventDefault();
mode = "movie";
query = "";
page = 1;
loadMovies();
});

document.getElementById("mobileSeries")?.addEventListener("click", e => {
e.preventDefault();
mode = "tv";
query = "";
page = 1;
loadMovies();
});

// =====================
// GO WATCH
// =====================
function goWatch(title) {
location.href = `watch2.html?title=${title}`;
}

// =====================
// WATCH MODE
// =====================
async function loadWatch() {
if (!playerBox) return;

const title = new URLSearchParams(location.search).get("title") || "";

try {
const data = await fetch(
"https://raw.githubusercontent.com/joehanz/csstukarfollow/main/movies.json?v=" + Date.now()
).then(r => r.json());

let movie = null;
let best = 0;

data.forEach(m => {
const score = similarity(title, m.title);
if (score > best) {
best = score;
movie = m;
}
});

if (best < 0.8) movie = null;

if (movie) {

judul.textContent = movie.title;
sinopsis.textContent = movie.sinopsis || "Sinopsis belum tersedia";

meta.innerHTML = `
<span class="tag">${movie.release_date || "-"}</span>
<span class="tag">${movie.country || "-"}</span>
${(movie.genre || []).map(g => `<span class="tag">${g}</span>`).join("")}
`;

playerBox.innerHTML = movie.iframe
? `<iframe src="${movie.iframe}" allowfullscreen></iframe>`
: `<div class="notfound">🎬 Video belum diupload</div>`;

} else {

judul.textContent = title || "Film";
sinopsis.textContent = "Film tidak tersedia di database.";

playerBox.innerHTML = `<div class="notfound">🎬 Video belum diupload</div>`;
}

renderRecommend(data);

} catch (e) {
playerBox.innerHTML = `<div class="notfound">⚠️ Gagal load data</div>`;
}
}

// =====================
// RECOMMEND
// =====================
function renderRecommend(data) {
if (!recommend) return;

recommend.innerHTML = "";

data.slice(0, 8).forEach(movie => {

const div = document.createElement("div");
div.className = "card";

div.innerHTML = `
<img src="${movie.image}">
<h3>${movie.title}</h3>
`;

div.onclick = () => {
location.href = `watch2.html?title=${encodeURIComponent(movie.title)}`;
};

recommend.appendChild(div);

});
}

// =====================
// MATCH ENGINE
// =====================
function cleanText(t) {
return (t || "")
.toLowerCase()
.replace(/\(\d+\)/g, "")
.replace(/[^\w\s]/g, "")
.replace(/\s+/g, " ")
.trim();
}

function similarity(a, b) {
a = cleanText(a);
b = cleanText(b);
if (!a || !b) return 0;

const A = [...new Set(a.split(" "))];
const B = new Set(b.split(" "));

let same = 0;
A.forEach(w => { if (B.has(w)) same++; });

return same / Math.max(A.length, 1);
}

// =====================
// INIT
// =====================
if (isWatch) {
loadWatch();
} else {
loadMovies();
}
