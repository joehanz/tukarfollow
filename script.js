const API_KEY = "c000d7b8b0f5ee16b98b6103009745d8";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const grid = document.getElementById("movie-grid");

async function getMovies() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
  const data = await res.json();
  console.log("TMDB response:", data);

  if (!data.results) {
    grid.innerHTML = "<p style='color:white'>API gagal, cek console.</p>";
    return;
  }

  data.results.forEach(movie => {
    if (movie.poster_path) {
      const img = document.createElement("img");
      img.src = IMG_URL + movie.poster_path;
      img.alt = movie.title;
      img.onclick = () => {
        window.location.href = `watch.html?id=${movie.id}`;
      };
      grid.appendChild(img);
    }
  });
}
getMovies();
