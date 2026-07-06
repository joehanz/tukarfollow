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
        <span title="Deskripsi">📖</span>
        <span title="Release">${movie.release_date}</span>
        <span title="Genre">${movie.genre.join(", ")}</span>
        <span title="Negara">${movie.country}</span>
      </div>
    `;
    feed.appendChild(card);
  });
  currentIndex += pageSize;
}

document.getElementById("loadMore").addEventListener("click", () => {
  renderMovies();
});

// Search toggle
document.getElementById("searchBtn").addEventListener("click", () => {
  document.getElementById("searchBar").classList.toggle("hidden");
});

// Home scroll
document.getElementById("homeBtn").addEventListener("click", () => {
  document.getElementById("feed").scrollTo({ top: 0, behavior: "smooth" });
});
