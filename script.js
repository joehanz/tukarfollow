        // Mengambil elemen-elemen DOM
        const phoneContainer = document.getElementById('phoneContainer');
        const mainContent = document.getElementById('mainContent');
        const searchOverlay = document.getElementById('searchOverlay');
        const navSearch = document.getElementById('navSearch');
        const searchInput = document.getElementById('searchInput');
        
        const infoActionBtn = document.getElementById('infoActionBtn');
        const infoPanel = document.getElementById('infoPanel');
        const closeInfoBtn = document.getElementById('closeInfoBtn');
        
        const playBtnContainer = document.getElementById('playBtnContainer');

        // --- FITUR 1: LOGIK SEARCH BAR ---
        navSearch.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah trigger klik ke background
            searchOverlay.classList.toggle('active');
            if(searchOverlay.classList.contains('active')) {
                searchInput.focus(); // Otomatis fokus ke text input saat muncul
                // Tutup panel info jika sedang terbuka
                infoPanel.classList.remove('active');
            }
        });

        // --- FITUR 2: LOGIK INFO PANEL ---
        // Klik tombol info di sidebar kanan untuk buka/tutup
        infoActionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            infoPanel.classList.toggle('active');
            // Tutup search jika sedang terbuka
            searchOverlay.classList.remove('active');
        });

        // Klik tombol X di dalam panel info untuk menutup
        closeInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            infoPanel.classList.remove('active');
        });


        // --- FITUR 3: LOGIK PLAY MODE ---
        // Masuk ke Mode Play saat tombol play besar diklik
        playBtnContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            phoneContainer.classList.add('play-mode');
            // Pastikan overlay lain tertutup saat nonton
            searchOverlay.classList.remove('active');
            infoPanel.classList.remove('active');
        });

        // Keluar dari Mode Play saat layar / poster disentuh/diklik
        mainContent.addEventListener('click', () => {
            if (phoneContainer.classList.contains('play-mode')) {
                phoneContainer.classList.remove('play-mode');
            } else {
                // Menutup search bar atau info panel jika mengklik area kosong di poster
                searchOverlay.classList.remove('active');
                infoPanel.classList.remove('active');
            }
        });

        // Tambahan fungsionalitas scroll mendeteksi untuk keluar dari play mode
        mainContent.addEventListener('wheel', () => {
            if (phoneContainer.classList.contains('play-mode')) {
                phoneContainer.classList.remove('play-mode');
            }
        });
