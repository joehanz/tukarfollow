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
