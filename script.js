const phoneContainer = document.getElementById('phoneContainer');
const mainContent = document.getElementById('mainContent');
const searchOverlay = document.getElementById('searchOverlay');
const navSearch = document.getElementById('navSearch');
const searchInput = document.getElementById('searchInput');
const infoActionBtn = document.getElementById('infoActionBtn');
const infoPanel = document.getElementById('infoPanel');
const closeInfoBtn = document.getElementById('closeInfoBtn');
const playBtnContainer = document.getElementById('playBtnContainer');

let currentMovie = null;

// Fetch TMDB popular movies
fetch("https://api.themoviedb.org/3/movie/popular?api_key=c000d7b8b0f5ee16b98b6103009745d8&language=id-ID&page=1")
  .then(res => res.json())
  .then(data => {
    // Film pertama jadi default
    setMovie(data.results[0]);

    // Render semua film ke grid yang sudah ada
    const movieList = document.getElementById("movieList");
    data.results.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w342${movie.poster_path}" alt="${movie.title}">
        <p>${movie.title}</p>
      `;
      card.addEventListener("click", () => setMovie(movie));
      movieList.appendChild(card);
    });
  });

function setMovie(movie) {
  currentMovie = movie;
  const bgUrl = `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`;
  mainContent.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url('${bgUrl}')`;
  document.querySelector(".movie-title-center").textContent = movie.title;
  document.querySelector(".movie-details h2").textContent = movie.title;
  document.querySelector(".movie-details p").textContent = movie.overview;
  document.querySelector(".action-sidebar .action-item:nth-child(2) span").textContent = movie.release_date.split("-")[0];
  document.querySelector(".info-header h3").textContent = movie.title;
  document.querySelector(".info-list .info-row:nth-child(1) p").textContent = movie.overview;
  document.querySelector(".info-list .info-row:nth-child(2) p").textContent = movie.release_date;
}

// Search overlay
navSearch.addEventListener('click', e => {
  e.stopPropagation();
  searchOverlay.classList.toggle('active');
  if (searchOverlay.classList.contains('active')) {
    searchInput.focus();
    infoPanel.classList.remove('active');
  }
});

// Info panel
infoActionBtn.addEventListener('click', e => {
  e.stopPropagation();
  infoPanel.classList.toggle('active');
  searchOverlay.classList.remove('active');
});
closeInfoBtn.addEventListener('click', e => {
  e.stopPropagation();
  infoPanel.classList.remove('active');
});

// Play mode
playBtnContainer.addEventListener('click', e => {
  e.stopPropagation();
  phoneContainer.classList.add('play-mode');
  searchOverlay.classList.remove('active');
  infoPanel.classList.remove('active');

  if (currentMovie) {
    fetch("movies.json")
      .then(res => res.json())
      .then(list => {
        const movie = list.find(m => m.id === currentMovie.id);
        if (movie) {
          const iframe = document.createElement("iframe");
          iframe.src = movie.iframe;
          iframe.width = "100%";
          iframe.height = "100%";
          iframe.frameBorder = "0";
          iframe.allowFullscreen = true;
          iframe.style.position = "absolute";
          iframe.style.top = "0";
          iframe.style.left = "0";
          iframe.style.zIndex = "999";
          mainContent.appendChild(iframe);
        } else {
          alert("Film tidak tersedia di player.");
        }
      });
  }
});

// Exit play mode
mainContent.addEventListener('click', () => {
  if (phoneContainer.classList.contains('play-mode')) {
    phoneContainer.classList.remove('play-mode');
    const iframe = mainContent.querySelector("iframe");
    if (iframe) iframe.remove();
  } else {
    searchOverlay.classList.remove('active');
    infoPanel.classList.remove('active');
  }
});
mainContent.addEventListener('wheel', () => {
  if (phoneContainer.classList.contains('play-mode')) {
    phoneContainer.classList.remove('play-mode');
    const iframe = mainContent.querySelector("iframe");
    if (iframe) iframe.remove();
  }
});
