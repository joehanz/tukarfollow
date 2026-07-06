fetch("movies.json")
  .then(res => res.json())
  .then(data => {
    const feed = document.getElementById("feed");
    data.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}">
        <div class="info">
          <h2>${movie.title}</h2>
          <p>${movie.genre.join(", ")} • ${movie.country}</p>
        </div>
        <div class="actions">
          <button onclick="openVideo('${movie.iframe}')">▶️</button>
          <span>❤️</span>
          <span>💬</span>
          <span>🔁</span>
        </div>
      `;
      feed.appendChild(card);
    });
  })
  .catch(err => console.error("Error:", err));

function openVideo(url) {
  window.open(url, "_blank");
}
