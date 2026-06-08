/* ========= ELEMENT ========= */

const burger=document.getElementById("burger");
const navMenu=document.getElementById("navMenu");

const movieGrid=document.getElementById("movieGrid");
const loading=document.getElementById("loading");

const searchInput=document.getElementById("searchInput");
const searchBtn=document.getElementById("searchBtn");

const playerFrame=document.getElementById("playerFrame");
const mediaInfo=document.getElementById("mediaInfo");

const relatedGrid=document.getElementById("relatedGrid");

const seasonSelect=document.getElementById("seasonSelect");
const episodeSelect=document.getElementById("episodeSelect");
const playEpisode=document.getElementById("playEpisode");
const seriesBox=document.getElementById("seriesBox");

const pagination=document.getElementById("pagination");
const prevBtn=document.getElementById("prevBtn");
const nextBtn=document.getElementById("nextBtn");


let media=[];
let page=1;


/* ========= BURGER ========= */

if(burger){

burger.onclick=()=>{

navMenu.classList.toggle(
"active"
);

};

}


/* ========= START ========= */

if(movieGrid){

loadTMDB();

}

if(playerFrame){

loadWatch();

}


/* ========= NORMALIZE ========= */

function normalizeTitle(str){

if(!str)return "";

return str

.toLowerCase()

.replace(/\(\d{4}\)/g,"")

.replace(/[^\w\s]/g,"")

.replace(/\s+/g," ")

.trim();

}


/* ========= RANDOM ========= */

function randomPage(){

return Math.floor(
Math.random()*500
)+1;

}


function shuffle(a){

for(
let i=a.length-1;
i>0;
i--
){

let j=Math.floor(
Math.random()*
(i+1)
);

[a[i],a[j]]=
[a[j],a[i]];

}

return a;

}



/* ========= GRID ========= */

async function loadTMDB(){

loading.style.display=
"block";


let movieRes=
await fetch(

`${CONFIG2.TMDB_BASE}/discover/movie?api_key=${CONFIG2.TMDB_KEY}&page=${randomPage()}`

);

let tvRes=
await fetch(

`${CONFIG2.TMDB_BASE}/discover/tv?api_key=${CONFIG2.TMDB_KEY}&page=${randomPage()}`

);


let movie=
await movieRes.json();

let tv=
await tvRes.json();


media=[

...movie.results.map(
x=>({

...x,

type:"movie"

})
),

...tv.results.map(
x=>({

...x,

type:"tv"

})
)

];


shuffle(
media
);


renderGrid(
media.slice(
0,
26
)
);


renderPagination();

loading.style.display=
"none";

}



function renderGrid(data){

movieGrid.innerHTML="";


data.forEach(item=>{

let title=
item.title||
item.name;


movieGrid.innerHTML+=`

<div
class="card"

onclick="
location.href='watch2.html?id=${item.id}&type=${item.type}'
"

>

${item.type==="movie"

?'<div class="webpTag">WEBP</div>'

:""

}

<img
src="${CONFIG2.TMDB_IMAGE}${item.poster_path}"
>

<div class="cardTitle">

${title}

</div>

</div>

`;

});

}



/* ========= SEARCH ========= */

if(searchBtn){

searchBtn.onclick=
runSearch;

}

if(searchInput){

searchInput.onkeyup=
e=>{

if(
e.key==="Enter"
){

runSearch();

}

};

}


async function runSearch(){

let q=
searchInput.value.trim();

if(!q)return;


loading.style.display=
"block";


let res=
await fetch(

`${CONFIG2.TMDB_BASE}/search/multi?api_key=${CONFIG2.TMDB_KEY}&query=${q}`

);

let d=
await res.json();


media=

d.results

.filter(

x=>

x.media_type==="movie"

||

x.media_type==="tv"

)

.map(

x=>({

...x,

type:
x.media_type

})

);


renderGrid(
media
);

loading.style.display=
"none";

}



/* ========= PAGINATION ========= */

function renderPagination(){

pagination.innerHTML="";

for(
let i=1;
i<=6;
i++
){

pagination.innerHTML+=`

<button
class="pageBtn"

onclick="changePage(${page+i-1})"

>

${page+i-1}

</button>

`;

}

}


function changePage(p){

page=p;

loadTMDB();

}


if(prevBtn){

prevBtn.onclick=()=>{

if(page>1){

page--;

loadTMDB();

}

};

}


if(nextBtn){

nextBtn.onclick=()=>{

page++;

loadTMDB();

};

}



/* ========= WATCH ========= */

async function loadWatch(){

let params=
new URLSearchParams(
location.search
);

let id=
params.get("id");

let type=
params.get("type");


let tmdb=
await fetch(

`${CONFIG2.TMDB_BASE}/${type}/${id}?api_key=${CONFIG2.TMDB_KEY}`

);

let info=
await tmdb.json();


let json=
await fetch(
CONFIG2.MOVIES_JSON
);

let list=
await json.json();


let tmdbTitle=

normalizeTitle(

info.title||
info.name

);


let match=

list.find(x=>{

return normalizeTitle(
x.title
)

.includes(
tmdbTitle
);

});


if(match){

playerFrame.src=
match.iframe||"";


mediaInfo.innerHTML=`

<h1>

${match.title}

</h1>

<br>

<p>

${match.sinopsis||info.overview}

</p>

<br>

<p>

Genre :
${match.genre.join(", ")}

</p>

<p>

Release :
${match.release_date}

</p>

<p>

Country :
${match.country}

</p>

`;

}else{

playerFrame.style.display=
"none";


document.getElementById(
"playerArea"
)

.innerHTML=`

<div
class="unavailable"
>

This media is unavailable at the moment.

</div>

`;


mediaInfo.innerHTML=`

<h1>

${info.title||info.name}

</h1>

<br>

<p>

⭐ ${info.vote_average}

</p>

<p>

Genre :
${info.genres.map(
x=>x.name
).join(", ")}

</p>

<p>

Release :
${info.release_date||info.first_air_date}

</p>

<p>

${info.overview}

</p>

`;

}


/* SERIES */

if(
type==="tv"
&&
seriesBox
){

seriesBox.style.display=
"flex";


let season=
await fetch(

`${CONFIG2.TMDB_BASE}/tv/${id}?api_key=${CONFIG2.TMDB_KEY}`

);

let s=
await season.json();


seasonSelect.innerHTML="";


s.seasons.forEach(x=>{

seasonSelect.innerHTML+=`

<option value="${x.season_number}">

Season
${x.season_number}

</option>

`;

});


loadEpisodes();


seasonSelect.onchange=
loadEpisodes;


playEpisode.onclick=
()=>{

let season=
seasonSelect.value;

let episode=
episodeSelect.value;


playerFrame.src=

match.iframe+

`?season=${season}&episode=${episode}`;

};

}


loadRelated(
id,
type
);

}


function loadEpisodes(){

episodeSelect.innerHTML="";

for(
let i=1;
i<=30;
i++
){

episodeSelect.innerHTML+=`

<option value="${i}">

Episode ${i}

</option>

`;

}

}



/* ========= RELATED ========= */

async function loadRelated(
id,
type
){

if(!relatedGrid)return;


let r=
await fetch(

`${CONFIG2.TMDB_BASE}/${type}/${id}/recommendations?api_key=${CONFIG2.TMDB_KEY}`

);

let d=
await r.json();


relatedGrid.innerHTML=`

<div
class="relatedRow"
id="relatedRow"
>

</div>

`;


let row=
document.getElementById(
"relatedRow"
);


d.results
.slice(
0,
15
)

.forEach(item=>{

let title=

item.title||
item.name;


row.innerHTML+=`

<div
class="card"

onclick="
location.href='watch2.html?id=${item.id}&type=${type}'
"

style="
min-width:180px
"

>

<img
src="${CONFIG2.TMDB_IMAGE}${item.poster_path}"
>

<div
class="cardTitle"
>

${title}

</div>

</div>

`;

});

}
