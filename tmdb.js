const API = "9e335d21d35f04917b218bae7adc881f";

document.addEventListener("DOMContentLoaded", () => {
  loadMovies();
});

async function loadMovies(){

  const grid = document.getElementById("grid");
  if(!grid){
    console.error("GRID tidak ditemukan");
    return;
  }

  const url =
    "https://api.themoviedb.org/3/discover/movie?api_key="
    + API
    + "&with_original_language=id";

  try {

    const res = await fetch(url);
    const data = await res.json();

    console.log("TMDB DATA:", data);

    grid.innerHTML = "";

    data.results.forEach(movie => {

      if(!movie.poster_path) return;

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}">
        <div class="card-title">${movie.title}</div>
      `;

      div.onclick = () => openMovie(movie.id);

      grid.appendChild(div);
    });

  } catch(err){
    console.error("TMDB ERROR:", err);
  }
}

async function openMovie(id){

  const modal = document.getElementById("modal");
  const player = document.getElementById("player");

  if(!modal || !player){
    console.error("MODAL / PLAYER tidak ditemukan");
    return;
  }

  const r = await fetch(
    "https://api.themoviedb.org/3/movie/"
    + id
    + "?api_key="
    + API
    + "&append_to_response=external_ids"
  );

  const d = await r.json();

  const imdb = d?.external_ids?.imdb_id;

  if(!imdb){
    alert("IMDB ID tidak ditemukan");
    return;
  }

  modal.style.display = "block";

  player.src =
    "https://vsembed.su/embed/movie?imdb=" + imdb;
}
