/* =====================================
   CONFIG
===================================== */

const API_KEY =
"b3b893873ed1bb7f175b2707afeea2a0";

const TMDB =
"https://api.themoviedb.org/3";

let currentPage = 1;
let totalPages = 1;

let allMovies = [];
let filteredMovies = [];

let genreMap = {};

/* =====================================
   ELEMENTS
===================================== */

const movieGrid =
document.getElementById(
"movieGrid"
);

const heroSection =
document.getElementById(
"heroSection"
);

const heroTitle =
document.getElementById(
"heroTitle"
);

const heroOverview =
document.getElementById(
"heroOverview"
);

const heroWatchBtn =
document.getElementById(
"heroWatchBtn"
);

const genreFilter =
document.getElementById(
"genreFilter"
);

const yearFilter =
document.getElementById(
"yearFilter"
);

const searchInput =
document.getElementById(
"searchInput"
);

const mobileGenreFilter =
document.getElementById(
"mobileGenreFilter"
);

const mobileYearFilter =
document.getElementById(
"mobileYearFilter"
);

const mobileSearchInput =
document.getElementById(
"mobileSearchInput"
);

const pageNumbers =
document.getElementById(
"pageNumbers"
);

const prevPage =
document.getElementById(
"prevPage"
);

const nextPage =
document.getElementById(
"nextPage"
);

/* =====================================
   BURGER MENU
===================================== */

const burger =
document.getElementById(
"burgerBtn"
);

const mobileMenu =
document.getElementById(
"mobileMenu"
);

if(burger){

burger.addEventListener(
"click",
()=>{

burger.classList.toggle(
"active"
);

mobileMenu.classList.toggle(
"active"
);

});

}

/* =====================================
   LOAD GENRES
===================================== */

async function loadGenres(){

try{

const res =
await fetch(

`${TMDB}/genre/movie/list?api_key=${API_KEY}&language=en-US`

);

const data =
await res.json();

genreMap = {};

data.genres.forEach(g=>{

genreMap[g.id]=g.name;

const option =
document.createElement(
"option"
);

option.value = g.name;
option.textContent = g.name;

genreFilter.appendChild(
option.cloneNode(true)
);

mobileGenreFilter.appendChild(
option
);

});

}catch(err){

console.log(err);

}

}

/* =====================================
   LOAD MOVIES.JSON
===================================== */

async function loadMoviesJson(){

try{

const res =
await fetch(
"movies.json"
);

const data =
await res.json();

return data;

}catch(err){

console.log(err);

return [];

}

}

/* =====================================
   HERO RANDOM
===================================== */

function renderHero(movie){

if(!movie) return;

const bg =
movie.backdrop_path
?
`https://image.tmdb.org/t/p/original${movie.backdrop_path}`
:
`https://image.tmdb.org/t/p/w780${movie.poster_path}`;

heroSection.style.backgroundImage =
`url(${bg})`;

heroTitle.textContent =
movie.title ||
movie.name ||
"Unknown";

heroOverview.textContent =
movie.overview ||
"Sinopsis belum tersedia.";

heroWatchBtn.href =
`watch.html?id=${movie.id}&title=${encodeURIComponent(movie.title||movie.name)}`;

}

/* =====================================
   LOAD HERO
===================================== */

async function loadHero(){

try{

const page =
Math.floor(
Math.random()*5
)+1;

const res =
await fetch(

`${TMDB}/trending/all/week?api_key=${API_KEY}&page=${page}`

);

const data =
await res.json();

if(
data.results &&
data.results.length
){

const randomMovie =
data.results[
Math.floor(
Math.random()*
data.results.length
)
];

renderHero(
randomMovie
);

}

}catch(err){

console.log(err);

}

}

/* =====================================
   RENDER GRID
===================================== */

function createMovieCard(movie){

const title =
movie.title ||
movie.name ||
"Unknown";

const year =
(movie.release_date ||
movie.first_air_date ||
"0000").substring(0,4);

const poster =
movie.poster_path
?
`https://image.tmdb.org/t/p/w500${movie.poster_path}`
:
"https://via.placeholder.com/500x750?text=No+Image";

return `

<a
class="movie-card"
href="watch.html?id=${movie.id}&title=${encodeURIComponent(title)}"
>

<span class="badge-webrip">
WEBRIP
</span>

<span class="badge-year">
${year}
</span>

<img
class="movie-poster"
src="${poster}"
alt="${title}"
loading="lazy"
>

<div class="movie-title">
${title}
</div>

</a>

`;

}

function renderMovies(list){

if(!movieGrid) return;

movieGrid.innerHTML = "";

const start =
(currentPage-1)*24;

const end =
start+24;

const pageItems =
list.slice(start,end);

pageItems.forEach(movie=>{

movieGrid.insertAdjacentHTML(
"beforeend",
createMovieCard(movie)
);

});

}

/* =====================================
   FILTER
===================================== */

function applyFilters(){

const searchValue =
(
searchInput?.value ||
mobileSearchInput?.value ||
""
)
.toLowerCase();

const selectedGenre =
genreFilter?.value ||
mobileGenreFilter?.value ||
"";

const selectedYear =
yearFilter?.value ||
mobileYearFilter?.value ||
"";

filteredMovies =
allMovies.filter(movie=>{

const title =
(
movie.title ||
movie.name ||
""
).toLowerCase();

const year =
(
movie.release_date ||
movie.first_air_date ||
""
).substring(0,4);

const genres =
(movie.genre_ids || [])
.map(id=>genreMap[id] || "");

const matchSearch =
title.includes(
searchValue
);

const matchGenre =
!selectedGenre ||
genres.includes(
selectedGenre
);

let matchYear = true;

if(selectedYear==="2026"){
matchYear = year==="2026";
}
else if(selectedYear==="2025"){
matchYear = year==="2025";
}
else if(selectedYear==="2024"){
matchYear = year==="2024";
}
else if(selectedYear==="classic"){
matchYear =
parseInt(year||0) < 2024;
}

return (
matchSearch &&
matchGenre &&
matchYear
);

});

currentPage = 1;

updatePagination();

renderMovies(
filteredMovies
);

}

/* =====================================
   EVENTS
===================================== */

if(searchInput){

searchInput.addEventListener(
"input",
()=>{

mobileSearchInput.value =
searchInput.value;

applyFilters();

});

}

if(mobileSearchInput){

mobileSearchInput.addEventListener(
"input",
()=>{

searchInput.value =
mobileSearchInput.value;

applyFilters();

});

}

if(genreFilter){

genreFilter.addEventListener(
"change",
()=>{

mobileGenreFilter.value =
genreFilter.value;

applyFilters();

});

}

if(mobileGenreFilter){

mobileGenreFilter.addEventListener(
"change",
()=>{

genreFilter.value =
mobileGenreFilter.value;

applyFilters();

});

}

if(yearFilter){

yearFilter.addEventListener(
"change",
()=>{

mobileYearFilter.value =
yearFilter.value;

applyFilters();

});

}

if(mobileYearFilter){

mobileYearFilter.addEventListener(
"change",
()=>{

yearFilter.value =
mobileYearFilter.value;

applyFilters();

});

}

async function loadMoviesJson(){

try{

const res =
await fetch(
"movies.json"
);

const data =
await res.json();

window.moviesJson =
data;

return data;

}catch(err){

console.log(err);

window.moviesJson = [];

return [];

}

}
