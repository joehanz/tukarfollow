/* Gaya untuk Layer Hasil Pencarian */
.search-results-layer {
    position: fixed;
    top: 65px; /* Sesuaikan dengan tinggi kolom pencarian */
    left: 0;
    right: 0;
    bottom: 70px; /* Sesuaikan dengan tinggi navigasi bawah */
    background: #0a0a0a;
    z-index: 200;
    display: flex;
    flex-direction: column;
    transform: translateY(100%);
    opacity: 0;
    transition: all 0.3s ease;
    overflow: hidden;
}

.search-results-layer.active {
    transform: translateY(0);
    opacity: 1;
}

.search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #111;
    border-bottom: 1px solid #222;
}

.search-header h4 {
    margin: 0;
    color: #ffdd57;
    font-size: 16px;
}

.close-search {
    background: #222;
    border: none;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.search-content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

.search-item-row {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #222;
    cursor: pointer;
}

.search-item-thumb {
    width: 60px;
    height: 90px;
    border-radius: 4px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    background-color: #333;
}

.search-item-info {
    flex: 1;
}

.search-item-info h4 {
    margin: 0 0 5px 0;
    font-size: 15px;
}

.search-item-info p {
    margin: 2px 0;
    font-size: 13px;
    color: #bbb;
}
