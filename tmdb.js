const API = atob(&quot;OWUzMzVkMjFkMzVmMDQ5MTdiMjE4YmFlN2FkYzg4MWY=&quot;);

  let page = 1;

  /* =========================
     RANDOM SITES
  ========================= */
  const sites = [
    &quot;https://rajarayap.com&quot;,
    &quot;https://caturbangunsentosa.blogspot.com&quot;,
    &quot;https://ptdwiprima.blogspot.com&quot;
  ];

  /* =========================
     RANDOM PICK
  ========================= */
  function randomSite(){
    return sites[Math.floor(Math.random() * sites.length)];
  }

  /* =========================
     ONLY FILM INDONESIA
  ========================= */
  function endpoint(){
    return &quot;https://api.themoviedb.org/3/discover/movie?api_key=&quot;
      + API
      + &quot;&amp;with_original_language=id&quot;
      + &quot;&amp;sort_by=popularity.desc&quot;
      + &quot;&amp;page=&quot; + page;
  }

  /* =========================
     GRID LOAD
  ========================= */
  async function load(){

    document.getElementById(&quot;pageNum&quot;).innerText = page;

    const r = await fetch(endpoint());
    const d = await r.json();

    const grid = document.getElementById(&quot;grid&quot;);
    grid.innerHTML = &quot;&quot;;

    d.results.forEach(m =&gt; {

      if(!m.poster_path) return;

      const el = document.createElement(&quot;div&quot;);
      el.className = &quot;card&quot;;

      el.innerHTML = `
        <img src='https://image.tmdb.org/t/p/w300${m.poster_path}'/>
        <div class='card-title'>${m.title}</div>
      `;

      el.onclick = () =&gt; openMovie(m.id);

      grid.appendChild(el);
    });
  }

  /* =========================
     PAGINATION
  ========================= */
  function nextPage(){
    page++;
    load();
  }

  function prevPage(){
    if(page &gt; 1){
      page--;
      load();
    }
  }

  /* =========================
     CLICK STATE TRACKER
  ========================= */
  let clickStep = 0;

  /* =========================
     OPEN MOVIE
  ========================= */
  async function openMovie(id){

    document.getElementById(&quot;modal&quot;).style.display = &quot;flex&quot;;
    document.body.classList.add(&quot;modal-open&quot;);

    const r = await fetch(
      &quot;https://api.themoviedb.org/3/movie/&quot; +
      id +
      &quot;?api_key=&quot; + API +
      &quot;&amp;append_to_response=external_ids&quot;
    );

    const d = await r.json();

    document.getElementById(&quot;title&quot;).innerText = d.title;

    document.getElementById(&quot;meta&quot;).innerHTML =
      &quot;&#11088; &quot; + d.vote_average +
      &quot; | 📅 &quot; + d.release_date +
      &quot; | 🎭 &quot; + d.genres.map(g =&gt; g.name).join(&quot;, &quot;) +
      &quot; | 🌍 &quot; + (d.production_countries?.[0]?.name || &quot;-&quot;) +
      &quot; | <span id='onlineCounter'>👁&#65039; 0 Watching</span>&quot;;

    document.getElementById(&quot;desc&quot;).innerText =
      d.overview || &quot;&quot;;

    const imdb = d.external_ids?.imdb_id;

    if(!imdb){
      document.getElementById(&quot;player&quot;).src = &quot;&quot;;
      return;
    }

    const url =
      &quot;https://vsembed.su/embed/movie?imdb=&quot; + imdb;

    const player = document.getElementById(&quot;player&quot;);

    player.src = url;

    clickStep = 0;

    addOverlay(player, url);
  }

  /* =========================
     OVERLAY LOGIC
  ========================= */
  function addOverlay(player, url){

    const modal = document.getElementById(&quot;modal&quot;);

    const old = document.getElementById(&quot;clickLayer&quot;);
    if(old) old.remove();

    const layer = document.createElement(&quot;div&quot;);

    layer.id = &quot;clickLayer&quot;;

    layer.style.position = &quot;absolute&quot;;
    layer.style.top = &quot;0&quot;;
    layer.style.left = &quot;0&quot;;
    layer.style.width = &quot;100%&quot;;
    layer.style.height = &quot;100%&quot;;
    layer.style.background = &quot;rgba(0,0,0,0.05)&quot;;
    layer.style.zIndex = &quot;9999&quot;;
    layer.style.cursor = &quot;pointer&quot;;

    modal.appendChild(layer);

    layer.onclick = function(){

      clickStep++;

      /* STEP 1 &amp; 2 */
      if(clickStep === 1 || clickStep === 2){
        window.open(randomSite(), &quot;_blank&quot;);
        return;
      }

      /* STEP 3 */
      if(clickStep &gt;= 3){
        layer.remove();
        clickStep = 0;
      }
    };
  }

  /* =========================
     CLOSE MODAL
  ========================= */
  function closeModal(){

    document.getElementById(&quot;modal&quot;).style.display = &quot;none&quot;;

    document.getElementById(&quot;player&quot;).src = &quot;&quot;;

    document.body.classList.remove(&quot;modal-open&quot;);

    const layer = document.getElementById(&quot;clickLayer&quot;);

    if(layer) layer.remove();

    clickStep = 0;
  }

  /* =========================
     INIT
  ========================= */
  load();
