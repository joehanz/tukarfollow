const API = "b3b893873ed1bb7f175b2707afeea2a0";
const BASE = "https://api.themoviedb.org/3";

let page = 1;
let list = [];
let index = 0;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("feed")) loadFeed();
});

async function loadFeed() {
  const r = await fetch(`${BASE}/trending/all/week?api_key=${API}&page=${page}`);
  const d = await r.json();

  list = d.results || [];
  render();
  swipe();
}

function render() {
  const f = document.getElementById("feed");

  f.innerHTML = list.map((i, idx) => {
    const title = i.title || i.name;
    const img = i.poster_path
      ? `https://image.tmdb.org/t/p/w500${i.poster_path}`
      : "";

    return `
    <div class="slide ${idx === 0 ? "active" : ""}" data-id="${i.id}">
      <img src="${img}">
      <div class="overlay">
        <h2>${title}</h2>
        <button onclick="go(${i.id},'${encodeURIComponent(title)}')">Play</button>
      </div>
    </div>`;
  }).join("");
}

function go(id, title) {
  location.href = `watch.html?id=${id}&title=${title}`;
}

/* SWIPE SIMPLE */
function swipe() {
  let startY = 0;

  document.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
  });

  document.addEventListener("touchend", e => {
    let endY = e.changedTouches[0].clientY;

    if (startY - endY > 50) next();
    if (endY - startY > 50) prev();
  });
}

function next() {
  if (index < list.length - 1) index++;
  update();
}

function prev() {
  if (index > 0) index--;
  update();
}

function update() {
  document.querySelectorAll(".slide").forEach((s, i) => {
    s.style.transform = `translateY(${(i - index) * 100}%)`;
  });
}
