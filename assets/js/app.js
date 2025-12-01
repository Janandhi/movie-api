console.log("JS Loaded");

// WEATHER API — must use HTTPS
fetch("https://api.weatherapi.com/v1/current.json?key=c4210f8c4d7c43c1a2995926251611&q=colombo&aqi=no")
.then(res => res.json())
.then(data => console.log("Weather Data:", data))
.catch(err => console.error(err));


// =========================
// OMDb API
// =========================

// Your API key
const API_KEY = "1c768e4f";
const API_BASE = "https://www.omdbapi.com/";

// Unified fetch helper
async function omdbFetch(params){
  const url = new URL(API_BASE);
  params.apikey = API_KEY;

  Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));

  const res = await fetch(url);
  if(!res.ok) throw new Error("Network Error");

  return await res.json();
}


// =========================
// DOM REFERENCES
// =========================
const resultsEl = document.getElementById("results");
const resultsTitleEl = document.getElementById("results-title");
const detailsSection = document.getElementById("details-section");
const detailsEl = document.getElementById("details");
const resultsSection = document.getElementById("results-section");
const topListEl = document.getElementById("top-list");


// =========================
// SEARCH BY TITLE
// =========================
document.getElementById("btn-search-title").addEventListener("click", async ()=>{
  const title = document.getElementById("search-title").value.trim();
  if(!title) return alert("Enter a movie title");

  try{
    resultsTitleEl.textContent = `Result for: "${title}"`;

    const data = await omdbFetch({ t: title });

    if(data.Response === "False"){
      resultsEl.innerHTML = `<p>No movie found for "${title}"</p>`;
      return;
    }

    resultsEl.innerHTML = "";
    resultsEl.appendChild(createCardFromMovie(data));

  }catch(err){
    console.error(err);
    alert("Error fetching movie");
  }
});


// =========================
// SEARCH BY KEYWORD
// =========================
document.getElementById("btn-search-keyword").addEventListener("click", async ()=>{
  const kw = document.getElementById("search-keyword").value.trim();
  if(!kw) return alert("Enter a keyword");

  try{
    resultsTitleEl.textContent = `Search results: ${kw}`;
    const data = await omdbFetch({ s: kw });

    if(data.Response === "False"){
      resultsEl.innerHTML = `<p>No results for "${kw}"</p>`;
      return;
    }

    resultsEl.innerHTML = "";
    data.Search.forEach(m => resultsEl.appendChild(createCard(m)));

  }catch(err){
    console.error(err);
    alert("Error searching");
  }
});


// =========================
// RANDOM MOVIE GENERATOR
// =========================
document.getElementById("btn-random").addEventListener("click", async ()=>{
  const list = [
    "tt0111161","tt0068646","tt1375666",
    "tt0137523","tt0109830","tt0120815",
    "tt0167260","tt0133093","tt0468569"
  ];

  const id = list[Math.floor(Math.random() * list.length)];
  await showMovieById(id);
});


// =========================
// CARD GENERATORS
// =========================
function createCard(movie){
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'assets/placeholder-poster.png'}" alt="${movie.Title}">
    <div class="meta">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
    </div>
  `;
  card.onclick = () => showMovieById(movie.imdbID);

  return card;
}

function createCardFromMovie(movie){
  return createCard({
    Title: movie.Title,
    Year: movie.Year,
    imdbID: movie.imdbID,
    Poster: movie.Poster
  });
}


// =========================
// MOVIE DETAILS PAGE
// =========================
async function showMovieById(imdbID){
  try{
    const m = await omdbFetch({ i: imdbID, plot: "full" });

    if(m.Response === "False"){
      alert("Movie not found");
      return;
    }

    resultsSection.classList.add("hidden");
    detailsSection.classList.remove("hidden");

    renderDetails(m);

    location.hash = `movie=${imdbID}`;

  }catch(err){
    console.error(err);
    alert("Error fetching details");
  }
}

function renderDetails(m){
  detailsEl.innerHTML = `
    <img src="${m.Poster !== 'N/A' ? m.Poster : 'assets/placeholder-poster.png'}" alt="${m.Title}">
    <div class="info">
      <h2>${m.Title} <small>(${m.Year})</small></h2>
      <p><strong>Genre:</strong> ${m.Genre}</p>
      <p><strong>Director:</strong> ${m.Director}</p>
      <p><strong>Actors:</strong> ${m.Actors}</p>
      <p><strong>IMDb Rating:</strong> ${m.imdbRating} (${m.imdbVotes} votes)</p>
      <p><strong>Plot:</strong> ${m.Plot}</p>
      <p><a href="https://www.imdb.com/title/${m.imdbID}" target="_blank">View on IMDb</a></p>
    </div>
  `;
}

document.getElementById("back-btn").addEventListener("click", ()=>{
  detailsSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");
  location.hash = "";
});


// =========================
// LOAD TOP MOVIES
// =========================
const TOP_IDS = ["tt0111161","tt0068646","tt1375666","tt0137523","tt0109830"];

async function loadTop(){
  topListEl.innerHTML = "";
  for(const id of TOP_IDS){
    try{
      const m = await omdbFetch({ i: id });
      if(m.Response === "True"){
        topListEl.appendChild(
          createCard({Title: m.Title, Year: m.Year, imdbID: m.imdbID, Poster: m.Poster})
        );
      }
    }catch(e){
      console.warn("Top fetch error:", e);
    }
  }
}


// =========================
// PAGE LOAD EVENTS
// =========================
window.addEventListener("load", ()=>{
  loadTop();

  if(location.hash.startsWith("#movie=")){
    const id = location.hash.replace("#movie=","");
    if(id) showMovieById(id);
  }
});
