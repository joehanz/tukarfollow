const KEY="b3b893873ed1bb7f175b2707afeea2a0";

let page=1;
let query="";

function toggleMenu(){

document
.getElementById("mobileMenu")
.classList.toggle("show");

}


async function load(){

let url="";

if(query){

url=`https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${query}&page=${page}`;

}else{

url=`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&with_origin_country=ID&page=${page}`;

}

const data=
await fetch(url)
.then(r=>r.json());

render(
data.results
);

renderPagination(
data.page
);

}


function render(data){

let h="";

data.forEach(m=>{

if(!m.poster_path)return;

h+=`

<div
class="card"
onclick="go(${m.id})">

<img src="https://image.tmdb.org/t/p/w300${m.poster_path}">

<div class="title">

${m.title}

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
let i=p;
i<p+6;
i++
){

h+=`

<button
onclick="goPage(${i})">

${i}

</button>

`;

}

h+=`

<button
onclick="nextSet()">

›

</button>

`;

document
.getElementById(
"pagination"
)
.innerHTML=h;

}


function goPage(p){

page=p;

load();

}


function nextSet(){

page+=6;

load();

}


function go(id){

location.href=
`watch.html?id=${id}`;

}


function searchMovie(){

query=
document
.getElementById(
"search"
)
.value;

page=1;

load();

}


function searchMovieMobile(){

query=
document
.querySelector(
"#mobileMenu input"
)
.value;

page=1;

load();

}

load();
