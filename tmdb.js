const API = "9e335d21d35f04917b218bae7adc881f";

async function loadMovies(){

  const url =
    "https://api.themoviedb.org/3/discover/movie?api_key="
    + API
    + "&with_original_language=id";

  const res = await fetch(url);

  const data = await res.json();

  console.log(data);

  const grid = document.getElementById("grid");

  data.results.forEach(movie => {

    if(!movie.poster_path) return;

    const div = document.createElement("div");

    div.className = "card";

    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}">
      <div class="card-title">${movie.title}</div>
    `;

    div.onclick = async function(){

      const r = await fetch(
        "https://api.themoviedb.org/3/movie/"
        + movie.id
        + "?api_key="
        + API
        + "&append_to_response=external_ids"
      );

      const d = await r.json();

      const imdb = d.external_ids.imdb_id;

      if(!imdb) return;

      document.getElementById("modal").style.display = "block";

      document.getElementById("player").src =
        "https://vsembed.su/embed/movie?imdb=" + imdb;
    };

    grid.appendChild(div);

  });

}

loadMovies();
