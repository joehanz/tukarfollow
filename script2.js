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



/* ========= STRING SIMILARITY ========= */

function cleanTitle(str){

return str
.toLowerCase()
.replace(/[^\w\s]/g,"")
.replace(/\s+/g," ")
.trim();

}


function similarity(a,b){

a=cleanTitle(a);
b=cleanTitle(b);

let longer=
a.length>b.length
?a:b;

let shorter=
a.length>b.length
?b:a;

let same=0;

for(let i=0;i<shorter.length;i++){

if(
longer.includes(
shorter[i]
)
){

same++;

}

}

return(
same/
longer.length
)*100;

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


shuffle(media);

renderGrid(
media.slice(0,26)
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


let title=
info.title||
info.name;


let best=null;
let score=0;


list.forEach(item=>{

let s=

similarity(
title,
item.title
);

if(
s>score
){

score=s;
best=item;

}

});


if(
score>=80
&&
best
&&
type==="movie"
){

playerFrame.src=
best.iframe||"";


mediaInfo.innerHTML=`

<h1>${best.title}</h1>

<br>

<p>
${best.sinopsis||info.overview}
</p>

<br>

<p>
Genre:
${best.genre.join(", ")}
</p>

<p>
Release:
${best.release_date}
</p>

<p>
Country:
${best.country}
</p>

`;

}else if(type==="tv"){

playerFrame.src=

`https://vsembed.su/tv/${id}/1/1`;

loadSeries(id);

mediaInfo.innerHTML=`

<h1>
${info.name}
</h1>

<br>

<p>
${info.overview}
</p>

`;

}else{

document
.getElementById(
"playerArea"
)
.innerHTML=`

<div class="unavailable">

Video belum update

</div>

`;

mediaInfo.innerHTML=`

<h1>

${title}

</h1>

<br>

<p>

⭐ ${info.vote_average}

</p>

<p>

Genre:
${info.genres.map(
x=>x.name
).join(", ")}

</p>

<p>

Release:
${info.release_date||info.first_air_date}

</p>

<br>

<p>

${info.overview}

</p>

`;

}


loadRelated(
id,
type
);

}



/* ========= SERIES ========= */

async function loadSeries(id){

if(!seriesBox)return;

seriesBox.style.display=
"flex";


let r=
await fetch(

`${CONFIG2.TMDB_BASE}/tv/${id}?api_key=${CONFIG2.TMDB_KEY}`

);

let d=
await r.json();


seasonSelect.innerHTML="";


d.seasons.forEach(s=>{

seasonSelect.innerHTML+=`

<option value="${s.season_number}">

Season ${s.season_number}

</option>

`;

});


loadEpisodes();


seasonSelect.onchange=
loadEpisodes;


playEpisode.onclick=()=>{

let season=
seasonSelect.value;

let episode=
episodeSelect.value;


playerFrame.src=

`https://vsembed.su/tv/${id}/${season}/${episode}`;

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

async function loadRelated(id,type){

if(!relatedGrid)return;


let r=
await fetch(

`${CONFIG2.TMDB_BASE}/${type}/${id}/recommendations?api_key=${CONFIG2.TMDB_KEY}`

);

let d=
await r.json();


relatedGrid.innerHTML=`

<div class="relatedHeader">

<h2>
Related Movies
</h2>

<div class="relatedNav">

<button
class="relatedArrow"
id="leftArrow"
>

‹

</button>

<button
class="relatedArrow"
id="rightArrow"
>

›

</button>

</div>

</div>


<div class="relatedContainer">

<div
class="relatedRow"
id="relatedRow"
>

</div>

</div>

`;


let row=
document.getElementById(
"relatedRow"
);


d.results
.slice(0,15)
.forEach(item=>{

let title=
item.title||
item.name;


row.innerHTML+=`

<div
class="card"

onclick="
location.href='watch2.html?id=${item.id}&type=${item.media_type||type}'
"

>

<img
src="${CONFIG2.TMDB_IMAGE}${item.poster_path}"
>

<div class="cardTitle">

${title}

</div>

</div>

`;

});


document.getElementById(
"leftArrow"
).onclick=()=>{

row.scrollBy({
left:-700,
behavior:"smooth"
});

};

document.getElementById(
"rightArrow"
).onclick=()=>{

row.scrollBy({
left:700,
behavior:"smooth"
});

};

}
