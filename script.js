// ISI APY KEY TMDB RESMI ANDA
const TMDB_API_KEY = '9e335d21d35f04917b218bae7adc881f'; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://tmdb.org';

// GLOBAL DATA STORAGE
let ALL_MOVIES = [];

// MENGGABUNGKAN DATA JSON & TMDB (FILM INDONESIA ONLY & FIX UPDATED DATA)
async function loadAllMoviesData() {
    let localData = [];
    let tmdbData = [];

    // Mendapatkan tanggal hari ini format YYYY-MM-DD agar film masa depan tidak merusak urutan grid
    const today = new Date().toISOString().split('T')[0];

    // 1. Ambil dari movies.json lokal Anda
    try {
        const res = await fetch('movies.json');
        localData = await res.json();
        localData = localData.map((item, idx) => ({ ...item, internalId: `LOCAL_${idx}` }));
    } catch (e) {
        console.error("Gagal membaca movies.json lokal", e);
    }

    // 2. Ambil dari API TMDB (DIPERBAIKI: Mengambil Film Indonesia yang Valid & Sudah Rilis)
    try {
        const urlEndpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=id&sort_by=primary_release_date.desc&release_date.lte=${today}&page=1`;
        const res = await fetch(urlEndpoint);
        const data = await res.json();
        
        if (data.results) {
            tmdbData = data.results.map(movie => ({
                title: movie.title,
                image: movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com',
                video: "",
                iframe: `https://vidsrc.to{movie.id}`, // Menggunakan CDN Open-source pemutar film gratis TMDB
                sinopsis: movie.overview || "Sinopsis untuk film ini belum tersedia.",
                genre: "Indonesia Movie", 
                release_date: movie.release_date || "0000-00-00",
                country: "Indonesia",
                internalId: `TMDB_${movie.id}`
            }));
        }
    } catch (e) {
        console.error("Gagal terhubung atau sinkronisasi dengan API TMDB", e);
    }

    // 3. Melebur Kedua Sumber Menjadi Satu Aliran Grid & Diurutkan Berdasarkan Rilis Terbaru
    ALL_MOVIES = [...localData, ...tmdbData].sort((a, b) => {
        return new Date(b.release_date) - new Date(a.release_date);
    });

    // Jalankan fungsi cetak ke halaman utama
    renderGrid(ALL_MOVIES);
}
