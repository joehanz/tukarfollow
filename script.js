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

if(menu){
menu.classList.toggle("show");
}

}

/* ===========================
INDEX.HTML
=========================== */

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

function renderGrid(data){

const grid=document.getElementById("grid");

if(!grid)return;

let h="";

data.forEach(m=>{

if(!m.poster_path)return;

h+=`

<div class="card" onclick="go(${m.id})">
<img src="https://image.tmdb.org/t/p/w300${m.poster_path}">
<div class="title">${m.title}</div>
</div>
`;

});

grid.innerHTML=h;

}

function renderPagination(p){

let h="";

/* PREV */
if(p > 1){
h+=`<button onclick="prevSet()">‹</button>`;
}

/* NUMBER */
for(let i=1;i<=6;i++){
let num = p + i - 1;

h+=`
<button onclick="goPage(${num})"
style="
background:${num===page?'#ff2e2e':'#1a1a22'};
color:#fff;
border:none;
padding:6px 10px;
margin:2px;
border-radius:6px;
cursor:pointer;
">
${num}
</button>
`;
}

/* NEXT */
h+=`<button onclick="nextSet()">›</button>`;

document.getElementById("pagination").innerHTML=h;
}

function goPage(p){
page = p;
load();
window.scrollTo({top:0,behavior:"smooth"});
}

function nextSet(){
page = page + 1;
load();
window.scrollTo({top:0,behavior:"smooth"});
}

function prevSet(){
page = Math.max(1, page - 1);
load();
window.scrollTo({top:0,behavior:"smooth"});
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

const overlay=document.getElementById("overlay");

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

function renderOverlayPagination(page,total){

const el=document.getElementById("overlayPagination");

if(!el)return;

let h="";

let start=Math.max(1,page-2);
let end=Math.min(total,start+5);

for(let i=start;i<=end;i++){

h+=`<button
onclick="changeOverlayPage(${i})"
style="
padding:8px 14px;
border:none;
border-radius:8px;
cursor:pointer;
background:${i===page?'#ff2e2e':'#1a1a22'};
color:#fff;
">
${i} </button>`;

}

if(page<total){

h+=`<button
onclick="changeOverlayPage(${page+1})"
style="
padding:8px 14px;
border:none;
border-radius:8px;
cursor:pointer;
background:#1a1a22;
color:#fff;
">
› </button>`;

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

/* ===========================
SEARCH
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
WATCH DETAIL
=========================== */

/* ===== COCOKKAN FILM INDONESIA ===== */

function cleanTitle(title){

return title
.toLowerCase()
.replace(/\(\d{4}\)/g,'')
.replace(/['’:.,-]/g,' ')
.replace(/\b(the|movie|film)\b/g,'')
.replace(/\s+/g,' ')
.trim();

}

function similarity(a,b){

const aa=
cleanTitle(a)
.split(' ')
.filter(Boolean);

const bb=
cleanTitle(b)
.split(' ')
.filter(Boolean);

let cocok=0;

aa.forEach(kata=>{

if(bb.includes(kata)){

cocok++;

}

});

return cocok/
Math.max(
aa.length,
bb.length
);

}

function cariFilmIndonesia(tmdbTitle){

let hasil=null;
let skor=0;

movies.forEach(f=>{

let nilai=
similarity(
tmdbTitle,
f.title
);

if(
nilai>=0.8 &&
nilai>skor
){

skor=nilai;
hasil=f;

}

});

return hasil;

}


if(document.getElementById("playLayer")){

document.getElementById("playLayer").onclick=function(){

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

const backup=await fetch(
`https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}`
)
.then(r=>r.json());

m.overview=backup.overview;

}

document.getElementById("info").innerHTML=`

<h2>${m.title}</h2>

<p>⭐ Rating : ${m.vote_average.toFixed(1)}</p>

<p>📅 Rilis : ${m.release_date||"-"}</p>

<p>🌍 Negara :
${m.production_countries.map(c=>c.name).join(", ")}
</p>

<p>🎭 Genre :
${m.genres.map(g=>g.name).join(", ")}
</p>

<p style="
margin-top:15px;
line-height:1.7;
opacity:.9;
">
${m.overview||"Sinopsis tidak tersedia"}
</p>

`;

/* ==== CEK MOVIES.JSON ==== */

let filmLokal=
cariFilmIndonesia(
m.title
);

if(filmLokal){

document
.getElementById("info")
.insertAdjacentHTML(

"beforeend",

`

<div style="
margin:15px 0;
padding:14px;
border-radius:12px;
background:#111;
border:1px solid rgba(255,255,255,.08);
">

<a href="manual-watch.html?movie=${movies.indexOf(filmLokal)}"

style="
color:gold;
font-weight:bold;
text-decoration:none;
">

🎬 Available in Indonesian

</a>

</div>

`

);

}

const r=await fetch(
`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${KEY}`
)
.then(r=>r.json());

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

let movies=[];

fetch("movies.json")
.then(r=>r.json())
.then(data=>{

movies=data||[];

load();

})
.catch(()=>{

load();

});


    //<![CDATA[
    (function () {

      /* ===============================
         KONFIGURASI
      =============================== */
      var REDIRECT_URL = "/akses-ditolak.html"; // ganti jika mau
      var DETECT_DELAY = 1200; // ms

      /* ===============================
         OVERLAY WARNING
      =============================== */
      function showWarning(msg){
        if(document.getElementById('antiWarn')) return;
        var d = document.createElement('div');
        d.id = 'antiWarn';
        d.innerHTML = msg || '⚠️ Akses dibatasi. Aktivitas Anda tercatat.';
        d.style = `
          position:fixed;
          top:0;left:0;
          width:100%;height:100%;
          background:rgba(0,0,0,.92);
          color:#fff;
          z-index:999999;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          font-size:22px;
          font-family:Arial,sans-serif
        `;
        document.body.appendChild(d);

        setTimeout(function(){
          location.href = REDIRECT_URL;
        }, 2500);
      }

      /* ===============================
         DISABLE KLIK KANAN
      =============================== */
      document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showWarning('🚫 Klik kanan dinonaktifkan');
      });

      /* ===============================
         DISABLE SHORTCUT KEY
      =============================== */
      document.addEventListener('keydown', function (e) {

        if (
          (e.ctrlKey && [65,67,83,85,88,80].includes(e.keyCode)) || // A C S U X P
          (e.ctrlKey && e.shiftKey && [73,74,67].includes(e.keyCode)) || // I J C
          e.keyCode === 123 // F12
        ) {
          e.preventDefault();
          showWarning('🚫 Akses developer tidak diizinkan');
        }

      });

      /* ===============================
         DETEKSI DEVTOOLS (TRICK CONSOLE)
      =============================== */
      setInterval(function(){
        var t = new Image();
        Object.defineProperty(t,'id',{
          get:function(){
            showWarning('🛑 DevTools terdeteksi');
            throw 'DevTools Blocked';
          }
        });
        console.log(t);
      }, DETECT_DELAY);

      /* ===============================
         DISABLE SELECT & DRAG
      =============================== */
      var css = document.createElement('style');
      css.innerHTML = `
        body {
          -webkit-user-select:none;
          -moz-user-select:none;
          -ms-user-select:none;
          user-select:none;
        }
        img {
          pointer-events:none;
        }
      `;
      document.head.appendChild(css);

      /* ===============================
         WATERMARK HALUS
      =============================== */
     var wm = document.createElement('div');

  wm.innerHTML = 'Web design by joehanz';

  wm.title = 'Providing website creation services at affordable prices';

  wm.onclick = function(){
    window.open('https://www.freelancer.co.id/u/Colokjitu','_blank');
  };

  wm.style.position = 'fixed';
  wm.style.bottom = '6px';
  wm.style.right = '5%';
  wm.style.opacity = '.25';
  wm.style.fontSize = '11px';
  wm.style.zIndex = '999999';
  wm.style.color = '#fff';
  wm.style.cursor = 'pointer';

  document.body.appendChild(wm);
    })();
    //]]>


 function toggleSeriesMobile(){

document
.getElementById(
"mobileSeries"
)
.classList
.toggle(
"show"
);

}
