// 🔧 KONFIGURASI
const API_KEY = 'c000d7b8b0f5ee16b98b6103009745d8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w185';
const URL_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbzoTAiVa0gMhNB-BJs3fLb4y9gKe-MzRWorDOF0y3TgvaRb2lWtj3docQ0abSCIEMBi/exec';

// ✅ Alamat semua file JSON dari GitHub Pages
const JSON_PATHS = [
  'https://midasxxi.github.io/tukarfollow/movies.json',
  'https://midasxxi.github.io/tukarfollow/movies2025.json',
  'https://midasxxi.github.io/tukarfollow/movies2024.json',
  'https://midasxxi.github.io/tukarfollow/moviesclassic.json'
];

// ✅ Sumber Player: utama → cadangan
const SUMBER_EMBED = {
  utama: (id) => `https://vsembed.ru/embed/movie?tmdb=${id}`,
  cadangan1: (id) => `https://vsembed.su/embed/movie?tmdb=${id}`
};

// 🎯 Elemen Halaman
const videoWrapper    = document.getElementById('videoWrapper');
const filmIframe      = document.getElementById('filmIframe');
const btnHomeBack     = document.getElementById('btnHomeBack');
const btnAddComment   = document.getElementById('btnAddComment');
const btnViewComments = document.getElementById('btnViewComments');
const btnSubIndo      = document.getElementById('btnSubIndo');
const btnFullscreen   = document.getElementById('btnFullscreen');
const commentsPanel   = document.getElementById('commentsPanel');
const closeCommentsBtn= document.getElementById('closeCommentsBtn');
const commentListEl   = document.getElementById('commentList');
const infoPanel       = document.getElementById('infoPanel');
const panelBackdrop   = document.getElementById('panelBackdrop');

let currentMovieId = null;

// ✅ SIMPAN POSISI GULUNGAN SEBELUM TUTUP HALAMAN
window.addEventListener('beforeunload', () => {
  localStorage.setItem('posisiGulunganFilm', window.scrollY);
});

// ✅ Ambil ID Film dari URL
function ambilIdDariUrl() {
  const query = window.location.search;
  if (!query) return null;
  const bagian = query.replace('?id=', '').split('/')[0];
  const idBersih = bagian.replace(/\D/g, '');
  return idBersih || null;
}

// ✅ Cek SEMUA JSON → cari ID, pasang iframe
async function cekDanMuatFilm(tmdbId) {
  let ketemuDiJson = false;
  for (const path of JSON_PATHS) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (res.ok) {
        const daftar = await res.json();
        const ketemu = daftar.find(f => Number(f.tmdb_id) === Number(tmdbId));
        if (ketemu) {
          ketemuDiJson = true;
          pasangIframeUtama(tmdbId);
          return ketemuDiJson;
        }
      }
    } catch (err) {
      console.warn("⚠️ Gagal baca:", path, err);
    }
  }
  // ❌ Tidak ketemu → tetap pasang player
  ketemuDiJson = false;
  pasangIframeUtama(tmdbId);
  return ketemuDiJson;
}

// 🔧 Bantu: pasang iframe + cadangan
function pasangIframeUtama(tmdbId) {
  filmIframe.src = SUMBER_EMBED.utama(tmdbId);
  filmIframe.onerror = () => {
    filmIframe.src = SUMBER_EMBED.cadangan1(tmdbId);
  };
}

// ✅ Tombol Layar Penuh
btnFullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
    screen.orientation?.lock('landscape').catch(() => {});
  } else {
    document.exitFullscreen?.();
    screen.orientation?.unlock?.();
  }
  lucide.createIcons();
});

document.addEventListener('fullscreenchange', updateFullscreenIcon);
function updateFullscreenIcon() {
  if (!btnFullscreen) return;
  btnFullscreen.innerHTML = document.fullscreenElement
    ? '<i data-lucide="minimize"></i>'
    : '<i data-lucide="maximize"></i>';
  lucide.createIcons();
}

// ✅ Tombol Kembali → BALIK KE POSISI TERAKHIR DI INDEX
btnHomeBack?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// ✅ Tombol Bendera → Buka Alternate Player + JUDUL SAMA DENGAN WATCH.HTML
btnSubIndo?.addEventListener('click', async () => {
  if (currentMovieId) {
    let judulUrl = 'unknown';
    const files = [
      'https://midasxxi.github.io/tukarfollow/movies.json',
      'https://midasxxi.github.io/tukarfollow/movies2025.json',
      'https://midasxxi.github.io/tukarfollow/movies2024.json',
      'https://midasxxi.github.io/tukarfollow/moviesclassic.json'
    ];
    try {
      for (const file of files) {
        const res = await fetch(file, { cache: "no-store" });
        if (res.ok) {
          const daftar = await res.json();
          const ketemu = daftar.find(f => Number(f.tmdb_id) === Number(currentMovieId));
          if (ketemu && ketemu.title) {
            judulUrl = ketemu.title
              .trim()
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
              .substring(0, 50);
            break;
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Gagal baca JSON:', err);
    }
    window.location.href = `alternate.html?id=${String(currentMovieId).trim()}/${judulUrl}`;
  } else {
    alert("ID film tidak ditemukan.");
  }
});

// ✅ Komentar: Buka / Tutup Form
btnAddComment?.addEventListener('click', bukaFormKomen);
panelBackdrop?.addEventListener('click', tutupFormKomen);

function bukaFormKomen() {
  infoPanel?.classList.add('show');
  panelBackdrop?.classList.add('active');
}
function tutupFormKomen() {
  infoPanel?.classList.remove('show');
  panelBackdrop?.classList.remove('active');
}

// ✅ Kirim Komentar ke Google Apps Script
async function kirimKomentar() {
  const nama = document.getElementById('commentName')?.value.trim();
  const teks = document.getElementById('commentText')?.value.trim();
  if (!nama || !teks) return alert("Isi nama dan komentar dulu!");

  try {
    await fetch(URL_APPS_SCRIPT, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ tmdbId: currentMovieId, nama, komentar: teks })
    });
    alert("✅ Komentar berhasil dikirim!");
    tutupFormKomen();
    setTimeout(muatKomentar, 800);
  } catch {
    alert("❌ Gagal mengirim komentar. Coba lagi.");
  }
}

// ✅ Buka / Tutup Daftar Komentar
btnViewComments?.addEventListener('click', () => {
  const buka = commentsPanel?.classList.toggle('open');
  if (buka) muatKomentar();
});
closeCommentsBtn?.addEventListener('click', () => {
  commentsPanel?.classList.remove('open');
});

// ✅ Ambil & Tampilkan Komentar
async function muatKomentar() {
  if (!currentMovieId || !commentListEl) return;
  commentListEl.innerHTML = '<div class="empty-comments">Memuat komentar...</div>';

  try {
    const res = await fetch(`${URL_APPS_SCRIPT}?tmdbId=${currentMovieId}`);
    const hasil = await res.json();
    if (hasil.status !== "success" || !hasil.data?.length) {
      commentListEl.innerHTML = '<div class="empty-comments">Belum ada komentar. Jadilah yang pertama!</div>';
      return;
    }
    commentListEl.innerHTML = hasil.data.map(item => `
      <div class="comment-item">
        <div class="comment-name">${item.nama || 'Anonim'}</div>
        <div class="comment-text">${item.komentar || ''}</div>
        <div class="comment-date">${new Date(item.timestamp).toLocaleString('id-ID')}</div>
      </div>
    `).join('');
  } catch {
    commentListEl.innerHTML = '<div class="empty-comments">Gagal memuat komentar.</div>';
  }
}

// ✅ JALANKAN SEMUA SAAT HALAMAN SIAP
window.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();
  currentMovieId = ambilIdDariUrl();

  if (!currentMovieId) {
    if (videoWrapper) {
      videoWrapper.innerHTML = `<div style="padding:50px; text-align:center; color:#fff;">ID Film tidak ditemukan</div>`;
    }
    return;
  }

  // Cek & pasang player
  const adaDiDaftarKita = await cekDanMuatFilm(currentMovieId);

  // Tampilkan tombol bendera HANYA kalau ada di daftar JSON
  if (btnSubIndo) {
    btnSubIndo.style.display = adaDiDaftarKita ? 'flex' : 'none';
  }
});
