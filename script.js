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

// --- FETCH DATA TMDB ---
fetch("https://api.themoviedb.org/3/movie/popular?api_key=c000d7b8b0f5ee16b98b6103009745d8&language=id-ID&page=1")
  .then(res => res.json())
  .then(data => {
    currentMovie = data.results[0]; // ambil film pertama populer

    // Render ke UI
    document.querySelector(".movie-title-center").textContent = currentMovie.title;
    document.querySelector(".movie-details h2").textContent = currentMovie.title;
    document.querySelector(".movie-details p").textContent = currentMovie.overview;
    document.querySelector(".action-sidebar .action-item:nth-child(2) span").textContent = currentMovie.release_date.split("-")[0];
    document.querySelector(".action-sidebar .action-item:nth-child(3) span").textContent = currentMovie.genre_ids.join(", ");
    document.querySelector(".action-sidebar .action-item:nth-child(4) span").textContent = "TMDB";
    document.querySelector(".info-header h3").textContent = currentMovie.title;
    document.querySelector(".info-list .info-row:nth-child(2) p").textContent = currentMovie.release_date;
    document.querySelector(".info-list .info-row:nth-child(1) p").textContent = currentMovie.overview;
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
