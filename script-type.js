const bgMusic = document.getElementById('bg-music'), btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;
btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; }
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

const grid = document.getElementById('pokedex-grid'), input = document.getElementById('saisie');
const scoreText = document.getElementById('score'), timerText = document.getElementById('timer'), maxText = document.getElementById('score-max');
const titreType = document.getElementById('titre-type-choisi');

let allPokemons = [];
let pokeDuTypeActuel = [];
let pokemonsTrouves = [];
let scoreActuel = 0, scoreMax = 0;
let typeActif = null; 
let timerInterval, timerStarted = false, secondsElapsed = 0;
let intervalsFormes = {};

// Ordre et traductions exactes de ton image
const typeConfig = {
    'water': { fr: 'Eau', color: '#6390F0' }, 'fire': { fr: 'Feu', color: '#EE8130' },
    'grass': { fr: 'Plante', color: '#7AC74C' }, 'ground': { fr: 'Sol', color: '#E2BF65' },
    'rock': { fr: 'Roche', color: '#B6A136' }, 'steel': { fr: 'Acier', color: '#B7B7CE' },
    'ice': { fr: 'Glace', color: '#96D9D6' }, 'electric': { fr: 'Électrik', color: '#F7D02C' },
    'dragon': { fr: 'Dragon', color: '#6F35FC' }, 'ghost': { fr: 'Spectre', color: '#735797' },
    'psychic': { fr: 'Psy', color: '#F95587' }, 'normal': { fr: 'Normal', color: '#A8A77A' },
    'fighting': { fr: 'Combat', color: '#C22E28' }, 'poison': { fr: 'Poison', color: '#A33EA1' },
    'bug': { fr: 'Insecte', color: '#A6B91A' }, 'flying': { fr: 'Vol', color: '#A98FF3' },
    'dark': { fr: 'Ténèbres', color: '#705746' }, 'fairy': { fr: 'Fée', color: '#D685AD' }
};

// 1. GÉNÉRER LES BOUTONS (Grands cercles SVG + Texte)
const typeMenu = document.getElementById('type-menu');
for (let key in typeConfig) {
    let btn = document.createElement('button');
    btn.className = 'btn-type';
    btn.id = 'btn-type-' + key;
    // La balise img utilise directement les icônes officielles qui sont déjà rondes !
    btn.innerHTML = `<img src="https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/${key}.svg" alt="${typeConfig[key].fr}"> <span>${typeConfig[key].fr.toUpperCase()}</span>`;
    btn.onclick = () => chargerType(key);
    typeMenu.appendChild(btn);
}

function formatTime(sec) { return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }

function startTimer() {
    if (!timerStarted && scoreActuel < scoreMax && typeActif) {
        timerStarted = true;
        timerInterval = setInterval(() => { secondsElapsed++; timerText.innerText = formatTime(secondsElapsed); }, 1000);
    }
}

document.getElementById('btn-reset').addEventListener('click', () => { if(typeActif) chargerType(typeActif); });

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "").toLowerCase().trim(); }

// 2. CHANGER DE TYPE ET PRÉPARER LA GRILLE
function chargerType(type) {
    typeActif = type;
    document.querySelectorAll('.btn-type').forEach(b => b.classList.remove('actif'));
    document.getElementById('btn-type-' + type).classList.add('actif');
    Object.values(intervalsFormes).forEach(clearInterval); intervalsFormes = {};

    // Afficher et colorer le titre
    titreType.innerText = `TYPE ${typeConfig[type].fr.toUpperCase()}`;
    titreType.style.color = typeConfig[type].color;
    titreType.style.display = 'block';

    pokemonsTrouves = [];
    scoreActuel = 0;
    secondsElapsed = 0;
    timerText.innerText = formatTime(0);
    clearInterval(timerInterval); timerStarted = false;
    document.getElementById('btn-ombre').disabled = false;

    pokeDuTypeActuel = allPokemons.filter(p => p.types.includes(type));
    scoreMax = pokeDuTypeActuel.length;
    scoreText.innerText = scoreActuel;
    maxText.innerText = scoreMax;

    grid.innerHTML = '';
    
    // Construction des tableaux par génération avec la nouvelle classe ULTRA COMPACTE
    for (let gen = 1; gen <= 9; gen++) {
        const pokeDeCetteGen = pokeDuTypeActuel.filter(p => p.generation === gen);
        if (pokeDeCetteGen.length > 0) {
            let container = document.createElement('div');
            container.classList.add('gen-container');
            container.innerHTML = `<h2 class="gen-title">Génération ${gen}</h2>`;
            let gridSmall = document.createElement('div');
            gridSmall.classList.add('grid-small');

            pokeDeCetteGen.forEach(p => {
                let box = document.createElement('div');
                box.classList.add('pokemon-box-micro'); // Rendu beaucoup plus petit !
                box.id = "box-" + p.id;
                box.innerHTML = `<span class="numero">#${p.id.toString().padStart(3, '0')}</span>`;
                gridSmall.appendChild(box);
            });
            container.appendChild(gridSmall); grid.appendChild(container);
        }
    }
    input.placeholder = `Tapez un nom de Pokémon de type ${typeConfig[type].fr}...`;
    input.disabled = false; input.focus();
}

// 3. TÉLÉCHARGEMENT INITIAL 
async function initialiserBaseDeDonnees() {
    input.placeholder = "Analyse des 18 types (patiente un peu)..."; input.disabled = true;
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_lte: 1025}}) { id name generation_id pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id pokemontypes { type { name } } } } }`;
    
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(e => {
            let typesSet = new Set();
            e.pokemons.forEach(p => p.pokemontypes.forEach(pt => typesSet.add(pt.type.name)));
            allPokemons.push({
                id: e.id, generation: e.generation_id,
                nomAnglais: normaliserTexte(e.name), nomFrancais: normaliserTexte(e.pokemonspeciesnames[0].name),
                vraiNom: e.pokemonspeciesnames[0].name,
                formes: e.pokemons.map(p => p.id), types: Array.from(typesSet)
            });
        });
        input.placeholder = "Choisissez un type dans le menu ci-dessus !";
    } catch (err) { input.placeholder = "Erreur réseau !"; }
}

function declencherVictoire() {
    new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg').play();
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
            <span class="nom">${nomSaisi}</span>`;
            
        if (formes.length > 1) {
            let index = 0; intervalsFormes[idPokemon] = setInterval(() => {
                let img = document.getElementById(`img-${idPokemon}`);
                if (img) { index = (index + 1) % formes.length; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${formes[index]}.png`; }
            }, 10000);
        }
        
        if (scoreActuel === scoreMax) {
            clearInterval(timerInterval); input.disabled = true; input.placeholder = "INCROYABLE ! TYPE COMPLÉTÉ !";
            declencherVictoire();
        }
    }
}

// 4. ÉCOUTE DE LA SAISIE
input.addEventListener('input', (e) => {
    if (!typeActif) { e.target.value = ""; return; }
    startTimer();
    const texte = normaliserTexte(e.target.value);
    
    if (texte === "nidoran") {
        const pF = pokeDuTypeActuel.find(p => p.id === 29), pM = pokeDuTypeActuel.find(p => p.id === 32);
        if (pF && !pokemonsTrouves.includes(29)) validerPokemon(29, pF.formes, pF.vraiNom);
        if (pM && !pokemonsTrouves.includes(32)) validerPokemon(32, pM.formes, pM.vraiNom);
        e.target.value = ""; return;
    }

    const p = pokeDuTypeActuel.find(poke => poke.nomAnglais === texte || poke.nomFrancais === texte);
    if (p && !pokemonsTrouves.includes(p.id)) {
        validerPokemon(p.id, p.formes, p.vraiNom);
        e.target.value = "";
    }
});

// ACTIONS OMBRE ET ABANDON
document.getElementById('btn-ombre').addEventListener('click', () => {
    if (pokeDuTypeActuel.length === 0) return;
    startTimer();
    pokeDuTypeActuel.forEach(p => {
        let box = document.getElementById("box-" + p.id);
        if (!box.classList.contains('trouve') && !box.classList.contains('rate')) {
            box.innerHTML = `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png"><span class="numero">#${p.id.toString().padStart(3, '0')}</span>`;
        }
    });
    document.getElementById('btn-ombre').disabled = true;
});

document.getElementById('btn-abandon').addEventListener('click', () => {
    if (pokeDuTypeActuel.length === 0) return;
    if (confirm(`Voulez-vous vraiment abandonner le type ${typeConfig[typeActif].fr} ?`)) {
        clearInterval(timerInterval); 
        input.disabled = true; input.placeholder = "Quiz terminé !";
        
        pokeDuTypeActuel.forEach(p => {
            if (!pokemonsTrouves.includes(p.id)) {
                let box = document.getElementById("box-" + p.id);
                box.classList.add('rate'); 
                box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png">
                <span class="nom">${p.vraiNom}</span>`;
            }
        });
    }
});

initialiserBaseDeDonnees();