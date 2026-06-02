const ITEMS_PER_PAGE=24;

let movies=[];
let filtered=[];
let page=1;

/* BURGER */

function toggleMenu(){

document
.getElementById("mobileMenu")
.classList.toggle("show");

}

/* LOAD JSON */

async function load(){

try{

const data=await fetch(
"movies.json"
);

movies=await data.json();

filtered=[...movies];

render();

}
catch(err){

console.log(
"movies.json gagal dimuat",
err
);

}

}

/* RENDER GRID */

function render(){

const start=
(page-1)*ITEMS_PER_PAGE;

const end=
start+ITEMS_PER_PAGE;

const current=
filtered.slice(
start,
end
);

let h="";

current.forEach((m,i)=>{

h+=`

<div
class="card"
onclick="go(${movies.indexOf(m)})"
>

<img
src="${m.image}"
loading="lazy"
>

<div class="title">

${m.title}

</div>

</div>

`;

});

document
.getElementById("grid")
.innerHTML=h;

renderPagination();

}

/* PAGINATION */

function renderPagination(){

const totalPages=
Math.ceil(
filtered.length/
ITEMS_PER_PAGE
);

let h="";

let start=
Math.max(
1,
page-2
);

let end=
Math.min(
totalPages,
start+5
);

for(
let i=start;
i<=end;
i++
){

h+=`

<button
onclick="goPage(${i})"
style="
background:
${i===page
?'#ff2e2e'
:'#1a1a22'
};
"
>

${i}

</button>

`;

}

if(page<totalPages){

h+=`

<button
onclick="goPage(${page+1})"
>

›

</button>

`;

}

document
.getElementById(
"pagination"
)
.innerHTML=h;

}

/* PAGE */

function goPage(p){

page=p;

render();

window.scrollTo({

top:0,
behavior:"smooth"

});

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

page=1;

if(!q){

filtered=
[...movies];

render();

return;

}

filtered=
movies.filter(m=>

m.title
.toLowerCase()
.includes(q)

);

render();

}

/* MOBILE SEARCH */

function searchMovieMobile(){

const q=
document
.querySelector(
"#mobileMenu input"
)
.value
.toLowerCase()
.trim();

page=1;

if(!q){

filtered=
[...movies];

render();

return;

}

filtered=
movies.filter(m=>

m.title
.toLowerCase()
.includes(q)

);

render();

}

/* OPEN WATCH */

function go(i){

location.href=
`manual-watch.html?movie=${i}`;

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
