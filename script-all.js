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
const scoreMax = 1025;

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

// Rechargement simple, plus besoin de vider le cache
document.getElementById('btn-reset').addEventListener('click', () => { location.reload(); });

// --- CRÉATION DES CATÉGORIES PAR GÉNÉRATION ---
const generations = [
    { nom: "Génération 1 (Kanto)", debut: 1, fin: 151 },
    { nom: "Génération 2 (Johto)", debut: 152, fin: 251 },
    { nom: "Génération 3 (Hoenn)", debut: 252, fin: 386 },
    { nom: "Génération 4 (Sinnoh)", debut: 387, fin: 493 },
    { nom: "Génération 5 (Unys)", debut: 494, fin: 649 },
    { nom: "Génération 6 (Kalos)", debut: 650, fin: 721 },
    { nom: "Génération 7 (Alola)", debut: 722, fin: 809 },
    { nom: "Génération 8 (Galar/Hisui)", debut: 810, fin: 905 },
    { nom: "Génération 9 (Paldea)", debut: 906, fin: 1025 }
];

generations.forEach(gen => {
    let container = document.createElement('div');
    container.classList.add('gen-container');
    container.innerHTML = `<h2 class="gen-title">${gen.nom}</h2>`;
    
    let gridSmall = document.createElement('div');
    gridSmall.classList.add('grid-small');
    
    // Génère les petites cases
    for (let i = gen.debut; i <= gen.fin; i++) {
        let box = document.createElement('div');
        box.classList.add('pokemon-box-small'); 
        box.id = "box-" + i;
        box.innerHTML = `<span class="numero">#${i.toString().padStart(3, '0')}</span>`;
        gridSmall.appendChild(box);
    }
    
    container.appendChild(gridSmall);
    grid.appendChild(container);
});

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "").toLowerCase().trim(); }

async function chargerPokemons() {
    input.placeholder = "Chargement des 1025 Pokémon (patiente un peu)..."; input.disabled = true;
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_lte: 1025}}) { id name pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id } } }`;
    
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
    new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg').play();
    let duration = 30000, end = Date.now() + duration; // 30 secondes de confettis pour l'exploit ultime !
    let interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({ particleCount: 100, startVelocity: 30, spread: 360, origin: { x: Math.random(), y: Math.random() } });
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
        
        // On utilise la classe "nom" avec le style défini pour les petites cases
        box.innerHTML = `
            <img id="img-${idPokemon}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idPokemon}.png">
            <span class="nom" style="font-size: 0.45rem !important; margin-top: 2px !important; color: white; font-weight: bold;">${nomSaisi}</span>`;
            
        if (formes.length > 1) {
            let index = 0; setInterval(() => {
                let img = document.getElementById(`img-${idPokemon}`);
                if (img) { index = (index + 1) % formes.length; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${formes[index]}.png`; }
            }, 10000);
        }
        
        if (scoreActuel === scoreMax) {
            clearInterval(timerInterval); 
            input.disabled = true; input.placeholder = "INCROYABLE ! POKÉDEX COMPLET !";
            declencherVictoire();
        }
    }
}

input.addEventListener('input', (e) => {
    startTimer();
    const texte = normaliserTexte(e.target.value);
    
    // Exception Nidoran car on a Gen 1 ici !
    if (texte === "nidoran") {
        const pF = Object.values(pokemonsData).find(p => p.id === 29);
        const pM = Object.values(pokemonsData).find(p => p.id === 32);
        if (pF && !pokemonsTrouves.includes(29)) validerPokemon(29, pF.formes, pF.vraiNom);
        if (pM && !pokemonsTrouves.includes(32)) validerPokemon(32, pM.formes, pM.vraiNom);
        e.target.value = "";
        return;
    }
    
    if (pokemonsData[texte] && !pokemonsTrouves.includes(pokemonsData[texte].id)) {
        validerPokemon(pokemonsData[texte].id, pokemonsData[texte].formes, pokemonsData[texte].vraiNom);
        e.target.value = "";
    }
});

document.getElementById('btn-ombre').addEventListener('click', () => {
    startTimer();
    for (let i = 1; i <= 1025; i++) {
        let box = document.getElementById("box-" + i);
        if (!box.classList.contains('trouve') && !box.classList.contains('rate')) {
            box.innerHTML = `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png"><span class="numero">#${i.toString().padStart(3, '0')}</span>`;
        }
    }
    document.getElementById('btn-ombre').disabled = true;
});

document.getElementById('btn-abandon').addEventListener('click', () => {
    if (confirm("Voulez-vous vraiment abandonner et révéler les 1025 réponses ?")) {
        clearInterval(timerInterval); 
        input.disabled = true;
        input.placeholder = "Quiz terminé !";
        
        for (let i = 1; i <= 1025; i++) {
            if (!pokemonsTrouves.includes(i)) {
                let box = document.getElementById("box-" + i);
                box.classList.add('rate'); 
                let vraiNom = "Inconnu";
                for (let key in pokemonsData) { if (pokemonsData[key].id === i) { vraiNom = pokemonsData[key].vraiNom; break; } }
                
                box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png">
                <span class="nom" style="font-size: 0.45rem !important; margin-top: 2px !important; color: white; font-weight: bold;">${vraiNom}</span>`;
            }
        }
    }
});

chargerPokemons();