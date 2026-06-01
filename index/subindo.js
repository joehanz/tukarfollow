const MOVIES_URL="../movies.json";

let movies=[];
let filtered=[];
let page=1;
const perPage=24;

function toggleMenu(){
document.getElementById("mobileMenu")
.classList.toggle("show");
}

/* LOAD MOVIES */
async function load(){

try{

const data=await fetch(MOVIES_URL)
.then(r=>r.json());

movies=data;
filtered=[...movies];

render();
renderPagination();

}catch(err){

console.log(err);

document.getElementById("grid").innerHTML=`
<div style="
padding:30px;
text-align:center;
opacity:.7;
">
Gagal memuat movies.json
</div>
`;

}

}

/* RENDER GRID */
function render(){

let start=(page-1)*perPage;
let end=start+perPage;

let current=filtered.slice(
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

<img src="${m.image}">

<div class="title">
${m.title}
</div>

</div>

`;

});

document.getElementById(
"grid"
).innerHTML=h;

}

/* PAGINATION */
function renderPagination(){

let total=
Math.ceil(
filtered.length/perPage
);

let h="";

let start=Math.max(
1,
page-2
);

let end=Math.min(
total,
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
background:${i===page?'#ff2e2e':'#1a1a22'}
"
>

${i}

</button>

`;

}

if(page<total){

h+=`

<button
onclick="goPage(${page+1})"
>

›

</button>

`;

}

document.getElementById(
"pagination"
).innerHTML=h;

}

function goPage(p){

page=p;

render();

renderPagination();

window.scrollTo({

top:0,
behavior:"smooth"

});

}

/* SEARCH */
function searchMovie(){

const q=
document.getElementById(
"search"
).value
.toLowerCase();

filtered=
movies.filter(m=>

m.title.toLowerCase()
.includes(q)

);

page=1;

render();

renderPagination();

}

/* MOBILE SEARCH */
function searchMovieMobile(){

const q=
document.querySelector(
"#mobileMenu input"
).value
.toLowerCase();

filtered=
movies.filter(m=>

m.title.toLowerCase()
.includes(q)

);

page=1;

render();

renderPagination();

}

/* OPEN DETAIL */
function go(i){

location.href=
`manual-watch.html?id=${i}`;

}

load();
