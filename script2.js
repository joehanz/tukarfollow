const KEY = "b3b893873ed1bb7f175b2707afeea2a0";

// =====================
// TRIAL STATE
// =====================
let page = 1;
let mode = "movie";
let query = "";
let timer;

let MOVIES_DB = [];

// =====================
// ELEMENTS INDEX
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
// ELEMENTS WATCH
// =====================
const playerBox = document.getElementById("playerBox");
const judul = document.getElementById("judul");
const sinopsis = document.getElementById("sinopsis");
const meta = document.getElementById("meta");
const recommend = document.getElementById("recommendGrid");

// =====================
// INIT JSON DB (TRIAL ONLY)
// =====================
fetch("movies.json")
.then(r => r.json())
.then(data => {
MOVIES_DB = data;
bootTrial();
});

// =====================
// BOOT DECISION
// =====================
function bootTrial() {
if (document.getElementById("playerBox")) {
initWatchTrial();
} else {
loadIndex();
}
}

// =====================
// INDEX MODE
// =====================
async function loadIndex() {
if (!grid) return;

try {

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
renderPagination(Math.min(data.total_pages, 500));

} catch (e) {
grid.innerHTML = `<div class="loading">Error load</div>`;
}

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
// GRID
// =====================
function renderGrid(data) {
if (!grid) return;

grid.innerHTML = "";

data.forEach(m => {
if (!m.poster_path) return;

const title = m.title || m.name;

grid.innerHTML += `
<div class="card" onclick="goWatch('${encodeURIComponent(title)}')">
<img src="https://image.tmdb.org/t/p/w500${m.poster_path}">
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

if (start > 1) html += `<button onclick="goPage(${start - group})">&lt;</button>`;

for (let i = start; i <= end; i++) {
html += `<button onclick="goPage(${i})" class="${i===page?'active':''}">${i}</button>`;
}

if (end < total) html += `<button onclick="goPage(${end + 1})">&gt;</button>`;

pagination.innerHTML = html;
}

function goPage(p) {
page = p;
window.scrollTo({top:0,behavior:"smooth"});
loadIndex();
}

// =====================
// SEARCH
// =====================
search?.addEventListener("keyup", e => {
clearTimeout(timer);
timer = setTimeout(() => {
query = e.target.value;
page = 1;
loadIndex();
}, 400);
});

mobileSearch?.addEventListener("keyup", e => {
clearTimeout(timer);
timer = setTimeout(() => {
query = e.target.value;
page = 1;
loadIndex();
}, 400);
});

// =====================
// MODE SWITCH
// =====================
document.getElementById("moviesBtn")?.addEventListener("click", () => {
mode = "movie"; query=""; page=1; loadIndex();
});

document.getElementById("seriesBtn")?.addEventListener("click", () => {
mode = "tv"; query=""; page=1; loadIndex();
});

// =====================
// NAV MENU
// =====================
burger?.addEventListener("click", () => {
if (!mobileMenu) return;
mobileMenu.style.display =
mobileMenu.style.display === "flex" ? "none" : "flex";
});

// =====================
// GO WATCH
// =====================
function goWatch(title) {
location.href = `watch2.html?title=${title}`;
}

// =====================
// WATCH INIT (ISOLATED)
// =====================
function initWatchTrial() {

const raw = new URLSearchParams(location.search).get("title") || "";
const title = decodeURIComponent(raw);

loadWatchTrial(title);

}

// =====================
// WATCH ENGINE (PURE JSON ONLY)
// =====================
function loadWatchTrial(title) {

if (!playerBox) return;

let best = 0;
let found = null;

MOVIES_DB.forEach(m => {
const score = similarity(title, m.title);
if (score > best) {
best = score;
found = m;
}
});

if (best < 0.65) found = null;

// FOUND
if (found) {

judul.textContent = found.title;
sinopsis.textContent = found.sinopsis || "No synopsis";

meta.innerHTML = `
<span class="tag">${found.release_date || "-"}</span>
<span class="tag">${found.country || "-"}</span>
${(found.genre || []).map(g => `<span class="tag">${g}</span>`).join("")}
`;

playerBox.innerHTML = found.iframe
? `<iframe src="${found.iframe}" allowfullscreen></iframe>`
: `<div class="notfound">🎬 Video belum tersedia</div>`;

} else {

judul.textContent = title || "Not Found";
sinopsis.textContent = "Film tidak ada di database.";
meta.innerHTML = "";

playerBox.innerHTML = `<div class="notfound">🎬 Video belum tersedia</div>`;
}

// RELATED (TMDB ONLY)
loadRelatedTrial(title);

}

// =====================
// RELATED (SAFE TMDB)
// =====================
async function loadRelatedTrial(title) {

if (!recommend) return;

recommend.innerHTML = `<div class="loading">Loading...</div>`;

try {

const url = `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${encodeURIComponent(title)}`;

const res = await fetch(url);
const data = await res.json();

recommend.innerHTML = "";

(data.results || [])
.filter(m => m.poster_path)
.slice(0, 8)
.forEach(m => {

const div = document.createElement("div");
div.className = "card";

div.innerHTML = `
<img src="https://image.tmdb.org/t/p/w500${m.poster_path}">
<h3>${m.title}</h3>
`;

div.onclick = () => {
location.href = `watch2.html?title=${encodeURIComponent(m.title)}`;
};

recommend.appendChild(div);

});

} catch (e) {
recommend.innerHTML = `<div class="loading">Error related</div>`;
}

}

// =====================
// MATCH ENGINE
// =====================
function cleanText(t) {
return (t || "")
.toLowerCase()
.replace(/\(\d+\)/g,"")
.replace(/[^\w\s]/g,"")
.replace(/\s+/g," ")
.trim();
}

function similarity(a,b) {

a = cleanText(a);
b = cleanText(b);

if (!a || !b) return 0;

const A = [...new Set(a.split(" "))];
const B = new Set(b.split(" "));

let same = 0;

A.forEach(w=>{
if (B.has(w)) same++;
});

return same / Math.max(A.length,1);
}
