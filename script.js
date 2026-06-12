const API_KEY="b3b893873ed1bb7f175b2707afeea2a0";
const TMDB="https://api.themoviedb.org/3";

let allMovies=[];
let filteredMovies=[];
let currentPage=1;
let totalPages=1;
let genreMap={};
let customMovies=[];

/* =========================
ELEMENTS
========================= */

const heroSection=document.getElementById("heroSection");
const heroTitle=document.getElementById("heroTitle");
const heroOverview=document.getElementById("heroOverview");
const heroWatchBtn=document.getElementById("heroWatchBtn");

const movieGrid=document.getElementById("movieGrid");

const searchInput=document.getElementById("searchInput");
const mobileSearchInput=document.getElementById("mobileSearchInput");

const genreFilter=document.getElementById("genreFilter");
const mobileGenreFilter=document.getElementById("mobileGenreFilter");

const yearFilter=document.getElementById("yearFilter");
const mobileYearFilter=document.getElementById("mobileYearFilter");

const pageNumbers=document.getElementById("pageNumbers");
const prevPage=document.getElementById("prevPage");
const nextPage=document.getElementById("nextPage");

const burgerBtn=document.getElementById("burgerBtn");
const mobileMenu=document.getElementById("mobileMenu");

/* =========================
BURGER
========================= */

if(burgerBtn){

burgerBtn.addEventListener("click",()=>{

burgerBtn.classList.toggle("active");

mobileMenu.classList.toggle("active");

});

}

/* =========================
HELPERS
========================= */

function safeYear(date){

if(!date) return "";

return String(date).substring(0,4);

}

function poster(path){

if(!path){

return "https://via.placeholder.com/500x750?text=No+Poster";

}

return `https://image.tmdb.org/t/p/w500${path}`;

}

/* =========================
MOVIES.JSON
========================= */

async function loadCustomMovies(){

try{

const res=await fetch("movies.json");

customMovies=await res.json();

}catch(e){

console.log("movies.json gagal");

customMovies=[];

}

}

/* =========================
GENRES
========================= */

async function loadGenres(){

try{

const res=await fetch(
`${TMDB}/genre/movie/list?api_key=${API_KEY}&language=en-US`
);

const data=await res.json();

genreMap={};

(data.genres||[]).forEach(g=>{

genreMap[g.id]=g.name;

const opt1=document.createElement("option");
opt1.value=g.name;
opt1.textContent=g.name;

const opt2=opt1.cloneNode(true);

genreFilter.appendChild(opt1);

mobileGenreFilter.appendChild(opt2);

});

}catch(e){

console.log("genre gagal");

}

}

/* =========================
HERO
========================= */

function renderHero(movie){

if(!movie) return;

const bg=
movie.backdrop_path
?
`https://image.tmdb.org/t/p/original${movie.backdrop_path}`
:
poster(movie.poster_path);

heroSection.style.backgroundImage=
`url('${bg}')`;

heroTitle.textContent=
movie.title||
movie.name||
"Unknown";

heroOverview.textContent=
movie.overview||
"Sinopsis belum tersedia";

heroWatchBtn.href=
`watch.html?id=${movie.id}&title=${encodeURIComponent(movie.title||movie.name)}`;

}


/* =========================
HERO LOAD
========================= */

async function loadHero(){

try{

if(customMovies.length){

const item=
customMovies[
Math.floor(
Math.random()*customMovies.length
)
];

heroSection.style.backgroundImage=
`url('${item.image}')`;

heroTitle.textContent=
item.title;

heroOverview.textContent=
item.sinopsis||
"Sinopsis belum tersedia";

heroWatchBtn.href=
`watch.html?id=${item.tmdb_id}&title=${encodeURIComponent(item.title)}`;

return;

}

const res=await fetch(

`${TMDB}/trending/movie/week?api_key=${API_KEY}`

);

const data=await res.json();

if(data.results?.length){

const movie=
data.results[
Math.floor(
Math.random()*data.results.length
)
];

renderHero(movie);

}

}catch(e){

console.log("hero gagal");

}

}

/* =========================
TMDB LOAD
========================= */

async function loadTMDBMovies(){

try{

let results=[];

for(let page=1;page<=5;page++){

const res=await fetch(

`${TMDB}/movie/popular?api_key=${API_KEY}&page=${page}`

);

const data=await res.json();

results.push(
...(data.results||[])
);

}

allMovies=results;

filteredMovies=[...allMovies];

}catch(e){

console.log("tmdb gagal");

}

}

/* =========================
CARD
========================= */

function movieCard(movie){

const title=
movie.title||
movie.name||
"Unknown";

const year=
safeYear(
movie.release_date||
movie.first_air_date
);

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
src="${poster(movie.poster_path)}"
alt="${title}"
loading="lazy"

>

<div class="movie-title">
${title}
</div>

</a>

`;

}

/* =========================
GRID
========================= */

function renderGrid(){

if(!movieGrid) return;

movieGrid.innerHTML="";

const start=
(currentPage-1)*24;

const end=
start+24;

filteredMovies
.slice(start,end)
.forEach(movie=>{

movieGrid.insertAdjacentHTML(
"beforeend",
movieCard(movie)
);

});

}

/* =========================
PAGINATION
========================= */

function renderPagination(){

if(!pageNumbers) return;

totalPages=
Math.ceil(
filteredMovies.length/24
);

pageNumbers.innerHTML="";

for(
let i=1;
i<=totalPages;
i++
){

const btn=
document.createElement(
"button"
);

btn.textContent=i;

if(i===currentPage){

btn.style.background=
"#00d4ff";

btn.style.color=
"#000";

}

btn.onclick=()=>{

currentPage=i;

renderGrid();

renderPagination();

window.scrollTo({
top:0,
behavior:"smooth"
});

};

pageNumbers.appendChild(btn);

}

}


/* =========================
   FILTER
========================= */

function applyFilters(){

const keyword=
(
searchInput?.value ||
mobileSearchInput?.value ||
""
)
.toLowerCase();

const genre=
genreFilter?.value ||
mobileGenreFilter?.value ||
"";

const year=
yearFilter?.value ||
mobileYearFilter?.value ||
"";

filteredMovies=
allMovies.filter(movie=>{

const title=
(
movie.title||
movie.name||
""
)
.toLowerCase();

const movieYear=
safeYear(
movie.release_date||
movie.first_air_date
);

const genres=
(movie.genre_ids||[])
.map(id=>genreMap[id]||"");

const passSearch=
title.includes(keyword);

const passGenre=
!genre ||
genres.includes(genre);

let passYear=true;

if(year==="2026"){
passYear=(movieYear==="2026");
}
else if(year==="2025"){
passYear=(movieYear==="2025");
}
else if(year==="2024"){
passYear=(movieYear==="2024");
}
else if(year==="classic"){
passYear=
parseInt(movieYear||0)<2024;
}

return (
passSearch &&
passGenre &&
passYear
);

});

currentPage=1;

renderGrid();

renderPagination();

}

/* =========================
   SEARCH
========================= */

if(searchInput){

searchInput.addEventListener(
"input",
()=>{

if(mobileSearchInput){

mobileSearchInput.value=
searchInput.value;

}

applyFilters();

});

}

if(mobileSearchInput){

mobileSearchInput.addEventListener(
"input",
()=>{

if(searchInput){

searchInput.value=
mobileSearchInput.value;

}

applyFilters();

});

}

/* =========================
   GENRE
========================= */

if(genreFilter){

genreFilter.addEventListener(
"change",
()=>{

if(mobileGenreFilter){

mobileGenreFilter.value=
genreFilter.value;

}

applyFilters();

});

}

if(mobileGenreFilter){

mobileGenreFilter.addEventListener(
"change",
()=>{

if(genreFilter){

genreFilter.value=
mobileGenreFilter.value;

}

applyFilters();

});

}

/* =========================
   YEAR
========================= */

if(yearFilter){

yearFilter.addEventListener(
"change",
()=>{

if(mobileYearFilter){

mobileYearFilter.value=
yearFilter.value;

}

applyFilters();

});

}

if(mobileYearFilter){

mobileYearFilter.addEventListener(
"change",
()=>{

if(yearFilter){

yearFilter.value=
mobileYearFilter.value;

}

applyFilters();

});

}

/* =========================
   PREV NEXT
========================= */

if(prevPage){

prevPage.onclick=()=>{

if(currentPage<=1)
return;

currentPage--;

renderGrid();

renderPagination();

window.scrollTo({
top:0,
behavior:"smooth"
});

};

}

if(nextPage){

nextPage.onclick=()=>{

if(currentPage>=totalPages)
return;

currentPage++;

renderGrid();

renderPagination();

window.scrollTo({
top:0,
behavior:"smooth"
});

};

}

/* =========================
   INIT
========================= */

async function init(){

console.log("INIT");

await loadCustomMovies();

console.log("CUSTOM OK");

await loadGenres();

console.log("GENRE OK");

await loadHero();

console.log("HERO OK");

await loadTMDBMovies();

console.log("TMDB OK");

renderGrid();

renderPagination();

console.log("GRID OK");

}

init();
