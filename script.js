let movies = [];
let currentIndex = 0;
const pageSize = 10;

fetch("movies.json")
  .then(res => res.json())
  .then(data => {
    movies = data;
    renderMovies();
  });

function renderMovies() {
  const feed = document.getElementById("feed");
  const slice = movies.slice(currentIndex, currentIndex + pageSize);
  slice.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <div class="play-btn" onclick="playMovie('${movie.iframe}')">▶️</div>
      <div class="actions">
        <span onclick="toggleInfo('📖 ${movie.sinopsis}')">📖</span>
        <span onclick="toggleInfo('📅 ${movie.release_date}')">📅</span>
        <span onclick="toggleInfo('🎭 ${movie.genre.join(", ")}')">🎭</span>
        <span onclick="toggleInfo('🌍 ${movie.country}')">🌍</span>
      </div>
    `;
    feed.appendChild(card);
  });
  currentIndex += pageSize;
}

document.getElementById("loadMore").addEventListener("click", () => {
  renderMovies();
});

// Info panel toggle
function toggleInfo(text) {
  const panel = document.getElementById("infoPanel");
  if (panel.classList.contains("hidden") || panel.innerHTML !== text) {
    panel.innerHTML = text;
    panel.classList.remove("hidden");
  } else {
    panel.classList.add("hidden");
  }
}

// Play movie
function playMovie(url) {
  const overlay = document.getElementById("playerOverlay");
  overlay.innerHTML = `<iframe src="${url}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
  overlay.classList.remove("hidden");
  // hide icons & nav
  document.querySelectorAll(".actions, .bottom-nav, .play-btn").forEach(el => el.style.display = "none");
}

// Auto close player on scroll
document.getElementById("feed").addEventListener("scroll", () => {
  const overlay = document.getElementById("playerOverlay");
  if (!overlay.classList.contains("hidden")) {
    overlay.classList.add("hidden");
    overlay.innerHTML = "";
    document.querySelectorAll(".actions, .bottom-nav, .play-btn").forEach(el => el.style.display = "");
  }
});

// Search toggle
document.getElementById("searchBtn").addEventListener("click", () => {
  document.getElementById("searchBar").classList.toggle("hidden");
});

// Search function
document.getElementById("searchInput").addEventListener("input", e => {
  const keyword = e.target.value.toLowerCase();
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  movies.filter(m => 
    m.title.toLowerCase().includes(keyword) ||
    m.sinopsis.toLowerCase().includes(keyword) ||
    m.genre.join(", ").toLowerCase().includes(keyword) ||
    m.country.toLowerCase().includes(keyword)
  ).forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <div class="play-btn" onclick="playMovie('${movie.iframe}')">▶️</div>
      <div class="actions">
        <span onclick="toggleInfo('📖 ${movie.sinopsis}')">📖</span>
        <span onclick="toggleInfo('📅 ${movie.release_date}')">📅</span>
        <span onclick="toggleInfo('🎭 ${movie.genre.join(", ")}')">🎭</span>
        <span onclick="toggleInfo('🌍 ${movie.country}')">🌍</span>
      </div>
    `;
    feed.appendChild(card);
  });
});

// Home scroll
document.getElementById("homeBtn").addEventListener("click", () => {
  document.getElementById("feed").scrollTo({ top: 0, behavior: "smooth" });
});
