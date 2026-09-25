const bgMusic = document.getElementById('bg-music'), btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;
btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; }
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

const grid = document.getElementById('pokedex-grid');
const input = document.getElementById('saisie');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');

let scoreActuel = 0;
let pokemonsData = {};
let pokemonsTrouves = [];

let timerInterval;
let timerStarted = false;
let secondsElapsed = 0;
const scoreMax = 120;
const idDebut = 906;
const idFin = 1025;

function formatTime(sec) { return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }

function startTimer() {
    if (!timerStarted && scoreActuel < scoreMax) {
        timerStarted = true;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            timerText.innerText = formatTime(secondsElapsed);
        }, 1000);
    }
}

document.getElementById('btn-reset').addEventListener('click', () => { location.reload(); });

for (let i = idDebut; i <= idFin; i++) {
    let box = document.createElement('div');
    box.classList.add('pokemon-box');
    box.id = "box-" + i;
    box.innerHTML = `<span class="numero">#${i.toString().padStart(3, '0')}</span>`;
    grid.appendChild(box);
}

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "").toLowerCase().trim(); }

async function chargerPokemons() {
    input.placeholder = "Chargement..."; input.disabled = true;
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_gte: ${idDebut}, _lte: ${idFin}}}) { id name pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id } } }`;
    
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(e => {
            const id = e.id;
            const nomAnglais = normaliserTexte(e.name);
            const nomFrancais = normaliserTexte(e.pokemonspeciesnames[0].name);
            const formes = e.pokemons.map(p => p.id);
            pokemonsData[nomFrancais] = { id, formes, vraiNom: e.pokemonspeciesnames[0].name };
            pokemonsData[nomAnglais] = { id, formes, vraiNom: e.name };
        });

        input.placeholder = "Tapez un nom de Pokémon..."; input.disabled = false; input.focus();
    } catch (err) { input.placeholder = "Erreur de chargement !"; }
}

function declencherVictoire() {
    new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${idFin}.ogg`).play();
    let duration = 15000, end = Date.now() + duration;
    let interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({ particleCount: 50, startVelocity: 30, spread: 360, origin: { x: Math.random(), y: Math.random() } });
    }, 250);
}

function validerPokemon(idPokemon, formes, nomSaisi) {
    const box = document.getElementById("box-" + idPokemon);
    if (!box.classList.contains('trouve')) {
        box.classList.remove('rate'); 
        box.classList.add('trouve');
        scoreActuel++; scoreText.innerText = scoreActuel;
        pokemonsTrouves.push(idPokemon);
        
        let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${idPokemon}.ogg`);
        cri.volume = 0.5; cri.play();
        
        box.innerHTML = `
            <img id="img-${idPokemon}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idPokemon}.png">
            <span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: white;">${nomSaisi}</span>`;
            
        if (formes.length > 1) {
            let index = 0; setInterval(() => {
                let img = document.getElementById(`img-${idPokemon}`);
                if (img) { index = (index + 1) % formes.length; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${formes[index]}.png`; }
            }, 10000);
        }
        
        if (scoreActuel === scoreMax) {
            clearInterval(timerInterval); 
            input.disabled = true; input.placeholder = "INCROYABLE ! FINI !";
            declencherVictoire();
        }
    }
}

input.addEventListener('input', (e) => {
    startTimer();
    const texte = normaliserTexte(e.target.value);
    
    if (pokemonsData[texte] && !pokemonsTrouves.includes(pokemonsData[texte].id)) {
        validerPokemon(pokemonsData[texte].id, pokemonsData[texte].formes, pokemonsData[texte].vraiNom);
        e.target.value = "";
    }
});

document.getElementById('btn-ombre').addEventListener('click', () => {
    startTimer();
    for (let i = idDebut; i <= idFin; i++) {
        let box = document.getElementById("box-" + i);
        if (!box.classList.contains('trouve') && !box.classList.contains('rate')) {
            box.innerHTML = `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png"><span class="numero">#${i.toString().padStart(3, '0')}</span>`;
        }
    }
    document.getElementById('btn-ombre').disabled = true;
});

document.getElementById('btn-abandon').addEventListener('click', () => {
    if (confirm("Voulez-vous vraiment abandonner et révéler les réponses ?")) {
        clearInterval(timerInterval); 
        input.disabled = true;
        input.placeholder = "Quiz terminé !";
        
        for (let i = idDebut; i <= idFin; i++) {
            if (!pokemonsTrouves.includes(i)) {
                let box = document.getElementById("box-" + i);
                box.classList.add('rate'); 
                let vraiNom = "Inconnu";
                for (let key in pokemonsData) { if (pokemonsData[key].id === i) { vraiNom = pokemonsData[key].vraiNom; break; } }
                
                box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png">
                <span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: white;">${vraiNom}</span>`;
            }
        }
    }
});

chargerPokemons();