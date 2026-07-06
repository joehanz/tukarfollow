// Ambil elemen DOM
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

// Fetch film populer
fetch("https://api.themoviedb.org/3/movie/popular?api_key=c000d7b8b0f5ee16b98b6103009745d8&language=id-ID&page=1")
  .then(res => res.json())
  .then(data => {
    // Film pertama jadi background utama
    currentMovie = data.results[0];
    const bgUrl = `https://image.tmdb.org/t/p/w780${currentMovie.backdrop_path}`;
    mainContent.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url('${bgUrl}')`;

    // Isi judul & detail
    document.querySelector(".movie-title-center").textContent = currentMovie.title;
    document.querySelector(".movie-details h2").textContent = currentMovie.title;
    document.querySelector(".movie-details p").textContent = currentMovie.overview;

    // Render semua film ke list
    const movieList = document.createElement("div");
    movieList.id = "movieList";
    movieList.style.display = "grid";
    movieList.style.gridTemplateColumns = "repeat(2, 1fr)";
    movieList.style.gap = "10px";
    movieList.style.marginTop = "20px";

    data.results.forEach(movie => {
      const card = document.createElement("div");
      card.style.cursor = "pointer";
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w342${movie.poster_path}" alt="${movie.title}" style="width:100%; border-radius:8px;">
        <p style="font-size:12px; color:#fff; margin-top:4px;">${movie.title}</p>
      `;
      card.addEventListener("click", () => {
        // ganti background & detail saat klik poster
        currentMovie = movie;
        const bg = `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`;
        mainContent.style.backgroundImage = `linear-gradient(...), url('${bg}')`;
        document.querySelector(".movie-title-center").textContent = movie.title;
        document.querySelector(".movie-details h2").textContent = movie.title;
        document.querySelector(".movie-details p").textContent = movie.overview;
      });
      movieList.appendChild(card);
    });

    mainContent.appendChild(movieList);
  });


// --- FITUR 1: SEARCH BAR ---
navSearch.addEventListener('click', (e) => {
  e.stopPropagation();
  searchOverlay.classList.toggle('active');
  if (searchOverlay.classList.contains('active')) {
    searchInput.focus();
    infoPanel.classList.remove('active');
  }
});

// --- FITUR 2: INFO PANEL ---
infoActionBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  infoPanel.classList.toggle('active');
  searchOverlay.classList.remove('active');
});

closeInfoBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  infoPanel.classList.remove('active');
});

// --- FITUR 3: PLAY MODE + PLAYER ---
playBtnContainer.addEventListener('click', (e) => {
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
          iframe.src = movie.iframe; // misalnya "https://vidsrc.me/embed/movie?tmdb=12345"
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

// Keluar dari Mode Play
mainContent.addEventListener('click', () => {
  if (phoneContainer.classList.contains('play-mode')) {
    phoneContainer.classList.remove('play-mode');
    // Hapus iframe player biar bersih
    const iframe = mainContent.querySelector("iframe");
    if (iframe) iframe.remove();
  } else {
    searchOverlay.classList.remove('active');
    infoPanel.classList.remove('active');
  }
});

// Scroll keluar dari play mode
mainContent.addEventListener('wheel', () => {
  if (phoneContainer.classList.contains('play-mode')) {
    phoneContainer.classList.remove('play-mode');
    const iframe = mainContent.querySelector("iframe");
    if (iframe) iframe.remove();
  }
});
