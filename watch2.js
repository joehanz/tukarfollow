const KEY="b3b893873ed1bb7f175b2707afeea2a0";

const id=
new URLSearchParams(
location.search
).get("id");


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

const player=
document.getElementById(
"player"
);

const hero=
document.getElementById(
"watchHero");



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



hero.style.background=

`linear-gradient(
rgba(0,0,0,.7),
rgba(0,0,0,.9)
),

url(
https://image.tmdb.org/t/p/original${movie.backdrop_path}
)

center/cover`;



loadCustomPlayer(
movie.title||
movie.name
);


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

m=>

m.title
.toLowerCase()
.includes(
name.toLowerCase()
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



loadMovie();
