// --- GESTION DE LA MUSIQUE ---
const bgMusic = document.getElementById('bg-music');
const btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;

btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { 
        bgMusic.pause(); 
        btnMute.innerText = "🔇 Musique OFF"; 
    } else { 
        bgMusic.play(); 
        btnMute.innerText = "🔊 Musique ON"; 
    }
    isMusicPlaying = !isMusicPlaying;
});

// --- VARIABLES GLOBALES ---
const grid = document.getElementById('pokedex-grid');
const input = document.getElementById('saisie');
const scoreText = document.getElementById('score');
const maxText = document.getElementById('score-max');
const timerText = document.getElementById('timer');
const typeMenu = document.getElementById('type-menu');
const titreType = document.getElementById('titre-type-choisi');
const scoreContainer = document.getElementById('score-container');
const timerContainer = document.getElementById('timer-container');
const btnRetourTypes = document.getElementById('btn-retour-types');

let pokemonsData = {};
let pokeDuTypeActuel = [];
let pokemonsTrouves = [];
let scoreActuel = 0;
let scoreMax = 0;
let typeActif = null;
let timerInterval;
let timerStarted = false;
let secondsElapsed = 0;

// Ordre et traductions exactes des types[cite: 1]
const typeConfig = {
    'water': { fr: 'Eau', color: '#6390F0' }, 'fire': { fr: 'Feu', color: '#EE8130' },
    'grass': { fr: 'Plante', color: '#7AC74C' }, 'ground': { fr: 'Sol', color: '#E2BF65' },
    'rock': { fr: 'Roche', color: '#B6A136' }, 'steel': { fr: 'Acier', color: '#B7B7CE' },
    'ice': { fr: 'Glace', color: '#96D9D6' }, 'electric': { fr: 'Électrik', color: '#F7D02C' },
    'fighting': { fr: 'Combat', color: '#C22E28' }, 'poison': { fr: 'Poison', color: '#A33EA1' },
    'psychic': { fr: 'Psy', color: '#F95587' }, 'bug': { fr: 'Insecte', color: '#A6B91A' },
    'ghost': { fr: 'Spectre', color: '#735797' }, 'dragon': { fr: 'Dragon', color: '#6F35FC' },
    'dark': { fr: 'Ténèbres', color: '#705746' }, 'fairy': { fr: 'Fée', color: '#D685AD' },
    'normal': { fr: 'Normal', color: '#A8A77A' }, 'flying': { fr: 'Vol', color: '#A98FF3' }
};

// --- INITIALISATION DU MENU ---
function creerMenuTypes() {
    typeMenu.innerHTML = "";
    for (let key in typeConfig) {
        let btn = document.createElement('button');
        btn.className = 'btn-action';
        btn.style.backgroundColor = typeConfig[key].color;
        btn.style.color = (key === 'electric' || key === 'ground' || key === 'ice' || key === 'steel' || key === 'normal') ? 'black' : 'white';
        btn.innerText = typeConfig[key].fr;
        btn.onclick = () => lancerQuizType(key);
        typeMenu.appendChild(btn);
    }
}

// --- FONCTIONNALITÉS GLOBALES ---
function formatTime(sec) { 
    return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!timerStarted && scoreActuel < scoreMax) {
        timerStarted = true;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            timerText.innerText = formatTime(secondsElapsed);
        }, 1000);
    }
}

function normaliserTexte(texte) { 
    return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase().trim(); 
}

// --- LOGIQUE DU JEU ---
async function chargerPokemonsGlobaux() {
    input.placeholder = "Chargement des données du Pokédex...";
    // Simulation d'un appel API pour récupérer la base de données 1-1025
    const reponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    const data = await reponse.json();
    
    // Simplification pour l'exemple : remplissage de pokemonsData
    data.results.forEach((poke, index) => {
        let id = index + 1;
        pokemonsData[normaliserTexte(poke.name)] = { id: id, vraiNom: poke.name };
    });
    
    input.placeholder = "Choisissez un type au-dessus pour commencer...";
    creerMenuTypes();
}

async function lancerQuizType(type) {
    typeActif = type;
    typeMenu.style.display = 'none';
    titreType.style.display = 'block';
    titreType.innerText = `Type ${typeConfig[type].fr}`;
    
    scoreContainer.style.display = 'block';
    timerContainer.style.display = 'block';
    input.disabled = false;
    input.placeholder = "Tapez un nom de Pokémon...";
    
    // Récupérer les Pokémon de ce type
    const reponse = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const data = await reponse.json();
    
    pokeDuTypeActuel = data.pokemon.map(p => {
        let parts = p.pokemon.url.split('/');
        return parseInt(parts[parts.length - 2]);
    }).filter(id => id <= 1025);
    
    // Ajout systématique d'Arceus (493) et Silvallié (773)[cite: 1]
    if (!pokeDuTypeActuel.includes(493)) pokeDuTypeActuel.push(493);
    if (!pokeDuTypeActuel.includes(773)) pokeDuTypeActuel.push(773);
    
    pokeDuTypeActuel.sort((a, b) => a - b);
    
    scoreMax = pokeDuTypeActuel.length;
    maxText.innerText = scoreMax;
    genererGrille();
}

function genererGrille() {
    grid.innerHTML = "";
    pokeDuTypeActuel.forEach(id => {
        let box = document.createElement('div');
        box.classList.add('pokemon-box-small'); // Utilisation de la classe réduite[cite: 1]
        box.id = "box-" + id;
        box.innerHTML = `<span class="numero">#${id.toString().padStart(3, '0')}</span>`;
        grid.appendChild(box);
    });
}

// Validation de la saisie (avec correctif Mew/Mewtwo)
input.addEventListener('input', (e) => {
    const texteSaisi = normaliserTexte(e.target.value);
    
    // Astuce Nidoran
    if (texteSaisi === "nidoran" && pokeDuTypeActuel.includes(29)) validerPokemon(29, "Nidoran♀");
    if (texteSaisi === "nidoran" && pokeDuTypeActuel.includes(32)) validerPokemon(32, "Nidoran♂");

    if (pokemonsData[texteSaisi]) {
        const idPokemon = pokemonsData[texteSaisi].id;
        
        // Si le pokémon appartient au type actuel et n'a PAS encore été trouvé[cite: 3]
        if (pokeDuTypeActuel.includes(idPokemon) && !pokemonsTrouves.includes(idPokemon)) {
            validerPokemon(idPokemon, pokemonsData[texteSaisi].vraiNom);
            e.target.value = ""; // Vider seulement si on valide un NOUVEAU pokémon[cite: 3]
        }
    }
});

function validerPokemon(id, vraiNom) {
    if (pokemonsTrouves.includes(id)) return;
    
    startTimer();
    pokemonsTrouves.push(id);
    scoreActuel++;
    scoreText.innerText = scoreActuel;
    
    let box = document.getElementById("box-" + id);
    box.classList.add('trouve');
    box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">
                     <span class="nom" style="font-size: 0.45rem !important; margin-top: 2px !important; color: white; font-weight: bold;">${vraiNom.toUpperCase()}</span>`; // Texte ajusté[cite: 3]
                     
    if (scoreActuel === scoreMax) {
        clearInterval(timerInterval);
        input.disabled = true;
        input.placeholder = "Félicitations, type complété !";
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

// --- BOUTONS D'ACTION ---
document.getElementById('btn-reset').addEventListener('click', () => location.reload());

if (document.getElementById('btn-retour-types')) {
    document.getElementById('btn-retour-types').addEventListener('click', () => location.reload());
}

document.getElementById('btn-ombre').addEventListener('click', () => {
    startTimer();
    pokeDuTypeActuel.forEach(id => {
        let box = document.getElementById("box-" + id);
        if (!box.classList.contains('trouve') && !box.classList.contains('rate')) {
            box.innerHTML = `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">`;
        }
    });
    document.getElementById('btn-ombre').disabled = true;
});

document.getElementById('btn-abandon').addEventListener('click', () => {
    if (confirm("Voulez-vous vraiment abandonner et révéler les réponses ?")) {
        clearInterval(timerInterval);
        input.disabled = true;
        input.placeholder = "Quiz terminé !";
        
        pokeDuTypeActuel.forEach(id => {
            if (!pokemonsTrouves.includes(id)) {
                let box = document.getElementById("box-" + id);
                box.classList.add('rate');
                box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">
                                 <span class="nom" style="font-size: 0.45rem !important; margin-top: 2px !important; color: white; font-weight: bold;">Inconnu</span>`; // Adaptation petit format[cite: 3]
            }
        });
    }
});

chargerPokemonsGlobaux();