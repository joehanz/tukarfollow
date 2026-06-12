const API = "b3b893873ed1bb7f175b2707afeea2a0";
let movies = [];
let page = 1;
let perPage = 8;

/* INIT */
fetch("movies.json")
.then(r=>r.json())
.then(d=>{
  movies = d;
  if(document.getElementById("grid")) loadIndex();
  if(document.getElementById("player")) loadWatch();
});

/* NAV */
document.addEventListener("click",e=>{
  if(e.target.id==="burger"){
    document.getElementById("navMenu").classList.toggle("active");
  }
});

/* INDEX */
function loadIndex(){
  renderGrid();
  renderPagination();
}

function renderGrid(){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  let start = (page-1)*perPage;
  let data = movies.slice(start,start+perPage);

  data.forEach(m=>{
    const el = document.createElement("div");
    el.className="card";
    el.innerHTML=`
      <img src="${m.image}">
      <div class="badge">WEBRIP</div>
      <div class="year">${m.release_date.slice(-4)}</div>
      <div class="title">${m.title}</div>
    `;
    el.onclick=()=>{
      location.href=`watch.html?id=${m.tmdb_id}&title=${encodeURIComponent(m.title)}`;
    };
    grid.appendChild(el);
  });
}

function renderPagination(){
  const p = document.getElementById("pagination");
  p.innerHTML="";

  for(let i=1;i<=5;i++){
    let b=document.createElement("button");
    b.textContent=i;
    b.onclick=()=>{page=i;renderGrid();}
    p.appendChild(b);
  }
}

/* WATCH */
function loadWatch(){
  const url = new URL(location.href);
  const id = url.searchParams.get("id");
  const title = decodeURIComponent(url.searchParams.get("title"));

  const movie = movies.find(m=>m.tmdb_id==id);

  if(movie && movie.title===title){
    play(movie.iframe);
  }else{
    play(`https://vsembed.ru/?id=${id}`);
  }

  loadTMDB(id);
}

/* PLAYER */
function play(src){
  const iframe=document.getElementById("player");
  iframe.src=src;
  showOverlay();
}

/* OVERLAY 6 DETIK */
function showOverlay(){
  const overlay=document.getElementById("overlay");

  overlay.classList.remove("hidden");
  overlay.innerHTML=`<img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgAkJiGKw5otYyJgpBBtop9PZXrNpbMHJUvpja586ANY4sU_n6YWV7axeh02uKQtvfBWJlXCUS67JR6xIuvx_o7__3JZMmz9lFrnB78WQkymFMzqPJE4L2x4uPWH2fNsKJsACIdaQTaVTW4DK1QIgmSJqUzg0DkXIux4DANoKd5QGoQxWwyrxEXEJkBC5U/s1500/segera-dimulai.webp" style="width:100%">`;

  setTimeout(()=>{
    let ads=[
      "https://site1.com",
      "https://site2.com",
      "https://site3.com"
    ];

    overlay.innerHTML = ads.map(a=>`<a href="${a}" target="_blank">${a}</a>`).join("<br>");

    setTimeout(()=>{
      overlay.classList.add("hidden");
    },3000);

  },3000);
}

/* TMDB DETAIL + RELATED */
async function loadTMDB(id){
  let res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API}&language=id`);
  let data = await res.json();

  document.getElementById("info").innerHTML=`
    <h2>${data.title}</h2>
    <p>${data.overview}</p>
  `;

  loadRelated(id);
}

async function loadRelated(id){
  let res = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API}`);
  let data = await res.json();

  const wrap = document.getElementById("related");
  wrap.innerHTML="";

  data.results.forEach(m=>{
    let img = `https://image.tmdb.org/t/p/w200${m.poster_path}`;
    wrap.innerHTML+=`<img src="${img}">`;
  });
}
