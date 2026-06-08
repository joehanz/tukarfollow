const KEY="b3b893873ed1bb7f175b2707afeea2a0";

const id=
new URLSearchParams(
location.search
).get("id");

const IMG=
"https://image.tmdb.org/t/p/w500";

const BIG=
"https://image.tmdb.org/t/p/original";


const banner=
document.getElementById(
"watchBanner"
);

const player=
document.getElementById(
"player"
);

const title=
document.getElementById(
"title"
);

const meta=
document.getElementById(
"meta"
);

const sinopsis=
document.getElementById(
"sinopsis"
);

const rel=
document.getElementById(
"rel"
);



async function loadMovie(){

try{

let res=
await fetch(

`https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}`

);

let movie=
await res.json();


title.innerHTML=

movie.title||
movie.name;


meta.innerHTML=

`
⭐ ${movie.vote_average}

| 

${movie.release_date}

|

${movie.runtime} menit
`;


sinopsis.innerHTML=

movie.overview||
"Tidak ada sinopsis";


banner.innerHTML=

`
<img
src="${BIG}${movie.backdrop_path}"
style="
width:100%;
height:300px;
object-fit:cover;
border-radius:15px;
margin-bottom:25px;
">
`;


loadCustomPlayer(
movie.title||
movie.name
);


loadRelated();


}
catch(e){

console.log(e);

}

}




async function loadCustomPlayer(name){

try{

let res=
await fetch(
"movies.json"
);

let data=
await res.json();


let custom=

data.find(

x=>

name
.toLowerCase()
.includes(

x.title
.toLowerCase()

)

);


if(custom){

player.src=
custom.iframe;

return;

}



player.src=

"https://www.youtube.com/embed/dQw4w9WgXcQ";


}
catch(e){

console.log(e);

}

}




async function loadRelated(){

let res=
await fetch(

`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${KEY}`

);

let data=
await res.json();


let html="";


data.results
.slice(0,12)
.forEach(movie=>{


html+=`

<div
class="card"

onclick="location.href='watch2.html?id=${movie.id}'"

>

<img
src="${IMG}${movie.poster_path}"
loading="lazy"
>

<div class="cardInfo">

<h3>

${movie.title}

</h3>

<span>

⭐ ${movie.vote_average.toFixed(1)}

</span>

</div>

</div>

`;

});


rel.innerHTML=
html;


}



loadMovie();
