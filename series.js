const KEY="b3b893873ed1bb7f175b2707afeea2a0";

const id=
new URLSearchParams(
location.search
).get("id");

const mode=
new URLSearchParams(
location.search
).get("mode");

let season=1;
let episode=1;

let page=1;
let query="";

const ads=[

"https://rajarayap.com",
"https://caturbangunsentosa.blogspot.com",
"https://ptdwiprima.blogspot.com"

];

let adsState=false;

function toggleMenu(){

document
.getElementById(
"mobileMenu"
)
.classList
.toggle("show");

}

async function load(){

if(id){

loadDetail();

return;

}

let url="";

if(query){

url=
`https://api.themoviedb.org/3/search/tv?api_key=${KEY}&query=${query}&page=${page}`;

}

else if(mode==="id"){

url=
`https://api.themoviedb.org/3/discover/tv?api_key=${KEY}&with_origin_country=ID&page=${page}`;

}

else{

url=
`https://api.themoviedb.org/3/trending/tv/week?api_key=${KEY}&page=${page}`;

}

const data=
await fetch(url)
.then(r=>r.json());

renderGrid(
data.results
);

renderPagination(
data.page
);

}

function renderGrid(data){

let h="";

data.forEach(v=>{

if(
!v.poster_path
)return;

h+=`

<div
class="card"
onclick="go(${v.id})"
>

<img
src="https://image.tmdb.org/t/p/w300${v.poster_path}"
>

<div class="title">

${v.name}

</div>

</div>

`;

});

document
.getElementById(
"grid"
)
.innerHTML=h;

}

function renderPagination(p){

let h="";

for(
let i=1;
i<=6;
i++
){

let n=p+i-1;

h+=`

<button
onclick="goPage(${n})"
>

${n}

</button>

`;

}

document
.getElementById(
"pagination"
)
.innerHTML=h;

}

function goPage(p){

page=p;

load();

window.scrollTo({

top:0,
behavior:"smooth"

});

}

function go(i){

location.href=
`series.html?id=${i}`;

}

function searchSeries(){

query=
document
.getElementById(
"search"
)
.value;

page=1;

load();

}

  function searchSeriesMobile(){

query=
document.querySelector(
"#mobileMenu input"
).value;

page=1;

load();

}

async function loadDetail(){

document
.getElementById(
"watchArea"
)
.style.display="block";

document
.getElementById(
"grid"
)
.style.display="none";

document
.getElementById(
"pagination"
)
.style.display="none";

const m=
await fetch(

`https://api.themoviedb.org/3/tv/${id}?api_key=${KEY}&language=id-ID`

)
.then(r=>r.json());

let seasonCount=
m.number_of_seasons||1;

let seasonHtml=`
<div class="selects">

<select
id="season"
onchange="changeSeason()"
>
`;

for(
let i=1;
i<=seasonCount;
i++
){

seasonHtml+=`
<option value="${i}">
Season ${i}
</option>
`;

}

seasonHtml+=`
</select>

<select
id="episode"
onchange="changeEpisode()"
></select>

</div>
`;

document
.getElementById(
"info"
)
.innerHTML=`

<h2>
${m.name}
</h2>

<p>
⭐ Rating :
${m.vote_average.toFixed(1)}
</p>

<p>
📅 First Air :
${m.first_air_date||"-"}
</p>

<p>
🎭 Genre :
${m.genres.map(
g=>g.name
).join(", ")}
</p>

${seasonHtml}

<p style="
margin-top:20px;
line-height:1.8;
">

${m.overview}

</p>

`;

loadEpisode();

}

async function loadEpisode(){

season=
document
.getElementById(
"season"
).value;

const d=
await fetch(

`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${KEY}`

)
.then(r=>r.json());

let h="";

d.episodes.forEach(v=>{

h+=`

<option value="${v.episode_number}">

Episode
${v.episode_number}

</option>

`;

});

document
.getElementById(
"episode"
)
.innerHTML=h;

changeEpisode();

}

function changeSeason(){

episode=1;

loadEpisode();

}

function changeEpisode(){

episode=
document
.getElementById(
"episode"
).value;

}

if(
document.getElementById(
"playLayer"
)
){

document
.getElementById(
"playLayer"
)
.onclick=function(){

if(
!adsState
){

adsState=true;

window.open(

ads[
Math.floor(
Math.random()
*
ads.length
)
],

"_blank"

);

return;

}

this.style.display="none";

document
.getElementById(
"player"
)
.src=

`https://vsembed.ru/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;

};

}

load();



  function toggleSeriesMobile(){

document
.getElementById(
"mobileSeries"
)
.classList
.toggle(
"show"
);

}
