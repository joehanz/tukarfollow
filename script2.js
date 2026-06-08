const KEY="ISI_API_TMDB_KAMU";

const IMG="https://image.tmdb.org/t/p/w500";
const BIG="https://image.tmdb.org/t/p/original";

const slider=document.getElementById("slider");
const movieGrid=document.getElementById("movieGrid");
const search=document.getElementById("search");


async function loadTrending(){

try{

let res=await fetch(
`https://api.themoviedb.org/3/trending/all/week?api_key=${KEY}`
);

let data=await res.json();

createSlider(
data.results.slice(0,5)
);

renderMovies(
data.results
);

}
catch(e){

slider.innerHTML=
"<div class='loading'>Gagal memuat</div>";

movieGrid.innerHTML=
"<div class='loading'>Gagal memuat</div>";

console.log(e);

}

}



function createSlider(items){

let html="";

items.forEach(movie=>{

let title=
movie.title||
movie.name;

let desc=
movie.overview?.substring(0,150)
+"...";

html+=`

<div
class="slide"
style="
background-image:
url(${BIG}${movie.backdrop_path})
">

<div class="slideContent">

<h1>
${title}
</h1>

<p>
${desc}
</p>

<a
href="#"
class="btn"
>

Play

</a>

</div>

</div>

`;

});

slider.innerHTML=html;

autoSlider();

}



function renderMovies(items){

let html="";

items.forEach(movie=>{

let title=
movie.title||
movie.name;

let year=
(movie.release_date||
movie.first_air_date||
"")
.substring(0,4);

html+=`

<div class="card">

<img
src="${IMG}${movie.poster_path}"
loading="lazy"
>

<div class="cardInfo">

<h3>

${title}

</h3>

<span>

⭐ ${movie.vote_average.toFixed(1)}

|
${year}

</span>

</div>

</div>

`;

});

movieGrid.innerHTML=html;

}



let current=0;

function autoSlider(){

const slides=
document.querySelectorAll(".slide");

slides.forEach(
s=>s.style.display="none"
);

slides[0].style.display="flex";

setInterval(()=>{

slides[current]
.style.display="none";

current++;

if(
current>=slides.length
){

current=0;

}

slides[current]
.style.display="flex";

},4000);

}



search.addEventListener(
"keyup",
async e=>{

let q=e.target.value;

if(
q.length<2
){

loadTrending();

return;

}

let res=
await fetch(

`https://api.themoviedb.org/3/search/multi?api_key=${KEY}&query=${q}`

);

let data=
await res.json();

renderMovies(
data.results
);

});


loadTrending();
