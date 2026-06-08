const title =
new URLSearchParams(
location.search
).get("title") || "";

const playerBox =
document.getElementById("playerBox");

const judul =
document.getElementById("judul");

const sinopsis =
document.getElementById("sinopsis");

const meta =
document.getElementById("meta");

const recommend =
document.getElementById("recommendGrid");

function cleanText(text){

return (text || "")
.toLowerCase()
.replace(/\(\d+\)/g, "")
.replace(/[^\w\s]/g, "")
.replace(/\s+/g, " ")
.trim();

}

function similarity(a, b){

a = cleanText(a);
b = cleanText(b);

if(!a || !b) return 0;

const wordsA = [...new Set(a.split(" ").filter(Boolean))];
const wordsB = [...new Set(b.split(" ").filter(Boolean))];

let same = 0;

wordsA.forEach(word=>{
if(wordsB.includes(word)){
same++;
}
});

return same / Math.max(wordsA.length, wordsB.length);

}

async function loadMovie(){

try{

const data =
await fetch("data/movies.json")
.then(r => r.json());

let movie = null;
let bestScore = 0;

data.forEach(m => {

const score = similarity(title, m.title);

if(score > bestScore){
bestScore = score;
movie = m;
}

});

// threshold 80%
if(bestScore < 0.8){
movie = null;
}

if(movie){

judul.textContent = movie.title;

sinopsis.textContent =
movie.sinopsis || "Sinopsis belum tersedia";

meta.innerHTML = `
<span class="tag">${movie.release_date || "-"}</span>
<span class="tag">${movie.country || "-"}</span>
${
(movie.genre || []).map(g => `
<span class="tag">${g}</span>
`).join("")
}
`;

if(movie.iframe){

playerBox.innerHTML = `
<iframe
src="${movie.iframe}"
allowfullscreen
loading="lazy"
referrerpolicy="no-referrer"
></iframe>
`;

}else{

playerBox.innerHTML = `
<div class="notfound">
🎬 Video belum diupload
</div>
`;

}

}else{

judul.textContent = title || "Film";

sinopsis.textContent =
"Film ditemukan di katalog, tetapi video belum tersedia.";

playerBox.innerHTML = `
<div class="notfound">
🎬 Video belum diupload
</div>
`;

}

renderRecommend(data);

}catch(err){

console.log(err);

playerBox.innerHTML = `
<div class="notfound">
⚠️ Gagal memuat data
</div>
`;

}

}

function renderRecommend(data){

recommend.innerHTML = "";

const random =
[...data]
.sort(() => 0.5 - Math.random())
.slice(0, 8);

random.forEach(movie => {

const card =
document.createElement("div");

card.className = "card";

card.innerHTML = `
<img src="${movie.image}" loading="lazy">
<h3>${movie.title}</h3>
`;

card.onclick = () => {
location =
`watch2.html?title=${encodeURIComponent(movie.title)}`;
};

recommend.appendChild(card);

});

}

loadMovie();
