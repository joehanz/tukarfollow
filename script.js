const API_KEY = 'c000d7b8b0f5ee16b98b6103009745d8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w780';
const MOVIES_JSON_PATH = 'movies.json';

const feedContainer = document.getElementById('feedContainer');
const playerContainer = document.getElementById('videoPlayerContainer');
const playerArea = document.getElementById('playerArea');
const infoPanel = document.getElementById('infoPanel');
const panelContentArea = document.getElementById('panelContentArea');

let currentMovie = null;

// Ambil ID dari URL
function getTmdbId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Cek data film langsung ke format JSON kamu
async function cekDataFilm(tmdbId) {
  try {
    const res = await fetch(MOVIES_JSON_PATH);
    if (!res.ok) throw new Error('File tidak ditemukan');
    // Format kamu: langsung array, bukan { movies: [...] }
    const daftarFilm = await res.json();
    const ketemu = daftarFilm.find(f => Number(f.tmdb_id) === Number(tmdbId));
    return { ada: !!ketemu, data: ketemu || null };
  } catch (err) {
    console.warn('Gagal baca movies.json:', err);
    return { ada: false, data: null };
  }
}

// Ambil data dari TMDB jika tidak ada di JSON
async function ambilDariTMDB(tmdbId) {
  try {
    const res = await fetch(`${BASE_URL}/movie/${tmdbId}?api_key=${API_KEY}&language=id-ID`);
    if (!res.ok) throw new Error('Data TMDB tidak ada');
    return await res.json();
  } catch (err) {
    console.warn('Gagal ambil dari TMDB:', err);
    return null;
  }
}

// Tampilkan tampilan sama persis seperti index.html
function tampilkanTampilanFilm(film) {
  feedContainer.innerHTML = '';
  const poster = film.image || (film.poster_path ? `${IMAGE_URL}${film.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500');
  const tahun = film.release_date ? film.release_date.split('-')[0] : '-';

  const card = document.createElement('div');
  card.className = 'movie-card';
  card.style.backgroundImage = `url('${poster}')`;
  card.innerHTML = `
    <div class="overlay"></div>
    <div class="top-title">${film.title || 'Tanpa Judul'}</div>
    <div class="play-btn-container">
      <div class="play-circle"><i data-lucide="play" fill="#fff" size="32"></i></div>
    </div>
    <div class="main-content">
      <div class="side-actions">
        <div class="action-item" onclick="bukaInfo('sinopsis')">
          <i data-lucide="info" size="28"></i>
          <span>Info</span>
        </div>
        <div class="action-item" onclick="bukaInfo('rilis')">
          <i data-lucide="calendar" size="28"></i>
          <span>${tahun}</span>
        </div>
        <div class="action-item" onclick="bukaInfo('genre')">
          <i data-lucide="clapperboard" size="28"></i>
          <span>Genre</span>
        </div>
        <div class="action-item" onclick="bukaInfo('negara')">
          <i data-lucide="globe" size="28"></i>
          <span>Negara</span>
        </div>
      </div>
    </div>
  `;
  feedContainer.appendChild(card);
  lucide.createIcons();
}

// Tampilkan isi panel info
function bukaInfo(jenis) {
  if (!currentMovie) return;
  infoPanel.classList.add('show');
  let isi = '';

  if (currentMovie.adaDiJson) {
    const d = currentMovie.data;
    switch (jenis) {
      case 'sinopsis': isi = `<p>${d.sinopsis || 'Tidak ada sinopsis'}</p>`; break;
      case 'rilis': isi = `<p>Tanggal Rilis:<br>${d.release_date || '-'}</p>`; break;
      case 'genre': isi = `<p>Genre:<br>${Array.isArray(d.genre) ? d.genre.join(', ') : '-'}</p>`; break;
      case 'negara': isi = `<p>Negara:<br>${d.country || '-'}</p>`; break;
    }
  } else {
    const d = currentMovie.data;
    switch (jenis) {
      case 'sinopsis': isi = `<p>${d.overview || 'Tidak ada sinopsis'}</p>`; break;
      case 'rilis': isi = `<p>Tanggal Rilis:<br>${d.release_date || '-'}</p>`; break;
      case 'genre': isi = `<p>Genre:<br>${d.genres?.map(g => g.name).join(', ') || '-'}</p>`; break;
      case 'negara': isi = `<p>Negara:<br>${d.production_countries?.map(c => c.name).join(', ') || '-'}</p>`; break;
    }
  }
  panelContentArea.innerHTML = isi;
}

// Mainkan video OTOMATIS saat halaman terbuka
function mainkanFilm() {
  if (!currentMovie) return;
  let src = '';

  if (currentMovie.adaDiJson) {
    // ✅ Ada di JSON → pakai iframe dari playcinematic
    src = currentMovie.data.iframe || '';
  } else {
    // ❌ Tidak ada → baru pakai vsembed
    const id = getTmdbId();
    src = `https://vsembed.ru/embed/${id}`;
  }

  if (!src) {
    playerArea.innerHTML = `<p style="color:#fff; text-align:center; padding:2rem;">Sumber video tidak tersedia</p>`;
    return;
  }

  playerArea.innerHTML = `
    <iframe 
      src="${src}" 
      frameborder="0" 
      allowfullscreen 
      allow="autoplay; fullscreen; picture-in-picture"
      style="width:100%; height:100%; border:none; display:block;"
    ></iframe>
  `;
  playerContainer.classList.add('active');
}

// Tutup pemutar
document.getElementById('closePlayerBtn').addEventListener('click', () => {
  playerContainer.classList.remove('active');
  playerArea.innerHTML = '';
});

// Jalankan semua proses
async function mulai() {
  const id = getTmdbId();
  if (!id) {
    feedContainer.innerHTML = '<p style="color:#fff; text-align:center; padding:2rem;">ID film tidak ditemukan</p>';
    return;
  }

  const cek = await cekDataFilm(id);
  if (cek.ada) {
    currentMovie = { adaDiJson: true, data: cek.data };
  } else {
    const dataTMDB = await ambilDariTMDB(id);
    if (!dataTMDB) {
      feedContainer.innerHTML = '<p style="color:#fff; text-align:center; padding:2rem;">Data film tidak ditemukan</p>';
      return;
    }
    currentMovie = { adaDiJson: false, data: dataTMDB };
  }

  tampilkanTampilanFilm(currentMovie.data);
  mainkanFilm(); // ✅ Langsung main otomatis
}

window.addEventListener('load', mulai);

// Fungsi penutup notifikasi
function closeNotifier() {
  document.getElementById('desktopNotifier').style.display = 'none';
}

// Inisialisasi ikon Lucide
lucide.createIcons();
