const API_KEY = "c000d7b8b0f5ee16b98b6103009745d8";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const grid = document.getElementById("movie-grid");

// Ambil film dari TMDB
async function getMovies() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
  const data = await res.json();

  data.results.forEach(movie => {
    if (movie.poster_path) {
      const img = document.createElement("img");
      img.src = IMG_URL + movie.poster_path;
      img.className = "w-full h-full object-cover opacity-100 transition-opacity duration-[3000ms]";
      grid.appendChild(img);
    }
  });
}
getMovies();

// Efek fade grid + tombol
window.onload = () => {
  const overlay = document.getElementById("overlay-buttons");

  setTimeout(() => {
    grid.classList.add("opacity-30");
  }, 1000);

  setTimeout(() => {
    overlay.classList.add("opacity-100");
  }, 2000);
};

// Show overlays
function showSignup() {
  document.getElementById("signup-overlay").classList.remove("hidden");
}
function showSignin() {
  document.getElementById("signin-overlay").classList.remove("hidden");
}

// Sign Up → kirim ke Google Apps Script
document.getElementById("signup-submit").addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value.trim();
  const pass = document.getElementById("signup-pass").value.trim();

  if (!email || !pass) {
    alert("Isi email/HP dan password dulu bro!");
    return;
  }

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbxGl5etOVaUyB83HKANG8yckWC8nr19C2LC2cfKEFX8fWppHgugAcDjfbvW1AWjgAuO/exec", {
      method: "POST",
      body: JSON.stringify({ email, pass }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();

    // replace form dengan kode unik + password
    document.getElementById("signup-overlay").innerHTML = `
      <div class="bg-gray-900 p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 class="text-xl font-bold mb-4">Akun Berhasil</h2>
        <p class="mb-2">Kode Unik: <span class="font-mono text-green-400">${data.code}</span></p>
        <p>Password: <span class="font-mono text-blue-400">${pass}</span></p>
        <button onclick="showSignin()" class="mt-4 px-6 py-2 bg-blue-500 text-black font-bold rounded">Sign In</button>
      </div>
    `;
  } catch (err) {
    alert("Error daftar bro: " + err);
  }
});
