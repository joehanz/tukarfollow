fetch("movies.json")
  .then(res => res.json())
  .then(data => {
    const feed = document.getElementById("feed");
    data.forEach(movie => {
      const card = document.createElement("div");
      card.className = "relative w-screen h-screen snap-start";
      card.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}" 
             class="w-screen h-screen object-cover">
        
        <!-- Overlay info -->
        <div class="absolute bottom-20 left-6">
          <h2 class="text-2xl font-bold">${movie.title}</h2>
          <p class="text-sm text-gray-300">${movie.genre.join(", ")} • ${movie.country}</p>
        </div>

        <!-- Floating actions kanan -->
        <div class="absolute right-6 bottom-24 flex flex-col space-y-6 text-3xl">
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
