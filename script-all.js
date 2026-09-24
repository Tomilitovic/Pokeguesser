const bgMusic = document.getElementById('bg-music'), btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;
btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; } 
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

const grid = document.getElementById('pokedex-grid'), input = document.getElementById('saisie'), scoreText = document.getElementById('score'), timerText = document.getElementById('timer');
let scoreActuel = 0, pokemonsData = {}, pokemonsTrouves = []; 
let timerInterval, timerStarted = false, secondsElapsed = parseInt(localStorage.getItem('timerGenAll')) || 0;

function formatTime(sec) { return `${Math.floor(sec / 3600).toString().padStart(2, '0')}:${Math.floor((sec % 3600) / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }
timerText.innerText = formatTime(secondsElapsed);

function startTimer() {
    if (!timerStarted && scoreActuel < 1025) {
        timerStarted = true;
        timerInterval = setInterval(() => { secondsElapsed++; timerText.innerText = formatTime(secondsElapsed); localStorage.setItem('timerGenAll', secondsElapsed); }, 1000);
    }
}

window.addEventListener('beforeunload', (e) => { if (scoreActuel > 0 && scoreActuel < 1025) { e.preventDefault(); e.returnValue = ''; } });
document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm("Voulez-vous vraiment effacer votre progression de 1025 Pokémon ?")) { localStorage.removeItem('sauvegardeGenAll'); localStorage.removeItem('timerGenAll'); location.reload(); }
});

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
    // Crée le gros bloc de la génération
    let container = document.createElement('div');
    container.classList.add('gen-container');
    container.innerHTML = `<h2 class="gen-title">${gen.nom}</h2>`;
    
    // Crée la grille compacte pour les Pokémon de cette génération
    let gridSmall = document.createElement('div');
    gridSmall.classList.add('grid-small');
    
    // Génère les petites cases
    for (let i = gen.debut; i <= gen.fin; i++) {
        let box = document.createElement('div'); 
        box.classList.add('pokemon-box-small'); // Nouvelle classe pour les petites cases
        box.id = "box-" + i;
        box.innerHTML = `<span class="numero">#${i.toString().padStart(3, '0')}</span>`; 
        gridSmall.appendChild(box);
    }
    
    container.appendChild(gridSmall);
    grid.appendChild(container);
});

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[- ]/g, "").toLowerCase().trim(); }

async function chargerPokemons() {
    input.placeholder = "Chargement des 1025 Pokémon (patiente un peu)..."; input.disabled = true; 
    // On télécharge jusqu'à 1025
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_lte: 1025}}) { id name pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id } } }`;
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        data.data.pokemonspecies.forEach(e => {
            const id = e.id, nomAnglais = normaliserTexte(e.name), nomFrancais = normaliserTexte(e.pokemonspeciesnames[0].name), formes = e.pokemons.map(p => p.id);
            pokemonsData[nomFrancais] = { id, formes, vraiNom: e.pokemonspeciesnames[0].name }; pokemonsData[nomAnglais] = { id, formes, vraiNom: e.name }; 
        });

        const sauvegarde = localStorage.getItem('sauvegardeGenAll');
        if (sauvegarde) {
            JSON.parse(sauvegarde).forEach(id => {
                let nomAffiche = "Trouvé";
                for (let cle in pokemonsData) { if (pokemonsData[cle].id === id) { nomAffiche = pokemonsData[cle].vraiNom; break; } }
                validerPokemon(id, pokemonsData[normaliserTexte(nomAffiche)].formes, nomAffiche, false);
            });
        }
        input.placeholder = "Tapez un nom de Pokémon..."; input.disabled = false; input.focus();
    } catch (err) { input.placeholder = "Erreur de chargement !"; }
}

function declencherVictoire() {
    new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg').play();
    let duration = 30000, end = Date.now() + duration; // 30 secondes de confettis pour l'exploit !
    let interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({ particleCount: 100, startVelocity: 30, spread: 360, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);
}

function validerPokemon(idPokemon, formes, nomSaisi, joueurActif = true) {
    const box = document.getElementById("box-" + idPokemon);
    if (!box.classList.contains('trouve')) {
        box.classList.add('trouve'); scoreActuel++; scoreText.innerText = scoreActuel;
        if(joueurActif) {
            startTimer();
            let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${idPokemon}.ogg`); cri.volume = 0.5; cri.play();
            pokemonsTrouves.push(idPokemon); localStorage.setItem('sauvegardeGenAll', JSON.stringify(pokemonsTrouves));
        } else { pokemonsTrouves.push(idPokemon); }
        
        // On utilise la classe "nom" pour cibler le texte avec le CSS
        box.innerHTML = `<img id="img-${idPokemon}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formes[0]}.png"><span class="nom">${nomSaisi.toUpperCase()}</span>`;
        
        if (formes.length > 1) {
            let index = 0; setInterval(() => {
                let img = document.getElementById(`img-${idPokemon}`);
                if (img) { index = (index + 1) % formes.length; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formes[index]}.png`; }
            }, 10000);
        }
        if (scoreActuel === 1025 && joueurActif) { clearInterval(timerInterval); input.disabled = true; input.placeholder = "VOUS ÊTES LE MAÎTRE POKÉMON !"; declencherVictoire(); }
    }
}

input.addEventListener('input', (e) => {
    const texte = normaliserTexte(e.target.value);
    if (pokemonsData[texte] && !document.getElementById("box-" + pokemonsData[texte].id).classList.contains('trouve')) {
        validerPokemon(pokemonsData[texte].id, pokemonsData[texte].formes, e.target.value, true); e.target.value = "";
    }
});
chargerPokemons();