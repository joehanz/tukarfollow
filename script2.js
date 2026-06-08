const burger=
document.getElementById(
"burger"
);

const navMenu=
document.getElementById(
"navMenu"
);

const movieGrid=
document.getElementById(
"movieGrid"
);

const searchInput=
document.getElementById(
"searchInput"
);

const searchBtn=
document.getElementById(
"searchBtn"
);

const loading=
document.getElementById(
"loading"
);


let movies=[];


/* BURGER */

if(burger){

burger.onclick=()=>{

navMenu.classList.toggle(
"active"
);

};

}


/* FETCH MOVIES */

async function loadMovies(){

try{

loading.style.display=
"block";

const res=
await fetch(
CONFIG2.MOVIES_JSON+
"?v="+Date.now()
);

movies=
await res.json();

if(
CONFIG2.RANDOMIZE
){

shuffle(
movies
);

}

renderMovies(
movies
);

loading.style.display=
"none";

}catch(err){

console.log(err);

loading.innerHTML=
"Failed loading data";

}

}


/* SHUFFLE */

function shuffle(arr){

for(
let i=arr.length-1;
i>0;
i--
){

const j=
Math.floor(
Math.random()*
(i+1)
);

[arr[i],arr[j]]=
[arr[j],arr[i]];

}

return arr;

}


/* RENDER GRID */

function renderMovies(data){

if(
!movieGrid
)return;

movieGrid.innerHTML="";

data.forEach(
(
item,
index
)=>{

const card=
document.createElement(
"div"
);

card.className=
"card";

card.innerHTML=`

<img
src="${
item.image
}"
loading="lazy"
>

<div
class="cardTitle"
>
${
item.title
}
</div>

`;

card.onclick=()=>{

location.href=
`watch2.html?id=${index}`;

};

movieGrid.appendChild(
card
);

}

);

}


/* SEARCH */

function runSearch(){

const q=
searchInput.value
.toLowerCase()
.trim();

if(!q){

renderMovies(
movies
);

return;

}

const result=
movies.filter(
x=>

x.title
.toLowerCase()
.includes(
q
)

);

renderMovies(
result
);

}

if(searchBtn){

searchBtn.onclick=
runSearch;

}

if(searchInput){

searchInput.addEventListener(
"keyup",
e=>{

if(
e.key==="Enter"
){

runSearch();

}

}
);

}


/* START */

loadMovies();





/* WATCH PAGE */

const playerFrame=
document.getElementById(
"playerFrame"
);

const mediaInfo=
document.getElementById(
"mediaInfo"
);

const relatedGrid=
document.getElementById(
"relatedGrid"
);

const seriesBox=
document.getElementById(
"seriesBox"
);

const seasonSelect=
document.getElementById(
"seasonSelect"
);

const episodeSelect=
document.getElementById(
"episodeSelect"
);

const playEpisode=
document.getElementById(
"playEpisode"
);


if(playerFrame){

loadWatch();

}


async function loadWatch(){

const id=
new URLSearchParams(
location.search
)
.get("id");


const res=
await fetch(
CONFIG2.MOVIES_JSON+
"?v="+Date.now()
);

const data=
await res.json();


const item=
data[id];

if(
!item
){

mediaInfo.innerHTML=`

<div class="unavailable">

This media is unavailable at the moment.

</div>

`;

playerFrame.style.display=
"none";

return;

}


playerFrame.src=
item.iframe||"";


mediaInfo.innerHTML=`

<h1>
${item.title}
</h1>

<br>

<p>
${item.sinopsis||""}
</p>

<br>

<p>

Genre :
${(item.genre||[])
.join(", ")}

</p>

<p>

Release :
${item.release_date||"-"}

</p>

<p>

Country :
${item.country||"-"}

</p>

`;

loadRelated(
data,
item
);


searchTMDB(
item.title,
item
);

}


/* RELATED */

function loadRelated(
all,
current
){

if(
!relatedGrid
)return;

relatedGrid.innerHTML="";


let related=
all.filter(
x=>

x.title!=
current.title

);

shuffle(
related
);

related=
related.slice(
0,
CONFIG2.RELATED_LIMIT
);

related.forEach(
(
item,
index
)=>{

relatedGrid.innerHTML+=`

<div
class="card"
onclick="
location.href=
'watch2.html?id=${all.indexOf(item)}'
"
>

<img
src="${item.image}"
>

<div
class="cardTitle"
>

${item.title}

</div>

</div>

`;

}
);

}


/* TMDB SEARCH */

async function searchTMDB(
title,
item
){

try{

const r=
await fetch(

`${CONFIG2.TMDB_BASE}/search/tv?api_key=${CONFIG2.TMDB_KEY}&query=${encodeURIComponent(title)}`

);

const d=
await r.json();

if(
!d.results?.length
)return;


const tv=
d.results[0];


loadSeasonData(
tv.id,
item
);

}catch(e){

console.log(e);

}

}


/* SEASONS */

async function loadSeasonData(
id,
item
){

seriesBox.style.display=
"flex";

const r=
await fetch(

`${CONFIG2.TMDB_BASE}/tv/${id}?api_key=${CONFIG2.TMDB_KEY}`

);

const d=
await r.json();


seasonSelect.innerHTML=
"";


d.seasons.forEach(
s=>{

seasonSelect.innerHTML+=`

<option value="${s.season_number}">

Season
${s.season_number}

</option>

`;

}
);


seasonSelect.onchange=
loadEpisodes;


loadEpisodes();


playEpisode.onclick=
()=>{

const season=
seasonSelect.value;

const episode=
episodeSelect.value;


/* ganti player */

playerFrame.src=

item.iframe+

`?season=${season}&episode=${episode}`;

};

}



async function loadEpisodes(){

episodeSelect.innerHTML=
"";

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
