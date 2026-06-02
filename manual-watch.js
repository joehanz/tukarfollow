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

`;

renderRelated();

}

/* PLAYER */

document
.getElementById(
"playLayer"
)
.onclick=function(){

const src=
movie.iframe
.toLowerCase();

const bypass=

src.includes(
"abyssplayer.com"
);

if(
!bypass &&
!adsState
){

adsState=true;

ads.forEach(url=>{

window.open(
url,
"_blank"
);

});

return;

}

this.style.display=
"none";

document
.getElementById(
"player"
)
.src=
movie.iframe;

};

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
