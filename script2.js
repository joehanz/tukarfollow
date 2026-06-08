const KEY="b3b893873ed1bb7f175b2707afeea2a0";

const slider=
document.getElementById(
"slider"
);

const grid=
document.getElementById(
"movieGrid"
);

const pagination=
document.getElementById(
"pagination"
);

const search=
document.getElementById(
"search"
);

const mobileSearch=
document.getElementById(
"mobileSearch"
);

const burger=
document.getElementById(
"burger"
);

const mobileMenu=
document.getElementById(
"mobileMenu"
);

const topBtn=
document.getElementById(
"topBtn"
);


let page=1;

let mode=
"movie";

let query="";

let timer;



burger.onclick=()=>{

mobileMenu.style.display=

mobileMenu.style.display==="flex"

?"none"

:"flex";

};



window.addEventListener(
"scroll",
()=>{

topBtn.style.display=

window.scrollY>500

?"block"

:"none";

}
);



topBtn.onclick=()=>{

window.scrollTo({

top:0,
behavior:"smooth"

});

};



async function loadMovies(){

try{

grid.innerHTML=`

<div class="loading">

Loading Movie...

</div>

`;


let url="";


if(query){

url=
`https://api.themoviedb.org/3/search/${mode}
?api_key=${KEY}
&query=${encodeURIComponent(query)}
&page=${page}`;

}else{

url=
`https://api.themoviedb.org/3/discover/${mode}
?api_key=${KEY}
&sort_by=popularity.desc
&page=${page}`;

}


url=
url.replace(/\s/g,'');


const res=
await fetch(url);

const data=
await res.json();

console.log(data);


renderHero(
data.results[0]
);

renderMovies(
data.results||[]
);

renderPagination(
Math.min(
data.total_pages,
500
)
);


}catch(err){

console.log(err);

grid.innerHTML=`

<div class="loading">

Gagal memuat film

</div>

`;

}

}



function renderHero(movie){

if(
!movie
)return;


const title=

movie.title||

movie.name;


slider.innerHTML=`

<div
style="

width:100%;
height:100%;

background:

linear-gradient(
to top,
rgba(0,0,0,.9),
transparent
),

url(
https://image.tmdb.org/t/p/original${movie.backdrop_path}
);

background-size:cover;

background-position:center;

display:flex;

align-items:end;

padding:30px;

">

<div>

<h1>

${title}

</h1>

<br>

<p>

${movie.overview||""}

</p>

</div>

</div>

`;

}



function renderMovies(items){

grid.innerHTML="";


items

.filter(
m=>m.poster_path
)

.forEach(movie=>{


const title=

movie.title||

movie.name||

"Untitled";


grid.innerHTML+=`

<div
class="card"

onclick="

location.href=
'watch2.html?title=${encodeURIComponent(title)}'

"

>

<img
src="
https://image.tmdb.org/t/p/w500${movie.poster_path}
"
loading="lazy"
>

<h3>

${title}

</h3>

</div>

`;

});


}



function renderPagination(total){

let html="";

const group=6;


const start=

Math.floor(
(page-1)/group
)

*group+1;


const end=

Math.min(
start+group-1,
total
);


if(start>1){

html+=`

<button
onclick="
gotoPage(
${start-group}
)
">

&lt;

</button>

`;

}


for(
let i=start;
i<=end;
i++
){

html+=`

<button

class="${
i===page
?"active":""
}"

onclick="
gotoPage(
${i}
)
"

>

${i}

</button>

`;

}


if(end<total){

html+=`

<button
onclick="
gotoPage(
${end+1}
)
">

&gt;

</button>

`;

}


pagination.innerHTML=
html;

}



function gotoPage(p){

page=p;

window.scrollTo({

top:0,
behavior:"smooth"

});

loadMovies();

}



function doSearch(value){

clearTimeout(
timer
);

timer=
setTimeout(()=>{

query=value;

page=1;

loadMovies();

},500);

}



search?.addEventListener(
"keyup",
e=>{

doSearch(
e.target.value
);

}
);


mobileSearch?.addEventListener(
"keyup",
e=>{

doSearch(
e.target.value
);

}
);



document
.getElementById(
"moviesBtn"
)
.onclick=e=>{

e.preventDefault();

mode="movie";

query="";

page=1;

loadMovies();

};



document
.getElementById(
"seriesBtn"
)
.onclick=e=>{

e.preventDefault();

mode="tv";

query="";

page=1;

loadMovies();

};



document
.getElementById(
"mobileMovies"
)
.onclick=e=>{

e.preventDefault();

mode="movie";

query="";

page=1;

loadMovies();

};



document
.getElementById(
"mobileSeries"
)
.onclick=e=>{

e.preventDefault();

mode="tv";

query="";

page=1;

loadMovies();

};



loadMovies();
