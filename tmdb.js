<body>

<style>
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
  gap:15px;
  padding:20px;
}

.card{
  background:#111;
  border-radius:10px;
  overflow:hidden;
  cursor:pointer;
}

.card img{
  width:100%;
  height:240px;
  object-fit:cover;
}

.card-title{
  padding:10px;
  color:#fff;
  font-size:14px;
}

.modal{
  position:fixed;
  inset:0;
  background:#000;
  display:none;
  z-index:99999;
}

.modal iframe{
  width:100%;
  height:100%;
  border:0;
}
</style>

<div class='grid' id='grid'></div>

<div class='modal' id='modal'>
  <iframe id='player' allowfullscreen=''></iframe>
</div>

<script>

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

</script>

</body>
