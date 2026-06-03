const KEY="b3b893873ed1bb7f175b2707afeea2a0";

const id=new URLSearchParams(location.search).get("id");
const params=new URLSearchParams(location.search);
const urlMode=params.get("mode");

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

if(urlMode==="id"){
mode="id";
}

/* ===========================
BURGER
=========================== */

function toggleMenu(){
const menu=document.getElementById("mobileMenu");
if(menu) menu.classList.toggle("show");
}

/* ===========================
INDEX LOAD
=========================== */

async function load(){

if(id){
loadDetail();
return;
}

let url="";

if(query){
url=`https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${query}&page=${page}`;
}
else if(mode==="id"){
url=`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_origin_country=ID&page=${page}`;
}
else if(mode==="luar"){
url=`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&without_origin_country=ID&page=${page}`;
}
else{
url=`https://api.themoviedb.org/3/trending/movie/week?api_key=${KEY}&page=${page}`;
}

const data=await fetch(url).then(r=>r.json());

renderGrid(data.results);

if(document.getElementById("pagination")){
renderPagination(data.page);
}
}

/* ===========================
GRID (AMAN)
=========================== */

function renderGrid(data){
const grid=document.getElementById("grid");
if(!grid)return;

let h="";

data.forEach(m=>{
if(!m.poster_path)return;

h+=`
<div class="card" onclick="go(${m.id})" style="cursor:pointer">
<img src="https://image.tmdb.org/t/p/w300${m.poster_path}">
<div class="title">${m.title}</div>
</div>
`;
});

grid.innerHTML=h;
}

/* ===========================
PAGINATION FIX STABLE
=========================== */

function renderPagination(p){
const pagination=document.getElementById("pagination");
if(!pagination)return;

let h="";

if(page>1){
h+=`<button onclick="prevSet()">‹</button>`;
}

for(let i=p;i<p+6;i++){

h+=`
<button onclick="goPage(${i})"
style="
background:${i===page?'#ff2e2e':'#1a1a22'};
color:#fff;
font-weight:${i===page?'bold':'normal'};
">
${i}
</button>
`;
}

h+=`<button onclick="nextSet()">›</button>`;

pagination.innerHTML=h;
}

function goPage(p){
page=p;
load();
window.scrollTo({top:0,behavior:"smooth"});
}

function nextSet(){
page+=6;
load();
window.scrollTo({top:0,behavior:"smooth"});
}

function prevSet(){
page=Math.max(1,page-6);
load();
window.scrollTo({top:0,behavior:"smooth"});
}

/* ===========================
MODE
=========================== */

function setMode(m){
mode=m;
query="";
page=1;
load();
}

/* ===========================
DETAIL PAGE
=========================== */

if(document.getElementById("playLayer")){

document.getElementById("playLayer").onclick=function(){

if(!adsState){
adsState=true;
window.open(ads[Math.floor(Math.random()*ads.length)],"_blank");
return;
}

this.style.display="none";

document.getElementById("player").src=
`https://vsembed.ru/embed/movie?tmdb=${id}`;
};
}

/* ===========================
LOAD DETAIL + BUTTON SUB INDO FIX (INI YANG AMAN)
=========================== */

async function loadDetail(){

let m=await fetch(
`https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}&language=id-ID`
).then(r=>r.json());

if(!m.overview){
const backup=await fetch(
`https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}`
).then(r=>r.json());
m.overview=backup.overview;
}

document.getElementById("info").innerHTML=`
<h2>${m.title}</h2>
<p>⭐ Rating : ${m.vote_average.toFixed(1)}</p>
<p>📅 Rilis : ${m.release_date||"-"}</p>
<p>🌍 Negara : ${m.production_countries.map(c=>c.name).join(", ")}</p>
<p>🎭 Genre : ${m.genres.map(g=>g.name).join(", ")}</p>
<p style="margin-top:15px;line-height:1.7;opacity:.9;">
${m.overview||"Sinopsis tidak tersedia"}
</p>
`;

/* ===========================
🔴 SUB INDO BUTTON FIX (NO QUERYSELECTOR BUG)
=========================== */

let filmLokal = cariFilmIndonesia(m.title);

if(filmLokal){

const info = document.getElementById("info");

if(info){

info.insertAdjacentHTML("afterend",`
<div style="
max-width:900px;
margin:18px auto;
padding:15px;
border-radius:14px;
background:linear-gradient(90deg,rgba(20,20,20,.95),rgba(40,25,0,.95),rgba(20,20,20,.95));
border:1px solid rgba(255,215,0,.25);
box-shadow:0 0 25px rgba(255,215,0,.15);
display:flex;
justify-content:space-between;
align-items:center;
gap:15px;
flex-wrap:wrap;
">

<div>
<div style="font-size:18px;font-weight:bold;color:gold;">
🎬 Sub Indo Tersedia
</div>
<div style="font-size:13px;opacity:.7;margin-top:4px;">
Versi Indonesia siap ditonton
</div>
</div>

<a href="manual-watch.html?movie=${movies.indexOf(filmLokal)}"
style="
padding:12px 22px;
border-radius:30px;
background:gold;
color:#000;
font-weight:bold;
text-decoration:none;
box-shadow:0 0 20px rgba(255,215,0,.4);
">
TONTON SEKARANG →
</a>

</div>
`);
}
}

/* RELATED */
let r=await fetch(
`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${KEY}`
).then(r=>r.json());

items=r.results.slice(0,15);
renderRelated();
}

function renderRelated(){
const rel=document.getElementById("rel");
if(!rel)return;

let h="";

items.forEach(v=>{
if(!v.poster_path)return;

h+=`
<div class="rel-card" onclick="go(${v.id})">
<img src="https://image.tmdb.org/t/p/w200${v.poster_path}">
</div>
`;
});

rel.innerHTML=h;
}

function move(dir){
const rel=document.getElementById("rel");
if(!rel)return;

rel.scrollBy({
left:dir*300,
behavior:"smooth"
});
}

function go(i){
location.href=`watch.html?id=${i}`;
}

/* ===========================
SEARCH + BOOT
=========================== */

function searchMovie(){
const input=document.getElementById("search");
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
const input=document.querySelector("#mobileMenu input");
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
MOVIES LOAD
=========================== */

let movies=[];

fetch("movies.json")
.then(r=>r.json())
.then(data=>{
movies=data;
load();
});
