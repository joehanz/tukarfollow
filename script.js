let movies = [];
let currentIndex = 0;
const pageSize = 10;

// Ambil data dari movies.json
fetch("movies.json")
  .then(res => res.json())
  .then(data => {
    movies = data;
    renderMovies();
  })
  .catch(err => console.error("Error load JSON:", err));

// Render film per halaman
function renderMovies() {
  const feed = document.getElementById("feed");
  const template = document.getElementById("movieTemplate");

  const slice = movies.slice(currentIndex, currentIndex + pageSize);
  slice.forEach(movie => {
    const clone = template.content.cloneNode(true);

    // Poster & caption
    clone.querySelector(".poster").src = movie.image;
    clone.querySelector(".movie-title").textContent = movie.title;
    clone.querySelector(".movie-desc").textContent = movie.sinopsis;

    // Play button
    clone.querySelector(".play-btn").addEventListener("click", () => {
      playMovie(movie.iframe);
    });

    // Icon kanan
    clone.querySelector(".infoBtn").addEventListener("click", () => showInfo(movie));
    clone.querySelector(".dateBtn").addEventListener("click", () => showInfo(movie));
    clone.querySelector(".genreBtn").addEventListener("click", () => showInfo(movie));
    clone.querySelector(".countryBtn").addEventListener("click", () => showInfo(movie));

    feed.appendChild(clone);
  });

  currentIndex += pageSize;
}

// Load More
document.getElementById("loadMore").addEventListener("click", () => {
  renderMovies();
});

// Info panel toggle
function showInfo(movie) {
  const panel = document.getElementById("infoPanel");
  document.getElementById("infoTitle").textContent = movie.title;
  document.getElementById("infoSinopsis").textContent = movie.sinopsis;
  document.getElementById("infoDate").textContent = movie.release_date;
  document.getElementById("infoGenre").textContent = movie.genre.join(", ");
  document.getElementById("infoCountry").textContent = movie.country;
  panel.classList.remove("hidden");
}
document.getElementById("closeInfo").addEventListener("click", () => {
  document.getElementById("infoPanel").classList.add("hidden");
});

// Play movie overlay
function playMovie(url) {
  const overlay = document.getElementById("playerOverlay");
  const player = document.getElementById("moviePlayer");
  player.src = url;
  overlay.classList.remove("hidden");

  // Sembunyikan icon & nav
  document.querySelectorAll(".actions, #bottomNav, .play-btn").forEach(el => el.style.display = "none");
}

// Auto close player saat scroll
document.getElementById("feed").addEventListener("scroll", () => {
  const overlay = document.getElementById("playerOverlay");
  if (!overlay.classList.contains("hidden")) {
    overlay.classList.add("hidden");
    document.getElementById("moviePlayer").src = "";
    document.querySelectorAll(".actions, #bottomNav, .play-btn").forEach(el => el.style.display = "");
  }
});

// Search toggle
document.getElementById("searchBtn").addEventListener("click", () => {
  document.getElementById("searchBar").classList.toggle("active");
});

// Search function
document.getElementById("searchInput").addEventListener("input", e => {
  const keyword = e.target.value.toLowerCase();
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  currentIndex = 0;

  movies.filter(m =>
    m.title.toLowerCase().includes(keyword) ||
    m.sinopsis.toLowerCase().includes(keyword) ||
    m.genre.join(", ").toLowerCase().includes(keyword) ||
    m.country.toLowerCase().includes(keyword)
  ).forEach(movie => {
    const clone = document.getElementById("movieTemplate").content.cloneNode(true);
    clone.querySelector(".poster").src = movie.image;
    clone.querySelector(".movie-title").textContent = movie.title;
    clone.querySelector(".movie-desc").textContent = movie.sinopsis;
    clone.querySelector(".play-btn").addEventListener("click", () => playMovie(movie.iframe));
    clone.querySelector(".infoBtn").addEventListener("click", () => showInfo(movie));
    clone.querySelector(".dateBtn").addEventListener("click", () => showInfo(movie));
    clone.querySelector(".genreBtn").addEventListener("click", () => showInfo(movie));
    clone.querySelector(".countryBtn").addEventListener("click", () => showInfo(movie));
    feed.appendChild(clone);
  });
});

// Home scroll
document.getElementById("homeBtn").addEventListener("click", () => {
  document.getElementById("feed").scrollTo({ top: 0, behavior: "smooth" });
});
