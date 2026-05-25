const API = atob("9e335d21d35f04917b218bae7adc881f");

let page = 1;

/* =========================
   RANDOM SITES
========================= */
const sites = [
  "https://rajarayap.com",
  "https://caturbangunsentosa.blogspot.com",
  "https://ptdwiprima.blogspot.com"
];

/* =========================
   RANDOM PICK
========================= */
function randomSite(){
  return sites[Math.floor(Math.random() * sites.length)];
}

/* =========================
   ONLY FILM INDONESIA
========================= */
function endpoint(){
  return "https://api.themoviedb.org/3/discover/movie?api_key="
    + API
    + "&with_original_language=id"
    + "&sort_by=popularity.desc"
    + "&page=" + page;
}

/* =========================
   GRID LOAD
========================= */
async function load(){

  document.getElementById("pageNum").innerText = page;

  const r = await fetch(endpoint());
  const d = await r.json();

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  d.results.forEach(m => {

    if(!m.poster_path) return;

    const el = document.createElement("div");
    el.className = "card";

    el.innerHTML = `
      <img src='https://image.tmdb.org/t/p/w300${m.poster_path}'/>
      <div class='card-title'>${m.title}</div>
    `;

    el.onclick = () => openMovie(m.id);

    grid.appendChild(el);
  });
}

/* =========================
   PAGINATION
========================= */
function nextPage(){
  page++;
  load();
}

function prevPage(){
  if(page > 1){
    page--;
    load();
  }
}

/* =========================
   CLICK STATE TRACKER
========================= */
let clickStep = 0;

/* =========================
   OPEN MOVIE
========================= */
async function openMovie(id){

  document.getElementById("modal").style.display = "flex";
  document.body.classList.add("modal-open");

  const r = await fetch(
    "https://api.themoviedb.org/3/movie/" +
    id +
    "?api_key=" + API +
    "&append_to_response=external_ids"
  );

  const d = await r.json();

  document.getElementById("title").innerText = d.title;

  document.getElementById("meta").innerHTML =
    "⭐ " + d.vote_average +
    " | 📅 " + d.release_date +
    " | 🎭 " + d.genres.map(g => g.name).join(", ") +
    " | 🌍 " + (d.production_countries?.[0]?.name || "-") +
    " | <span id='onlineCounter'>👁️ 0 Watching</span>";

  document.getElementById("desc").innerText =
    d.overview || "";

  const imdb = d.external_ids?.imdb_id;

  if(!imdb){
    document.getElementById("player").src = "";
    return;
  }

  const url =
    "https://vsembed.su/embed/movie?imdb=" + imdb;

  const player = document.getElementById("player");

  player.src = url;

  clickStep = 0;

  addOverlay(player, url);
}

/* =========================
   OVERLAY LOGIC
========================= */
function addOverlay(player, url){

  const modal = document.getElementById("modal");

  const old = document.getElementById("clickLayer");
  if(old) old.remove();

  const layer = document.createElement("div");

  layer.id = "clickLayer";

  layer.style.position = "absolute";
  layer.style.top = "0";
  layer.style.left = "0";
  layer.style.width = "100%";
  layer.style.height = "100%";
  layer.style.background = "rgba(0,0,0,0.05)";
  layer.style.zIndex = "9999";
  layer.style.cursor = "pointer";

  modal.appendChild(layer);

  layer.onclick = function(){

    clickStep++;

    /* STEP 1 & 2 */
    if(clickStep === 1 || clickStep === 2){
      window.open(randomSite(), "_blank");
      return;
    }

    /* STEP 3 */
    if(clickStep >= 3){
      layer.remove();
      clickStep = 0;
    }
  };
}

/* =========================
   CLOSE MODAL
========================= */
function closeModal(){

  document.getElementById("modal").style.display = "none";

  document.getElementById("player").src = "";

  document.body.classList.remove("modal-open");

  const layer = document.getElementById("clickLayer");

  if(layer) layer.remove();

  clickStep = 0;
}

/* =========================
   INIT
========================= */
load();
