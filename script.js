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

// Toggle info panel
function toggleInfo(text) {
  const panel = document.getElementById("infoPanel");
  if (panel.classList.contains("hidden") || panel.innerHTML !== text) {
    panel.innerHTML = text;
    panel.classList.remove("hidden");
  } else {
    panel.classList.add("hidden");
  }
}

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
