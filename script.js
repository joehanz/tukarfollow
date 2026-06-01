const KEY="b3b893873ed1bb7f175b2707afeea2a0";

const id=new URLSearchParams(location.search).get("id");

const ads=[
"https://rajarayap.com",
"https://caturbangunsentosa.blogspot.com",
"https://ptdwiprima.blogspot.com"
];

let page=1;
let mode="all";
let query="";

let adsState=false;
let items=[];

let overlayPage=1;
let overlayMode="";
let currentQuery="";

/* BURGER */
function toggleMenu(){

const menu=document.getElementById("mobileMenu");

if(menu){
menu.classList.toggle("show");
}

}

/* ===========================
INDEX.HTML
=========================== */

/* LOAD GRID */
async function load(){

if(id){
loadDetail();
return;
}

let url="";

if(query){

url=`https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${query}&page=${page}`;

}else if(mode==="id"){

url=`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_origin_country=ID&page=${page}`;

}else if(mode==="luar"){

url=`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&without_origin_country=ID&page=${page}`;

}else{

url=`https://api.themoviedb.org/3/trending/movie/week?api_key=${KEY}&page=${page}`;

}

const data=await fetch(url)
.then(r=>r.json());

renderGrid(data.results);

if(document.getElementById("pagination")){
renderPagination(data.page);
}

}

function renderGrid(d){

if(!document.getElementById("grid")) return;

let h="";

d.forEach(m=>{

if(!m.poster_path)return;

h+=`
<div class="card" onclick="go(${m.id})">

<img src="https://image.tmdb.org/t/p/w300${m.poster_path}">

<div class="title">
${m.title}
</div>

</div>
`;

});

document.getElementById("grid").innerHTML=h;

}

function renderPagination(p){

let h="";

for(let i=p;i<p+6;i++){

h+=`
<button onclick="goPage(${i})">
${i}
</button>
`;

}

h+=`
<button onclick="nextSet()">
›
</button>
`;

document.getElementById(
"pagination"
).innerHTML=h;

}

function goPage(p){

page=p;
load();

}

function nextSet(){

page+=6;
load();

}

function setMode(m){

mode=m;
query="";
page=1;

load();

}

/* ===========================
WATCH.HTML OVERLAY
=========================== */

async function loadOverlay(){

let url="";

if(overlayMode==="search"){

url=`https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${encodeURIComponent(currentQuery)}&page=${overlayPage}`;

}

if(overlayMode==="local"){

url=`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_origin_country=ID&page=${overlayPage}`;

}

const data=await fetch(url)
.then(r=>r.json());

showOverlay(data.results);

renderOverlayPagination(
data.page,
data.total_pages
);

}

function showOverlay(data){

const overlay=
document.getElementById(
"overlay"
);

if(!overlay)return;

overlay.style.display="block";

let h="";

data.forEach(v=>{

if(!v.poster_path)return;

h+=`
<div class="card" onclick="go(${v.id})">

<img src="https://image.tmdb.org/t/p/w300${v.poster_path}">

<div class="title">
${v.title||v.name}
</div>

</div>
`;

});

document.getElementById(
"overlayGrid"
).innerHTML=h;

}

function renderOverlayPagination(
page,
total
){

const el=
document.getElementById(
"overlayPagination"
);

if(!el)return;

let h="";

let start=Math.max(
1,
page-2
);

let end=Math.min(
total,
start+5
);

for(
let i=start;
i<=end;
i++
){

h+=`

<button
onclick="changeOverlayPage(${i})"
style="
padding:8px 14px;
border:none;
border-radius:8px;
cursor:pointer;
background:${i===page?'#ff2e2e':'#1a1a22'};
color:#fff;
">

${i}

</button>

`;

}

if(page<total){

h+=`

<button
onclick="changeOverlayPage(${page+1})"
style="
padding:8px 14px;
border:none;
border-radius:8px;
cursor:pointer;
background:#1a1a22;
color:#fff;
">

›

</button>

`;

}

el.innerHTML=h;

}

function changeOverlayPage(p){

overlayPage=p;

loadOverlay();

window.scrollTo({

top:0,
behavior:"smooth"

});

}

/* SEARCH */

function searchMovie(){

const input=
document.getElementById(
"search"
);

if(!input)return;

const val=input.value;

if(!val.trim())return;

if(id){

currentQuery=val;

overlayMode="search";

overlayPage=1;

loadOverlay();

}else{

query=val;

page=1;

load();

}

}

function searchMovieMobile(){

const input=
document.querySelector(
"#mobileMenu input"
);

if(!input)return;

const val=input.value;

if(!val.trim())return;

if(id){

currentQuery=val;

overlayMode="search";

overlayPage=1;

loadOverlay();

}else{

query=val;

page=1;

load();

}

}

function loadLocal(){

if(id){

overlayMode="local";

overlayPage=1;

loadOverlay();

}else{

setMode("id");

}

}

/* ===========================
WATCH DETAIL
=========================== */

if(
document.getElementById(
"playLayer"
)
){

document.getElementById(
"playLayer"
).onclick=function(){

if(!adsState){

adsState=true;

window.open(

ads[
Math.floor(
Math.random()*ads.length
)
],

"_blank"

);

return;

}

this.style.display="none";

document.getElementById(
"player"
).src=

`https://vsembed.ru/embed/movie?tmdb=${id}`;

};

}

async function loadDetail(){

let m=await fetch(
`https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}&language=id-ID`
)
.then(r=>r.json());

if(!m.overview){

const backup=
await fetch(
`https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}`
)
.then(r=>r.json());

m.overview=
backup.overview;

}

document.getElementById(
"info"
).innerHTML=`

<h2>${m.title}</h2>

<p>⭐ Rating : ${m.vote_average.toFixed(1)}</p>

<p>📅 Rilis : ${m.release_date||"-"}</p>

<p>🌍 Negara :
${m.production_countries.map(
c=>c.name
).join(", ")}
</p>

<p>🎭 Genre :
${m.genres.map(
g=>g.name
).join(", ")}
</p>

<p style="
margin-top:15px;
line-height:1.7;
opacity:.9;
">

${m.overview||"Sinopsis tidak tersedia"}

</p>

`;

const r=await fetch(
`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${KEY}`
)
.then(r=>r.json());

items=
r.results.slice(0,15);

renderRelated();

}

function renderRelated(){

const rel=
document.getElementById(
"rel"
);

if(!rel)return;

let h="";

items.forEach(v=>{

if(!v.poster_path)return;

h+=`

<div
class="rel-card"
onclick="go(${v.id})"
>

<img src="https://image.tmdb.org/t/p/w200${v.poster_path}">

</div>

`;

});

rel.innerHTML=h;

}

function move(dir){

const rel=
document.getElementById(
"rel"
);

if(!rel)return;

rel.scrollBy({

left:dir*300,
behavior:"smooth"

});

}

function go(i){

location.href=
`watch.html?id=${i}`;

}

load();

const params = new URLSearchParams(location.search);
const urlMode = params.get("mode");

if(urlMode === "id"){
mode = "id";
}

