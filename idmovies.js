const KEY="b3b893873ed1bb7f175b2707afeea2a0";

let page=1;
let query="";

function toggleMenu(){

document
.getElementById("mobileMenu")
.classList.toggle("show");

}


async function load(){

let url="";

if(query){

url=`https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${query}&page=${page}`;

}else{

url=`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_origin_country=ID&page=${page}`;

}

const data=
await fetch(url)
.then(r=>r.json());

render(
data.results
);

renderPagination(
data.page
);

}


function render(data){

let h="";

data.forEach(m=>{

if(!m.poster_path)return;

h+=`

<div
class="card"
onclick="go(${m.id})">

<img src="https://image.tmdb.org/t/p/w300${m.poster_path}">

<div class="title">

${m.title}

</div>

</div>

`;

});

document
.getElementById(
"grid"
)
.innerHTML=h;

}


function renderPagination(p){

let h="";

for(
let i=p;
i<p+6;
i++
){

h+=`

<button
onclick="goPage(${i})">

${i}

</button>

`;

}

h+=`

<button
onclick="nextSet()">

›

</button>

`;

document
.getElementById(
"pagination"
)
.innerHTML=h;

}


function goPage(p){

page=p;

load();

}


function nextSet(){

page+=6;

load();

}


function go(id){

location.href=
`watch.html?id=${id}`;

}


function searchMovie(){

query=
document
.getElementById(
"search"
)
.value;

page=1;

load();

}


function searchMovieMobile(){

query=
document
.querySelector(
"#mobileMenu input"
)
.value;

page=1;

load();

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
