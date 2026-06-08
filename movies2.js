const KEY="b3b893873ed1bb7f175b2707afeea2a0";

let page=1;
let mode="movie";
let query="";
let timer;

const grid=document.getElementById("movieGrid");
const pagination=document.getElementById("pagination");

const search=document.getElementById("search");
const mobileSearch=document.getElementById("mobileSearch");

async function loadMovies(){

try{

grid.innerHTML=`
<h2 style="
padding:30px;
text-align:center;
grid-column:1/-1;
">
Loading...
</h2>
`;

let endpoint="";

if(query){

endpoint=
`https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${encodeURIComponent(query)}&page=${page}`;

}else{

if(mode==="series"){

endpoint=
`https://api.themoviedb.org/3/discover/tv?api_key=${KEY}&sort_by=popularity.desc&page=${page}`;

}else{

endpoint=
`https://api.themoviedb.org/3/discover/movie?api_key=${KEY}&sort_by=popularity.desc&page=${page}`;

}

}

const response=
await fetch(endpoint);

const data=
await response.json();

console.log(data);

renderMovies(
data.results||[]
);

renderPagination(
Math.min(
data.total_pages||1,
500
)
);

}catch(err){

console.log(err);

grid.innerHTML=`

<h2 style="
padding:30px;
text-align:center;
grid-column:1/-1;
">

Gagal memuat TMDB

</h2>

`;

}

}



function renderMovies(items){

grid.innerHTML="";

items=items.filter(
m=>m.poster_path
);

items.forEach(movie=>{

const title=
movie.title||
movie.name||
"Untitled";

grid.innerHTML+=`

<div class="card"
onclick="openMovie('${encodeURIComponent(title)}')">

<img
src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
loading="lazy"
>

<h3>${title}</h3>

</div>

`;

});

}



function openMovie(title){

location.href=
`watch2.html?title=${title}`;

}



function renderPagination(total){

let html="";

const size=6;

const start=
Math.floor(
(page-1)/size
)
*size+1;

const end=
Math.min(
start+size-1,
total
);

if(start>1){

html+=`
<button onclick="gotoPage(${start-size})">
&lt;
</button>
`;

}

for(let i=start;i<=end;i++){

html+=`

<button
class="${
i===page
?"active":""
}"
onclick="
gotoPage(${i})
">

${i}

</button>

`;

}

if(end<total){

html+=`
<button onclick="gotoPage(${end+1})">
&gt;
</button>
`;

}

pagination.innerHTML=html;

}



function gotoPage(p){

page=p;

window.scrollTo({
top:0,
behavior:"smooth"
});

loadMovies();

}



function doSearch(v){

clearTimeout(timer);

timer=
setTimeout(()=>{

query=v;

page=1;

loadMovies();

},500);

}



search?.addEventListener(
"keyup",
e=>doSearch(e.target.value)
);

mobileSearch?.addEventListener(
"keyup",
e=>doSearch(e.target.value)
);



document.querySelectorAll("a").forEach(a=>{

if(a.innerText==="Movies"){

a.onclick=(e)=>{

e.preventDefault();

mode="movie";

page=1;

query="";

loadMovies();

};

}

if(a.innerText==="Series"){

a.onclick=(e)=>{

e.preventDefault();

mode="series";

page=1;

query="";

loadMovies();

};

}

});


loadMovies();
