const API_KEY = "0ca481842a3f253ed72008c1d9e9f2e6";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const grid = document.getElementById("movie-grid");

async function getMovies() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();
  data.results.forEach(movie => {
    const img = document.createElement("img");
    img.src = IMG_URL + movie.poster_path;
    img.onclick = () => {
      window.location.href = `watch.html?id=${movie.id}`;
    };
    grid.appendChild(img);
  });
}
getMovies();
