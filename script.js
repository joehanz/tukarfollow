/* ==========================================
   GLOBAL CONFIG
========================================== */

const IMG =
"https://image.tmdb.org/t/p/w500";

let currentPage = 1;
let currentGenre = "";
let currentKeyword = "";
let currentYear = "";

let genreMap = {};
let allGenres = [];

/* ==========================================
   URL PARAMS
========================================== */

const urlParams =
new URLSearchParams(
window.location.search
);

const tmdbId =
urlParams.get("id");

const mediaType =
urlParams.get("type");

/* ==========================================
   HELPERS
========================================== */

function qs(el){
  return document.querySelector(el);
}

function qsa(el){
  return document.querySelectorAll(el);
}

function safe(v){
  return v || "";
}

/* ==========================================
   MOBILE MENU
========================================== */

const burgerBtn =
document.getElementById(
"burgerBtn"
);

const mobileMenu =
document.getElementById(
"mobileMenu"
);

if(
burgerBtn &&
mobileMenu
){

burgerBtn.addEventListener(
"click",
()=>{
mobileMenu.classList.toggle(
"active"
);
});

}

/* ==========================================
   LOAD GENRES
========================================== */

async function loadGenres(){

if(
!document.getElementById(
"genreSelect"
)
){
return;
}

try{

const movieGenres =
await fetch(
`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API}&language=id-ID`
);

const movieData =
await movieGenres.json();

allGenres =
movieData.genres || [];

const desktop =
document.getElementById(
"genreSelect"
);

const mobile =
document.getElementById(
"genreSelectMobile"
);

allGenres.forEach(g=>{

genreMap[g.id] = g.name;

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

}
catch(err){

console.log(err);

}

}

/* ==========================================
   YEAR FILTER
========================================== */

function getYearFilter(){

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
   CARD HTML
========================================== */

function createCard(item,type){

const title =
item.title ||
item.name ||
"Untitled";

const poster =
item.poster_path
?
IMG + item.poster_path
:
"https://via.placeholder.com/500x750";

const release =
item.release_date ||
item.first_air_date ||
"-";

return `

<div
class="movie-card"
data-id="${item.id}"
data-type="${type}"
>

<a href="
watch.html
?id=${item.id}
&type=${type}
">

<img
loading="lazy"
src="${poster}"
alt="${title}"
>

<div class="movie-card-info">

<h3>
${title}
</h3>

<span>
${release}
</span>

</div>

</a>

</div>

`;

}

/* ==========================================
   PAGINATION BLOCK
========================================== */

function buildPagination(){

const wrap =
document.getElementById(
"paginationNumbers"
);

if(!wrap) return;

wrap.innerHTML = "";

const start =
Math.floor(
(currentPage-1)/5
)*5+1;

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

if(
i===currentPage
){
btn.classList.add(
"active"
);
}

btn.textContent = i;

btn.onclick=()=>{

currentPage=i;

loadDiscover();

};

wrap.appendChild(btn);

}

}

/* ==========================================
   PAGINATION BUTTONS
========================================== */

const nextBlock =
document.getElementById(
"nextBlock"
);

if(nextBlock){

nextBlock.onclick=()=>{

currentPage += 5;

loadDiscover();

};

}

const prevBlock =
document.getElementById(
"prevBlock"
);

if(prevBlock){

prevBlock.onclick=()=>{

currentPage -= 5;

if(currentPage<1){
currentPage=1;
}

loadDiscover();

};

}

/* ==========================================
   FILTER EVENTS
========================================== */

function bindFilters(){

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

if(searchDesktop){

searchDesktop.addEventListener(
"keyup",
function(e){

if(e.key==="Enter"){

currentKeyword =
this.value.trim();

currentPage = 1;

loadDiscover();

}

});

}

if(searchMobile){

searchMobile.addEventListener(
"keyup",
function(e){

if(e.key==="Enter"){

currentKeyword =
this.value.trim();

currentPage = 1;

loadDiscover();

}

});

}

if(genreDesktop){

genreDesktop.onchange=()=>{

currentGenre =
genreDesktop.value;

genreMobile.value =
genreDesktop.value;

currentPage=1;

loadDiscover();

};

}

if(genreMobile){

genreMobile.onchange=()=>{

currentGenre =
genreMobile.value;

genreDesktop.value =
genreMobile.value;

currentPage=1;

loadDiscover();

};

}

if(yearDesktop){

yearDesktop.onchange=()=>{

currentYear =
yearDesktop.value;

yearMobile.value =
yearDesktop.value;

currentPage=1;

loadDiscover();

};

}

if(yearMobile){

yearMobile.onchange=()=>{

currentYear =
yearMobile.value;

yearDesktop.value =
yearMobile.value;

currentPage=1;

loadDiscover();

};

}

}

```
```html
/* ==========================================
   DISCOVER MOVIES + TV
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

if(currentGenre){

movieUrl +=
`&with_genres=${currentGenre}`;

tvUrl +=
`&with_genres=${currentGenre}`;

}

movieUrl += getYearFilter();
tvUrl += getYearFilter();

/* ======================
   SEARCH MODE
====================== */

if(currentKeyword){

movieUrl =
`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API}&language=id-ID&query=${encodeURIComponent(currentKeyword)}&page=${currentPage}`;

tvUrl =
`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API}&language=id-ID&query=${encodeURIComponent(currentKeyword)}&page=${currentPage}`;

}

const movieReq =
await fetch(movieUrl);

const tvReq =
await fetch(tvUrl);

const movieData =
await movieReq.json();

const tvData =
await tvReq.json();

const movieResults =
movieData.results || [];

const tvResults =
tvData.results || [];

let html = "";

/* ======================
   MOVIES
====================== */

movieResults.forEach(item=>{

html += createCard(
item,
"movie"
);

});

/* ======================
   TV SERIES
====================== */

tvResults.forEach(item=>{

html += createCard(
item,
"tv"
);

});

/* ======================
   EMPTY
====================== */

if(!html){

html =
`
<div class="empty-state">
Tidak ada data ditemukan.
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
Gagal memuat data.
</div>
`;

}

}

/* ==========================================
   WATCH PAGE
========================================== */

async function initWatchPage(){

if(!tmdbId) return;

const titleBox =
document.getElementById(
"movieTitle"
);

if(!titleBox) return;

try{

/* ======================
   LOAD MANUAL JSON
====================== */

let manualMovie = null;

try{

const jsonReq =
await fetch(
MOVIES_JSON
);

const jsonData =
await jsonReq.json();

manualMovie =
jsonData.find(item=>{

return (
String(item.tmdb_id) ===
String(tmdbId)
);

});

}
catch(e){

console.log(e);

}

/* ======================
   MATCH FOUND
====================== */

if(manualMovie){

renderManualMovie(
manualMovie
);

return;

}

/* ======================
   TMDB DETAIL
====================== */

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

renderTmdbMovie(
detail
);

}
catch(err){

console.log(err);

}

}

/* ==========================================
   MANUAL MOVIE
========================================== */

function renderManualMovie(movie){

const player =
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

player.src =
movie.iframe || "";

poster.src =
movie.image || "";

title.textContent =
movie.title || "";

meta.innerHTML =
`
<span>${safe(movie.country)}</span>
<span>${safe(movie.release_date)}</span>
`;

overview.textContent =
movie.sinopsis || "";

loadRelatedMovies();

}

/* ==========================================
   TMDB MOVIE
========================================== */

function renderTmdbMovie(data){

const player =
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

if(mediaType==="tv"){

player.src =
`https://vsembed.ru/embed/tv?tmdb=${tmdbId}&season=1&episode=1`;

}
else{

player.src =
`https://vsembed.ru/embed/movie?tmdb=${tmdbId}`;

}

poster.src =
data.poster_path
?
IMG + data.poster_path
:
"";

title.textContent =
data.title ||
data.name ||
"";

meta.innerHTML =
`
<span>${genres}</span>
`;

overview.textContent =
data.overview || "";

if(mediaType==="tv"){

showTvControls(
data.number_of_seasons
);

}

loadRelatedMovies();

}
```
```html id="z1v5kq"
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

const iframe =
document.getElementById(
"playerFrame"
);

iframe.src =
`https://vsembed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;

};

}

/* ==========================================
   LOAD EPISODES
========================================== */

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

if(!row) return;

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

const results =
(data.results || [])
.slice(0,24);

let html = "";

results.forEach(item=>{

const title =
item.title ||
item.name ||
"Untitled";

const poster =
item.poster_path
?
IMG + item.poster_path
:
"https://via.placeholder.com/500x750";

html +=
`
<a
class="related-card"
href="watch.html?id=${item.id}&type=${mediaType}"
>

<img
src="${poster}"
alt="${title}"
loading="lazy"
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
   RELATED SCROLLER
========================================== */

const relatedPrev =
document.getElementById(
"relatedPrev"
);

const relatedNext =
document.getElementById(
"relatedNext"
);

if(relatedPrev){

relatedPrev.onclick=()=>{

const row =
document.getElementById(
"relatedRow"
);

row.scrollBy({
left:-1200,
behavior:"smooth"
});

};

}

if(relatedNext){

relatedNext.onclick=()=>{

const row =
document.getElementById(
"relatedRow"
);

row.scrollBy({
left:1200,
behavior:"smooth"
});

};

}

/* ==========================================
   OVERLAY SYSTEM
========================================== */

let currentBannerUrl = "";

function startOverlaySystem(){

const layerOne =
document.getElementById(
"overlayOne"
);

const layerTwo =
document.getElementById(
"overlayTwo"
);

if(
!layerOne ||
!layerTwo
){
return;
}

/* ======================
   LAYER 1
====================== */

setTimeout(()=>{

layerOne.classList.add(
"hidden"
);

showBannerLayer();

},3000);

}

/* ==========================================
   BANNER LAYER
========================================== */

function showBannerLayer(){

const layerTwo =
document.getElementById(
"overlayTwo"
);

const bannerImage =
document.getElementById(
"bannerImage"
);

if(
!layerTwo ||
!bannerImage
){
return;
}

const selected =
BANNERS[
Math.floor(
Math.random() *
BANNERS.length
)
];

currentBannerUrl =
selected.url;

bannerImage.src =
selected.image;

layerTwo.classList.remove(
"hidden"
);

/* ======================
   AUTO CLOSE
====================== */

setTimeout(()=>{

closeBannerLayer();

},10000);

}

/* ==========================================
   CLOSE BANNER
========================================== */

function closeBannerLayer(){

const layerTwo =
document.getElementById(
"overlayTwo"
);

if(layerTwo){

layerTwo.classList.add(
"hidden"
);

}

}
```
```html id="v4b2ks"
/* ==========================================
   SUPPORT BUTTON
========================================== */

const supportBtn =
document.getElementById(
"supportBtn"
);

if(supportBtn){

supportBtn.onclick=()=>{

if(
currentBannerUrl
){

window.open(
currentBannerUrl,
"_blank"
);

}

};

}

/* ==========================================
   SKIP BUTTON
========================================== */

const skipBtn =
document.getElementById(
"skipBtn"
);

if(skipBtn){

skipBtn.onclick=()=>{

closeBannerLayer();

};

}

/* ==========================================
   PAGE INIT
========================================== */

document.addEventListener(
"DOMContentLoaded",
async ()=>{

/* ======================
   INDEX PAGE
====================== */

if(
document.getElementById(
"movieGrid"
)
){

await loadGenres();

bindFilters();

loadDiscover();

}

/* ======================
   WATCH PAGE
====================== */

if(
document.getElementById(
"playerFrame"
)
){

startOverlaySystem();

await initWatchPage();

}

});


