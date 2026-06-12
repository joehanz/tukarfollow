const API = "b3b893873ed1bb7f175b2707afeea2a0";
const BASE = "https://api.themoviedb.org/3";

let page=1,genre="",year="",query="";

document.addEventListener("DOMContentLoaded",()=>{
  burger();

  if(document.getElementById("grid")){
    genres();
    load();
    search();
    years();
  }

  if(document.getElementById("frame")) watch();
});

/* NAV */
function burger(){
  const b=document.getElementById("burgerBtn");
  const m=document.getElementById("navMenu");
  b.onclick=()=>m.classList.toggle("active");
}

/* GENRE */
async function genres(){
  const r=await fetch(`${BASE}/genre/movie/list?api_key=${API}`);
  const d=await r.json();

  document.getElementById("genreMenu").innerHTML=
  d.genres.map(g=>`<a href="#" onclick="setG(${g.id},'${g.name}')">${g.name}</a>`).join("");
}

function setG(id,name){
  genre=id;query="";year="";page=1;
  document.getElementById("title").innerText=name;
  load();
}

/* LOAD */
async function load(){
  let url=`${BASE}/trending/all/week?api_key=${API}&page=${page}`;

  if(query) url=`${BASE}/search/multi?api_key=${API}&query=${query}`;
  if(genre) url=`${BASE}/discover/movie?api_key=${API}&with_genres=${genre}`;
  if(year) url=`${BASE}/discover/movie?api_key=${API}&primary_release_year=${year}`;

  const r=await fetch(url);
  const d=await r.json();

  render(d.results);
}

/* GRID */
function render(items){
  const g=document.getElementById("grid");

  g.innerHTML=items.map(i=>{
    const t=i.title||i.name;
    const y=(i.release_date||"").split("-")[0]||"-";
    const img=`https://image.tmdb.org/t/p/w500${i.poster_path}`;

    return `
<div class="card" onclick="go(${i.id},'${encodeURIComponent(t)}')">
<img src="${img}">
<div class="badge left">WEBRIP</div>
<div class="badge right">${y}</div>
<div class="title">${t}</div>
</div>`;
  }).join("");
}

function go(id,title){
  location.href=`watch.html?id=${id}&title=${title}`;
}

/* SEARCH */
function search(){
  document.getElementById("searchForm").onsubmit=e=>{
    e.preventDefault();
    query=document.getElementById("searchInput").value;
    load();
  };
}

/* YEAR */
function years(){
  document.querySelectorAll(".year").forEach(x=>{
    x.onclick=e=>{
      e.preventDefault();
      year=x.dataset.year;
      load();
    };
  });
}

/* WATCH */
async function watch(){
  const id=new URLSearchParams(location.search).get("id");

  const local=await fetch("movies.json").then(r=>r.json());
  const m=local.find(x=>x.tmdb_id==id);

  let iframe="";

  if(m){
    document.getElementById("mTitle").innerText=m.title;
    document.getElementById("mMeta").innerText=m.release_date+" | "+m.country;
    document.getElementById("mDesc").innerText=m.sinopsis;
    iframe=m.iframe;
  }

  if(iframe) document.getElementById("frame").src=iframe;

  layer();
}

/* LAYER 6 DETIK */
function layer(){
  const l=document.getElementById("layer");
  const img=document.getElementById("layerImg");

  setTimeout(()=>img.src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgAkJiGKw5otYyJgpBBtop9PZXrNpbMHJUvpja586ANY4sU_n6YWV7axeh02uKQtvfBWJlXCUS67JR6xIuvx_o7__3JZMmz9lFrnB78WQkymFMzPJE4L2x4uPWH2fNsKJsACIdaQTaVTW4DK1QIgmSJqUzg0DkXIux4DANoKd5QGoQxWwyrxEXEJkBC5U/s1500/segera-dimulai.webp",0);
  setTimeout(()=>l.style.display="none",6000);
}
