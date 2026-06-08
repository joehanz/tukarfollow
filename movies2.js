const KEY="b3b893873ed1bb7f175b2707afeea2a0";

let page=1;
let mode="all";
let query="";

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



async function loadMovies(){

let url="";

if(query){

url=`
https://api.themoviedb.org/3/search/multi
?api_key=${KEY}
&query=${encodeURIComponent(query)}
&page=${page}
`;

}else{

if(mode==="movies"){

url=`
https://api.themoviedb.org/3/trending/movie/day
?api_key=${KEY}
&page=${page}
`;

}else if(mode==="series"){

url=`
https://api.themoviedb.org/3/trending/tv/day
?api_key=${KEY}
&page=${page}
`;

}else{

url=`
https://api.themoviedb.org/3/trending/all/day
?api_key=${KEY}
&page=${page}
`;

}

}

url=url.replace(/\s/g,'');

const res=
await fetch(url);

const data=
await res.json();

renderMovies(
data.results||[]
);

renderPagination(
Math.min(
data.total_pages,
500
)
);

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

const card=
document.createElement(
"div"
);

card.className=
"card";

card.innerHTML=`

<img
src="
https://image.tmdb.org/t/p/w500${movie.poster_path}
"
loading="lazy"
>

<h3>
${title}
</h3>

`;

card.onclick=()=>{

location=
`watch2.html?title=${
encodeURIComponent(
title
)
}`;

};

grid.appendChild(
card
);

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



search?.addEventListener(
"keyup",
e=>{

query=
e.target.value;

page=1;

loadMovies();

}
);


mobileSearch?.addEventListener(
"keyup",
e=>{

query=
e.target.value;

page=1;

loadMovies();

}
);



document
.querySelectorAll("a")
.forEach(a=>{

if(

a.innerText
==="Movies"

){

a.onclick=e=>{

e.preventDefault();

mode=
"movies";

page=1;

query="";

loadMovies();

};

}


if(

a.innerText
==="Series"

){

a.onclick=e=>{

e.preventDefault();

mode=
"series";

page=1;

query="";

loadMovies();

};

}

});


loadMovies();
