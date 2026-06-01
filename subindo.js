const ITEMS_PER_PAGE=24;

let movies=[];
let filtered=[];
let page=1;

/* BURGER */

function toggleMenu(){

document
.getElementById("mobileMenu")
.classList.toggle("show");

}

/* LOAD JSON */

async function load(){

try{

const data=await fetch(
"movies.json"
);

movies=await data.json();

filtered=[...movies];

render();

}
catch(err){

console.log(
"movies.json gagal dimuat",
err
);

}

}

/* RENDER GRID */

function render(){

const start=
(page-1)*ITEMS_PER_PAGE;

const end=
start+ITEMS_PER_PAGE;

const current=
filtered.slice(
start,
end
);

let h="";

current.forEach((m,i)=>{

h+=`

<div
class="card"
onclick="go(${movies.indexOf(m)})"
>

<img
src="${m.image}"
loading="lazy"
>

<div class="title">

${m.title}

</div>

</div>

`;

});

document
.getElementById("grid")
.innerHTML=h;

renderPagination();

}

/* PAGINATION */

function renderPagination(){

const totalPages=
Math.ceil(
filtered.length/
ITEMS_PER_PAGE
);

let h="";

let start=
Math.max(
1,
page-2
);

let end=
Math.min(
totalPages,
start+5
);

for(
let i=start;
i<=end;
i++
){

h+=`

<button
onclick="goPage(${i})"
style="
background:
${i===page
?'#ff2e2e'
:'#1a1a22'
};
"
>

${i}

</button>

`;

}

if(page<totalPages){

h+=`

<button
onclick="goPage(${page+1})"
>

›

</button>

`;

}

document
.getElementById(
"pagination"
)
.innerHTML=h;

}

/* PAGE */

function goPage(p){

page=p;

render();

window.scrollTo({

top:0,
behavior:"smooth"

});

}

/* SEARCH */

function searchMovie(){

const q=
document
.getElementById(
"search"
)
.value
.toLowerCase()
.trim();

page=1;

if(!q){

filtered=
[...movies];

render();

return;

}

filtered=
movies.filter(m=>

m.title
.toLowerCase()
.includes(q)

);

render();

}

/* MOBILE SEARCH */

function searchMovieMobile(){

const q=
document
.querySelector(
"#mobileMenu input"
)
.value
.toLowerCase()
.trim();

page=1;

if(!q){

filtered=
[...movies];

render();

return;

}

filtered=
movies.filter(m=>

m.title
.toLowerCase()
.includes(q)

);

render();

}

/* OPEN WATCH */

function go(i){

location.href=
`manual-watch.html?movie=${i}`;

}

load();
