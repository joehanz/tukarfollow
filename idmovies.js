const KEY="b3b893873ed1bb7f175b2707afeea2a0";

let page=1;
let query="";

function toggleMenu(){

document
.getElementById("mobileMenu")
.classList.toggle("show");

}

/* ===========================
LOAD DATA
=========================== */

async function load(){

let url="";

if(query){

url=`https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${query}&page=${page}`;

}else{

url=`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_origin_country=ID&page=${page}`;

}

const data=await fetch(url).then(r=>r.json());

render(data.results);

if(document.getElementById("pagination")){
renderPagination(data.page);
}

}

/* ===========================
RENDER GRID
=========================== */

function render(data){

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

document.getElementById("grid").innerHTML=h;

}

/* ===========================
PAGINATION FIX (INDEX STYLE)
=========================== */

function renderPagination(p){

const pagination=document.getElementById("pagination");
if(!pagination)return;

let h="";

/* prev */
if(p>1){
h+=`
<button onclick="prevSet()">‹</button>
`;
}

/* numbers */
for(let i=p;i<p+6;i++){

h+=`
<button onclick="goPage(${i})"
style="
background:${i===page?'#ff2e2e':'#1a1a22'};
color:#fff;
">
${i}
</button>
`;
}

/* next */
h+=`
<button onclick="nextSet()">›</button>
`;

pagination.innerHTML=h;
}

/* ===========================
PAGINATION CONTROL
=========================== */

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
NAVIGATION
=========================== */

function go(id){
location.href=`watch.html?id=${id}`;
}

/* ===========================
SEARCH
=========================== */

function searchMovie(){

query=document.getElementById("search").value;
page=1;
load();

}

function searchMovieMobile(){

query=document.querySelector("#mobileMenu input").value;
page=1;
load();

}

/* ===========================
INIT
=========================== */

load();
