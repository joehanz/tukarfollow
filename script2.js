const KEY="b3b893873ed1bb7f175b2707afeea2a0";

const IMG="https://image.tmdb.org/t/p/w500";
const BIG="https://image.tmdb.org/t/p/original";

const slider=document.getElementById("slider");
const movieGrid=document.getElementById("movieGrid");
const search=document.getElementById("search");

let sliderTimer;



async function loadTrending(){

try{

movieGrid.innerHTML=
"<div class='loading'>Loading...</div>";

let res=await fetch(

`https://api.themoviedb.org/3/trending/all/week?api_key=${KEY}`

);

let data=await res.json();

if(!data.results){

throw new Error(
"Data kosong"
);

}

createSlider(
data.results.slice(0,5)
);

renderMovies(
data.results
);

}

catch(e){

console.log(e);

slider.innerHTML=

"<div class='loading'>Gagal memuat slider</div>";

movieGrid.innerHTML=

"<div class='loading'>Gagal memuat movie</div>";

}

}





function createSlider(items){

if(!items.length)return;

clearInterval(
sliderTimer
);

let html="";

items.forEach(movie=>{

let title=
movie.title||
movie.name||
"Untitled";

let desc=
movie.overview||
"Tidak ada deskripsi";

desc=
desc.substring(
0,
150
);

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

${desc}...

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

slider.innerHTML=
html;

autoSlider();

}





function renderMovies(items){

let html="";

items.forEach(movie=>{

if(!movie.poster_path)
return;

let title=
movie.title||
movie.name||
"Untitled";


let year=(

movie.release_date||
movie.first_air_date||
""

).substring(
0,
4
);


let rate=
movie.vote_average?
movie.vote_average.toFixed(1)
:
"0";


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

⭐ ${rate}

|

${year}

</span>

</div>

</div>

`;

});

movieGrid.innerHTML=
html;

}





let current=0;


function autoSlider(){

const slides=

document.querySelectorAll(
".slide"
);


if(!slides.length)
return;


slides.forEach(

s=>s.style.display=
"none"

);


slides[0]
.style.display=
"flex";


current=0;


sliderTimer=

setInterval(()=>{

slides[current]
.style.display=
"none";

current++;

if(
current>=slides.length
){

current=0;

}

slides[current]
.style.display=
"flex";

},4000);

}





search.addEventListener(

"keyup",

async e=>{

let q=
e.target.value;


if(
q.length<2
){

loadTrending();

return;

}


let res=

await fetch(

`https://api.themoviedb.org/3/search/multi?api_key=${KEY}&query=${encodeURIComponent(q)}`

);


let data=
await res.json();


renderMovies(
data.results||[]
);

}

);



loadTrending();
