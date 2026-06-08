/* ========= ELEMENTS ========= */

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


/* ========= GLOBAL ========= */

let page=1;

let media=[];

let searchMode=false;

let query="";


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



/* ========= RANDOM PAGE ========= */

function randomPage(){

return Math.floor(
Math.random()*500
)+1;

}



/* ========= LOAD GRID ========= */

async function loadTMDB(){

try{

loading.style.display=
"block";

let moviePage=
randomPage();

let tvPage=
randomPage();


const movieRes=
await fetch(

`${CONFIG2.TMDB_BASE}/discover/movie?api_key=${CONFIG2.TMDB_KEY}&page=${moviePage}`

);

const tvRes=
await fetch(

`${CONFIG2.TMDB_BASE}/discover/tv?api_key=${CONFIG2.TMDB_KEY}&page=${tvPage}`

);


const movieData=
await movieRes.json();

const tvData=
await tvRes.json();


media=[

...movieData.results.map(
x=>({
...x,
type:"movie"
})
),

...tvData.results.map(
x=>({
...x,
type:"tv"
})
)

];


shuffle(media);

renderGrid(
media.slice(
0,
CONFIG2.POSTER_PER_PAGE
)
);

renderPagination();

loading.style.display=
"none";

}catch(err){

console.log(err);

}

}



/* ========= SHUFFLE ========= */

function shuffle(a){

for(

let i=a.length-1;

i>0;

i--

){

const j=Math.floor(

Math.random()*
(i+1)

);

[a[i],a[j]]=

[a[j],a[i]];

}

return a;

}



/* ========= GRID ========= */

function renderGrid(data){

movieGrid.innerHTML="";

data.forEach(item=>{

const title=

item.title||
item.name;


const card=
document.createElement(
"div"
);

card.className=
"card";


card.innerHTML=`

${item.type==="movie"

?'<div class="webpTag">WEBP</div>'
:""

}

<img
src="
${CONFIG2.TMDB_IMAGE}
${item.poster_path}
"
>

<div
class="cardTitle"
>

${title}

</div>

`;


card.onclick=()=>{

location.href=

`watch2.html?id=${item.id}&type=${item.type}`;

};


movieGrid.appendChild(
card
);

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

query=
searchInput.value.trim();

if(!query)return;


loading.style.display=
"block";


const res=

await fetch(

`${CONFIG2.TMDB_BASE}/search/multi?api_key=${CONFIG2.TMDB_KEY}&query=${query}`

);

const data=
await res.json();


media=

data.results.filter(

x=>

x.media_type==="movie"

||

x.media_type==="tv"

).map(

x=>({

...x,

type:
x.media_type

})

);


renderGrid(

media.slice(
0,
26
)

);

loading.style.display=
"none";

}



/* ========= PAGINATION ========= */

function renderPagination(){

if(!pagination)return;

pagination.innerHTML="";


for(

let i=1;
i<=6;
i++

){

const btn=
document.createElement(
"button"
);

btn.className=
"pageBtn";

btn.innerText=

page+i-1;


btn.onclick=()=>{

page=
page+i-1;

loadTMDB();

};


pagination.appendChild(
btn);

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

}



/* ========= WATCH ========= */

async function loadWatch(){

const id=

new URLSearchParams(
location.search
)
.get("id");


const type=

new URLSearchParams(
location.search
)
.get("type");


try{

const tmdb=

await fetch(

`${CONFIG2.TMDB_BASE}/${type}/${id}?api_key=${CONFIG2.TMDB_KEY}`

);

const tmdbData=
await tmdb.json();


const json=
await fetch(
CONFIG2.MOVIES_JSON
);

const list=
await json.json();


const title=

tmdbData.title||

tmdbData.name;


const match=

list.find(

x=>

x.title
.toLowerCase()
.includes(

title
.toLowerCase()

)

);


if(match){

playerFrame.src=
match.iframe;


mediaInfo.innerHTML=`

<h1>

${match.title}

</h1>

<br>

<p>

${match.sinopsis}

</p>

<br>

<p>

Genre:
${match.genre.join(", ")}

</p>

<p>

Release:
${match.release_date}

</p>

<p>

Country:
${match.country}

</p>

`;

}else{

playerFrame.style.display=
"none";


document
.getElementById(
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

${title}

</h1>

<br>

<p>

${tmdbData.overview}

</p>

<br>

<p>

⭐
${tmdbData.vote_average}

</p>

`;

}


if(type==="tv"){

loadSeries(
id
);

}


loadRelated(
id,
type
);


}catch(e){

console.log(e);

}

}



/* ========= SERIES ========= */

async function loadSeries(id){

if(!seriesBox)return;

seriesBox.style.display=
"flex";


const r=
await fetch(

`${CONFIG2.TMDB_BASE}/tv/${id}?api_key=${CONFIG2.TMDB_KEY}`

);

const d=
await r.json();


seasonSelect.innerHTML="";


d.seasons.forEach(s=>{

seasonSelect.innerHTML+=`

<option value="${s.season_number}">

Season
${s.season_number}

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

playerFrame.src+

`?season=${season}&episode=${episode}`;

};

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


const r=
await fetch(

`${CONFIG2.TMDB_BASE}/${type}/${id}/recommendations?api_key=${CONFIG2.TMDB_KEY}`

);

const d=
await r.json();


relatedGrid.innerHTML=
'<div class="relatedRow"></div>';

const row=
document.querySelector(
".relatedRow"
);


d.results
.slice(
0,
15
)
.forEach(item=>{

const title=

item.title||
item.name;


row.innerHTML+=`

<div
class="card"

onclick="location.href='watch2.html?id=${item.id}&type=${type}'"

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
