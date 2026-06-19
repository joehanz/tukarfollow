/* ==========================================
   CONFIG
========================================== */

const IMG_BASE =
"https://image.tmdb.org/t/p/w500";

let currentPage = 1;
let currentGenre = "";
let currentYear = "";
let currentKeyword = "";

let genresLoaded = false;
let genreMap = {};

let overlayTimer = null;
let currentBannerUrl = "";

/* ==========================================
   URL PARAMS
========================================== */

const params =
new URLSearchParams(
window.location.search
);

const tmdbId =
params.get("id");

const mediaType =
params.get("type");

/* ==========================================
   HELPERS
========================================== */

function qs(el){
return document.querySelector(el);
}

function safe(v){
return v || "";
}

function isWatchPage(){
return !!document.getElementById(
"playerFrame"
);
}

function showWatchOverlay(){
const ov=
document.getElementById(
"watchSearchOverlay"
);

if(!ov) return;

ov.classList.remove(
"hidden"
);

document.body.classList.add(
"overlay-open"
);
}

function hideWatchOverlay(){

const ov=
document.getElementById(
"watchSearchOverlay"
);

if(!ov) return;

ov.classList.add(
"hidden"
);

document.body.classList.remove(
"overlay-open"
);

}


function isIndexPage(){
return !!document.getElementById(
"movieGrid"
);
}

async function loadFeaturedHero(){

const hero =
document.getElementById(
"featuredHero"
);

if(!hero) return;

try{

const req =
await fetch(MOVIES_JSON);

const movies =
await req.json();

if(!movies.length) return;

const movie =
movies[0];

hero.style.backgroundImage =
`url(${movie.image})`;

document.getElementById(
"featuredTitle"
).textContent =
movie.title || "";

document.getElementById(
"featuredOverview"
).textContent =
movie.sinopsis || "";

document.getElementById(
"featuredButton"
).href =
`watch.html?id=${movie.tmdb_id}&type=movie`;

}
catch(err){

console.log(err);

}

}
/* ==========================================
   MOBILE MENU
========================================== */

function initMobileMenu(){

const btn =
document.getElementById(
"burgerBtn"
);

const menu =
document.getElementById(
"mobileMenu"
);

if(!btn || !menu) return;

btn.addEventListener(
"click",
()=>{

menu.classList.toggle(
"active"
);

btn.classList.toggle(
"active"
);

btn.textContent =
menu.classList.contains("active")
? "✕"
: "☰";

}
);

}

/* ==========================================
   GENRES
========================================== */

async function loadGenres(){

if(genresLoaded) return;

const desktop =
document.getElementById(
"genreSelect"
);

const mobile =
document.getElementById(
"genreSelectMobile"
);

if(!desktop || !mobile){
return;
}

try{

const req =
await fetch(
`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API}&language=id-ID`
);

const data =
await req.json();

(data.genres || [])
.forEach(g=>{

genreMap[g.id] =
g.name;

desktop.insertAdjacentHTML(
"beforeend",
`
<option value="${g.id}">
${g.name}
</option>
`
);

mobile.insertAdjacentHTML(
"beforeend",
`
<option value="${g.id}">
${g.name}
</option>
`
);

});

genresLoaded = true;

}
catch(err){

console.log(err);

}

}

/* ==========================================
   YEAR FILTER
========================================== */

function buildYearFilter(){

if(currentYear==="2026"){
return "&primary_release_year=2026";
}

if(currentYear==="2025"){
return "&primary_release_year=2025";
}

if(currentYear==="2024"){
return "&primary_release_year=2024";
}

if(currentYear==="classic"){
return "&primary_release_date.lte=2010-12-31";
}

return "";

}

/* ==========================================
   CARD
========================================== */

function createCard(
item,
type
){

const title =
item.title ||
item.name ||
"Untitled";

const release =
item.release_date ||
item.first_air_date ||
"-";

const poster =
item.poster_path
?
IMG_BASE + item.poster_path
:
"https://via.placeholder.com/500x750";

return `
<div class="movie-card">

<a href="watch.html?id=${item.id}&type=${type}">

<img
src="${poster}"
loading="lazy"
alt="${title}"
>

<div class="movie-card-info">

<h3>${title}</h3>

<span>${release}</span>

</div>

</a>

</div>
`;

}

/* ==========================================
   PAGINATION
========================================== */

function buildPagination(){

const wrap =
document.getElementById(
"paginationNumbers"
);

if(!wrap) return;

wrap.innerHTML = "";

const start =
(Math.floor(
(currentPage - 1) / 5
) * 5) + 1;

for(
let i=start;
i<start+5;
i++
){

const btn =
document.createElement(
"button"
);

btn.className =
"page-btn";

if(i===currentPage){
btn.classList.add(
"active"
);
}

btn.textContent = i;

btn.onclick = ()=>{

currentPage = i;

loadDiscover();

};

wrap.appendChild(btn);

}

}

async function loadWatchSearch(){

const grid =
document.getElementById(
"watchSearchGrid"
);

if(!grid) return;

showWatchOverlay();

grid.innerHTML =
'<div class="loading">Loading...</div>';

try{

console.log("LOAD WATCH SEARCH");
console.log("GENRE =", currentGenre);
console.log("YEAR =", currentYear);
   
let movieUrl =
`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API}&language=id-ID&page=1`;

let tvUrl =
`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API}&language=id-ID&page=1`;

if(currentGenre){

movieUrl +=
`&with_genres=${currentGenre}`;

tvUrl +=
`&with_genres=${currentGenre}`;

}

movieUrl += buildYearFilter();
tvUrl += buildYearFilter();

if(currentKeyword){

movieUrl =
`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API}&language=id-ID&query=${encodeURIComponent(currentKeyword)}`;

tvUrl =
`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API}&language=id-ID&query=${encodeURIComponent(currentKeyword)}`;

}

const movieReq =
await fetch(movieUrl);

const tvReq =
await fetch(tvUrl);

const movieData =
await movieReq.json();

const tvData =
await tvReq.json();

const merged = [];

(movieData.results||[])
.forEach(x=>
merged.push({
...x,
_mediaType:"movie"
})
);

(tvData.results||[])
.forEach(x=>
merged.push({
...x,
_mediaType:"tv"
})
);

let html="";

merged.forEach(item=>{

html += createCard(
item,
item._mediaType
);

});

grid.innerHTML = html;

}
catch(err){

console.log(err);

grid.innerHTML =
'<div class="empty-state">Gagal memuat data</div>';

}
}


/* ==========================================
   PAGINATION BUTTONS
========================================== */

function initPaginationButtons(){

const next =
document.getElementById(
"nextBlock"
);

const prev =
document.getElementById(
"prevBlock"
);

if(next){

next.onclick = ()=>{

currentPage += 5;

loadDiscover();

};

}

if(prev){

prev.onclick = ()=>{

currentPage -= 5;

if(currentPage < 1){
currentPage = 1;
}

loadDiscover();

};

}

}

/* ==========================================
   FILTER EVENTS
========================================== */

function redirectToIndex(){

const keyword =
document.getElementById("searchInput")?.value ||
document.getElementById("searchInputMobile")?.value ||
"";

const genre =
document.getElementById("genreSelect")?.value ||
document.getElementById("genreSelectMobile")?.value ||
"";

const year =
document.getElementById("yearSelect")?.value ||
document.getElementById("yearSelectMobile")?.value ||
"";

window.location =
`index.html?q=${encodeURIComponent(keyword)}&genre=${genre}&year=${year}`;

}

function initFilters(){

const searchDesktop =
document.getElementById(
"searchInput"
);

const searchMobile =
document.getElementById(
"searchInputMobile"
);

const genreDesktop =
document.getElementById(
"genreSelect"
);

const genreMobile =
document.getElementById(
"genreSelectMobile"
);

const yearDesktop =
document.getElementById(
"yearSelect"
);

const yearMobile =
document.getElementById(
"yearSelectMobile"
);

/* ==========================
   SEARCH DESKTOP
========================== */

let searchTimerDesktop;

if(searchDesktop){

searchDesktop.addEventListener(
"input",
()=>{

clearTimeout(
searchTimerDesktop
);

searchTimerDesktop =
setTimeout(()=>{

currentKeyword =
searchDesktop.value.trim();

currentPage = 1;

if(isWatchPage()){
loadWatchSearch();
}else{
loadDiscover();
}

},500);

}
);

}

/* ==========================
   SEARCH MOBILE
========================== */

let searchTimerMobile;

if(searchMobile){

searchMobile.addEventListener(
"input",
()=>{

clearTimeout(
searchTimerMobile
);

searchTimerMobile =
setTimeout(()=>{

currentKeyword =
searchMobile.value.trim();

currentPage = 1;

loadDiscover();

},500);

}
);

}
   
/* ==========================
   GENRE
========================== */

if(genreDesktop){

genreDesktop.onchange=()=>{

currentGenre =
genreDesktop.value;

genreMobile.value =
genreDesktop.value;

currentPage = 1;

if(isWatchPage()){
loadWatchSearch();
}else{
loadDiscover();
}

};

}

if(genreMobile){

genreMobile.onchange=()=>{

currentGenre =
genreMobile.value;

genreDesktop.value =
genreMobile.value;

currentPage = 1;

if(isWatchPage()){
loadWatchSearch();
}else{
loadDiscover();
}

};

}

/* ==========================
   YEAR
========================== */

if(yearDesktop){

yearDesktop.onchange=()=>{

currentYear =
yearDesktop.value;

yearMobile.value =
yearDesktop.value;

currentPage = 1;

if(isWatchPage()){
loadWatchSearch();
}else{
loadDiscover();
}

};

}

if(yearMobile){

yearMobile.onchange=()=>{

currentYear =
yearMobile.value;

yearDesktop.value =
yearMobile.value;

currentPage = 1;

if(isWatchPage()){
loadWatchSearch();
}else{
loadDiscover();
}

};

}

}

/* ==========================================
   DISCOVER MOVIE + TV
========================================== */

async function loadDiscover(){

const grid =
document.getElementById(
"movieGrid"
);

if(!grid) return;

grid.innerHTML =
`
<div class="loading">
Loading...
</div>
`;

try{

let movieUrl =
`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API}&language=id-ID&page=${currentPage}`;

let tvUrl =
`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API}&language=id-ID&page=${currentPage}`;

/* ==========================
   GENRE
========================== */

if(currentGenre){

movieUrl +=
`&with_genres=${currentGenre}`;

tvUrl +=
`&with_genres=${currentGenre}`;

}

/* ==========================
   YEAR
========================== */

movieUrl += buildYearFilter();
tvUrl += buildYearFilter();

/* ==========================
   SEARCH MODE
========================== */

if(currentKeyword){

movieUrl =
`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API}&language=id-ID&query=${encodeURIComponent(currentKeyword)}&page=${currentPage}`;

tvUrl =
`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API}&language=id-ID&query=${encodeURIComponent(currentKeyword)}&page=${currentPage}`;

}

/* ==========================
   FETCH
========================== */

const movieReq =
await fetch(movieUrl);

const tvReq =
await fetch(tvUrl);

const movieData =
await movieReq.json();

const tvData =
await tvReq.json();

const movies =
movieData.results || [];

const tvs =
tvData.results || [];

/* ==========================
   MERGE
========================== */

let merged = [];

movies.forEach(item=>{

merged.push({
...item,
_mediaType:"movie"
});

});

tvs.forEach(item=>{

merged.push({
...item,
_mediaType:"tv"
});

});

/* ==========================
   SORT TERBARU
========================== */

merged.sort(
(a,b)=>{

const da =
new Date(
a.release_date ||
a.first_air_date ||
"1900-01-01"
);

const db =
new Date(
b.release_date ||
b.first_air_date ||
"1900-01-01"
);

return db-da;

}
);

/* ==========================
   RENDER
========================== */

let html = "";

merged.forEach(item=>{

html += createCard(
item,
item._mediaType
);

});

if(!html){

html =
`
<div class="empty-state">
Tidak ada data ditemukan
</div>
`;

}

grid.innerHTML = html;

buildPagination();

}
catch(err){

console.log(err);

grid.innerHTML =
`
<div class="empty-state">
Gagal memuat data
</div>
`;

}

}

/* ==========================================
   WATCH PAGE INIT
========================================== */

async function initWatchPage(){

if(!tmdbId) return;

try{

let manualMovie = null;

/* ==========================
   LOAD MOVIES.JSON
========================== */

const jsonReq =
await fetch(
MOVIES_JSON
);

const jsonData =
await jsonReq.json();

/* ==========================
   MATCH TMDB_ID
========================== */

manualMovie =
jsonData.find(item=>
String(item.tmdb_id) ===
String(tmdbId)
);

/* ==========================
   FALLBACK TITLE MATCH
========================== */

if(!manualMovie){

try{

const detailUrl =
mediaType==="tv"
?
`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API}&language=id-ID`
:
`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API}&language=id-ID`;

const detailReq =
await fetch(detailUrl);

const detail =
await detailReq.json();

const tmdbTitle =
(
detail.title ||
detail.name ||
""
).trim().toLowerCase();

manualMovie =
jsonData.find(item=>
(item.title || "")
.trim()
.toLowerCase()
=== tmdbTitle
);

if(manualMovie){

renderManualMovie(
manualMovie
);

startOverlaySystem();

return;

}

renderTmdbMovie(
detail
);

startOverlaySystem();

return;

}
catch(err){

console.log(err);

}

}

/* ==========================
   MANUAL MATCH
========================== */

if(manualMovie){

renderManualMovie(
manualMovie
);

startOverlaySystem();

return;

}

}
catch(err){

console.log(err);

}

}

/* ==========================================
   RENDER MANUAL MOVIE
========================================== */

function renderManualMovie(
movie
){

const iframe =
document.getElementById(
"playerFrame"
);

const poster =
document.getElementById(
"moviePoster"
);

const title =
document.getElementById(
"movieTitle"
);

const meta =
document.getElementById(
"movieMeta"
);

const overview =
document.getElementById(
"movieOverview"
);

const tvControls =
document.getElementById(
"tvControls"
);

/* ==========================
   PLAYER
========================== */

iframe.src =
movie.iframe || "";

/* ==========================
   INFO
========================== */

poster.src =
movie.image || "";

title.textContent =
movie.title || "";

meta.innerHTML =
`
<span>${safe(movie.country)}</span>
<span>${safe(movie.release_date)}</span>
<span>${Array.isArray(movie.genre) ? movie.genre.join(", ") : ""}</span>
`;

overview.textContent =
movie.sinopsis || "";

/* ==========================
   MOVIE = HIDE TV
========================== */

if(tvControls){

tvControls.classList.add(
"hidden"
);

}

loadRelatedMovies();

}

/* ==========================================
   RENDER TMDB MOVIE / TV
========================================== */

function renderTmdbMovie(
data
){

const iframe =
document.getElementById(
"playerFrame"
);

const poster =
document.getElementById(
"moviePoster"
);

const title =
document.getElementById(
"movieTitle"
);

const meta =
document.getElementById(
"movieMeta"
);

const overview =
document.getElementById(
"movieOverview"
);

const genres =
(data.genres || [])
.map(x=>x.name)
.join(", ");

   
/* ==========================
   PLAYER
========================== */

if(mediaType==="tv"){

iframe.src =
`https://vsembed.ru/embed/tv?tmdb=${tmdbId}&season=1&episode=1`;

}
else{

iframe.src =
`https://vsembed.ru/embed/movie?tmdb=${tmdbId}`;

}

/* ==========================
   POSTER
========================== */

poster.src =
data.poster_path
?
IMG_BASE +
data.poster_path
:
"";

/* ==========================
   TITLE
========================== */

title.textContent =
data.title ||
data.name ||
"";

/* ==========================
   META
========================== */

meta.innerHTML =
`
<span>${
(data.production_countries || [])
.map(x=>x.name)
.join(", ")
}</span>

<span>${
data.release_date ||
data.first_air_date ||
""
}</span>

<span>${genres}</span>
`;

/* ==========================
   OVERVIEW / SINOPSIS
========================== */

overview.textContent =
  data.overview ||
  movie.sinopsis ||
  movie.overview ||
  "";
   
/* ==========================
   OVERVIEW
========================== */
console.log("OVERVIEW =", data.overview);
console.log(data);

   
overview.textContent =
data.overview || "";

/* ==========================
   TV CONTROLS
========================== */

if(mediaType==="tv"){

showTvControls(
data.number_of_seasons || 1
);

}
else{

const tvControls =
document.getElementById(
"tvControls"
);

if(tvControls){

tvControls.classList.add(
"hidden"
);

}

}

loadRelatedMovies();

}

/* ==========================================
   TV CONTROLS
========================================== */

function showTvControls(
seasonCount
){

const wrap =
document.getElementById(
"tvControls"
);

if(!wrap) return;

wrap.classList.remove(
"hidden"
);

const seasonSelect =
document.getElementById(
"seasonSelect"
);

const episodeSelect =
document.getElementById(
"episodeSelect"
);

const playBtn =
document.getElementById(
"playEpisodeBtn"
);

seasonSelect.innerHTML = "";

for(
let i=1;
i<=seasonCount;
i++
){

seasonSelect.insertAdjacentHTML(
"beforeend",
`
<option value="${i}">
Season ${i}
</option>
`
);

}

loadEpisodes(1);

seasonSelect.onchange=()=>{

loadEpisodes(
seasonSelect.value
);

};

playBtn.onclick=()=>{

const season =
seasonSelect.value;

const episode =
episodeSelect.value;

document.getElementById(
"playerFrame"
).src =
`https://vsembed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;

};

}

async function loadEpisodes(
season
){

try{

const req =
await fetch(
`https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}?api_key=${TMDB_API}&language=id-ID`
);

const data =
await req.json();

const episodeSelect =
document.getElementById(
"episodeSelect"
);

episodeSelect.innerHTML = "";

(data.episodes || [])
.forEach(ep=>{

episodeSelect.insertAdjacentHTML(
"beforeend",
`
<option value="${ep.episode_number}">
Episode ${ep.episode_number}
</option>
`
);

});

}
catch(err){

console.log(err);

}

}

/* ==========================================
   RELATED MOVIES
========================================== */

async function loadRelatedMovies(){

const row =
document.getElementById(
"relatedRow"
);

if(!row || !tmdbId) return;

try{

const endpoint =
mediaType==="tv"
?
`https://api.themoviedb.org/3/tv/${tmdbId}/recommendations?api_key=${TMDB_API}&language=id-ID&page=1`
:
`https://api.themoviedb.org/3/movie/${tmdbId}/recommendations?api_key=${TMDB_API}&language=id-ID&page=1`;

const req =
await fetch(endpoint);

const data =
await req.json();

let html = "";

(data.results || [])
.slice(0,36)
.forEach(item=>{

const poster =
item.poster_path
?
IMG_BASE + item.poster_path
:
"https://via.placeholder.com/500x750";

html += `
<a
class="related-card"
href="watch.html?id=${item.id}&type=${mediaType}"
>
<img
src="${poster}"
loading="lazy"
alt=""
>
</a>
`;

});

row.innerHTML = html;

}
catch(err){

console.log(err);

}

}

/* ==========================================
   RELATED ARROWS
========================================== */

const relatedPrev =
document.getElementById(
"relatedPrev"
);

if(relatedPrev){

relatedPrev.onclick=()=>{

document.getElementById(
"relatedRow"
).scrollBy({
left:-1600,
behavior:"smooth"
});

};

}

const relatedNext =
document.getElementById(
"relatedNext"
);

if(relatedNext){

relatedNext.onclick=()=>{

document.getElementById(
"relatedRow"
).scrollBy({
left:1600,
behavior:"smooth"
});

};

}

/* ==========================================
   OVERLAY
========================================== */

function startOverlaySystem(){

const layer1 =
document.getElementById(
"overlayOne"
);

const layer2 =
document.getElementById(
"overlayTwo"
);

if(!layer1 || !layer2){
return;
}

/* layer 1 = 3 detik */

setTimeout(()=>{

layer1.classList.add(
"hidden"
);

showRandomBanner();

},3000);

}

function showRandomBanner(){

const layer2 =
document.getElementById(
"overlayTwo"
);

const banner =
document.getElementById(
"bannerImage"
);

const selected =
BANNERS[
Math.floor(
Math.random() *
BANNERS.length
)
];

currentBannerUrl =
selected.url;

banner.src =
selected.image;

layer2.classList.remove(
"hidden"
);

clearTimeout(
overlayTimer
);

overlayTimer =
setTimeout(()=>{

closeBannerLayer();

},10000);

}

function closeBannerLayer(){

clearTimeout(
overlayTimer
);

const layer2 =
document.getElementById(
"overlayTwo"
);

if(layer2){

layer2.classList.add(
"hidden"
);

}

}

/* ==========================================
   BUTTONS
========================================== */

const supportBtn =
document.getElementById(
"supportBtn"
);

if(supportBtn){

supportBtn.onclick=()=>{

if(currentBannerUrl){

window.open(
currentBannerUrl,
"_blank"
);

}

};

}

const skipBtn =
document.getElementById(
"skipBtn"
);

if(skipBtn){

skipBtn.onclick=()=>{

closeBannerLayer();

};

}

document.addEventListener(
"DOMContentLoaded",
async ()=>{

initMobileMenu();

/* ==========================
   GLOBAL SEARCH REDIRECT
========================== */

function initGlobalSearchRedirect() {

  const input = document.getElementById("searchInput");
  const inputMobile = document.getElementById("searchInputMobile");

  function bind(el) {
    if (!el) return;

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {

        const q = el.value.trim();
        if (!q) return;

        // selalu lempar ke index
        window.location.href =
          `index.html?search=${encodeURIComponent(q)}`;
      }
    });
  }

  bind(input);
  bind(inputMobile);
}

initGlobalSearchRedirect();

/* ==========================
   INDEX
========================== */

if(isIndexPage()){

await loadFeaturedHero();

await loadGenres();

initFilters();

initPaginationButtons();

loadDiscover();

}

/* ==========================
   WATCH
========================== */

if(isWatchPage()){

await loadGenres();

initFilters();

await initWatchPage();

}

});







