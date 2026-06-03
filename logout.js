// reset status gate lalu kembali ke pagar

function logoutGate(){

// hapus status yang dipakai gate
localStorage.removeItem("visitedDay");
localStorage.removeItem("reward");
localStorage.removeItem("claim");

// kembali ke gerbang
window.location.replace("gate.html");

}
