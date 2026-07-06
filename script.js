fetch("movies.json")
  .then(res => res.json())
  .then(data => {
    const feed = document.getElementById("feed");
    data.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}">
        <div class="overlay">
          <h2>${movie.title}</h2>
          <p>${movie.genre.join(", ")} • ${movie.country}</p>
          <button onclick="openVideo('${movie.iframe}')">Watch Now</button>
        </div>
        <div class="actions">
          <span>❤️</span>
          <span>💬</span>
          <span>🔁</span>
        </div>
      `;
      feed.appendChild(card);
    });
  });

function openVideo(url) {
  window.open(url, "_blank");
}
fetch("movies.json")
  .then(res => res.json())
  .then(data => {
    console.log("Data JSON:", data); // cek di console browser
    const feed = document.getElementById("feed");
    data.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}">
        <div class="overlay">
          <h2>${movie.title}</h2>
          <p>${movie.genre.join(", ")} • ${movie.country}</p>
          <button onclick="openVideo('${movie.iframe}')">Watch Now</button>
        </div>
        <div class="actions">
          <span>❤️</span>
          <span>💬</span>
          <span>🔁</span>
        </div>
      `;
      feed.appendChild(card);
    });
  })
  .catch(err => console.error("Error:", err));
