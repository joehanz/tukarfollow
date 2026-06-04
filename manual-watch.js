const movieId=
new URLSearchParams(
location.search
).get("movie");

const ads=[

"https://rajarayap.com",
"https://caturbangunsentosa.blogspot.com",
"https://ptdwiprima.blogspot.com"

];

let movies=[];
let movie=null;
let adsState=false;

/* OVERLAY */

let filtered=[];
let overlayPage=1;
const ITEMS_PER_PAGE=24;

/* BURGER */

function toggleMenu(){

document
.getElementById(
"mobileMenu"
)
.classList.toggle(
"show"
);

}

/* LOAD JSON */

async function load(){

const res=
await fetch(
"movies.json"
);

movies=
await res.json();

filtered=
[...movies];

movie=
movies[movieId];

loadMovie();

}

/* LOAD MOVIE */
function loadMovie(){

if(!movie)return;

document
.getElementById(
"info"
)
.innerHTML=`

<h2>

${movie.title}

</h2>

<p>
📅 Rilis :
${movie.release_date||"-"}
</p>

<p>
🌍 Negara :
${movie.country||"-"}
</p>

<p>
🎭 Genre :
${movie.genre.join(", ")}
</p>

<p style="
margin-top:15px;
line-height:1.7;
opacity:.9;
">

${movie.sinopsis}

</p>

<div style="
margin:15px 0;
padding:14px;
border-radius:12px;
background:#111;
border:1px solid rgba(255,255,255,.08);
">

<a href="javascript:history.back()"

style="
color:gold;
font-weight:bold;
text-decoration:none;
">

🎬 Versi Orisinal

</a>

</div>

`;

renderRelated();
  
}

/* RELATED */

function renderRelated(){

let h="";

const related=

movies
.filter(
m=>m!==movie
)
.sort(
()=>Math.random()-0.5
)
.slice(
0,
15
);

related.forEach(v=>{

h+=`

<div
class="rel-card"
onclick="go(${movies.indexOf(v)})"
>

<img
src="${v.image}"
>

</div>

`;

});

document
.getElementById(
"rel"
)
.innerHTML=h;

}

function move(dir){

document
.getElementById(
"rel"
)
.scrollBy({

left:dir*300,
behavior:"smooth"

});

}

function go(i){

location.href=
`manual-watch.html?movie=${i}`;

}

/* SEARCH */

function searchMovie(){

const q=
document
.getElementById(
"search"
)
.value
.toLowerCase()
.trim();

filterMovies(q);

}

function searchMovieMobile(){

const q=
document
.querySelector(
"#mobileMenu input"
)
.value
.toLowerCase()
.trim();

filterMovies(q);

}

function filterMovies(q){

if(!q){

document
.getElementById(
"overlay"
)
.style.display=
"none";

return;

}

filtered=

movies.filter(m=>

m.title
.toLowerCase()
.includes(q)

);

overlayPage=1;

showOverlay();

}

/* OVERLAY */

function showOverlay(){

document
.getElementById(
"overlay"
)
.style.display=
"block";

const start=
(overlayPage-1)
*ITEMS_PER_PAGE;

const current=

filtered.slice(
start,
start+
ITEMS_PER_PAGE
);

let h="";

current.forEach(v=>{

h+=`

<div
class="card"
onclick="go(${movies.indexOf(v)})"
>

<img
src="${v.image}"
>

<div class="title">

${v.title}

</div>

</div>

`;

});

document
.getElementById(
"overlayGrid"
)
.innerHTML=h;

renderOverlayPagination();

}

function renderOverlayPagination(){

const total=

Math.ceil(
filtered.length/
ITEMS_PER_PAGE
);

let h="";

for(
let i=1;
i<=total;
i++
){

h+=`

<button
onclick="
changePage(${i})
"
style="
padding:8px 14px;
border:none;
border-radius:8px;
cursor:pointer;
background:
${i===overlayPage?'#ff2e2e':'#1a1a22'};
color:#fff;
"
>

${i}

</button>

`;

}

document
.getElementById(
"overlayPagination"
)
.innerHTML=h;

}

function changePage(i){

overlayPage=i;

showOverlay();

window.scrollTo({

top:0,
behavior:"smooth"

});

}

load();



