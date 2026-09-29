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
const timerText = document.getElementById('timer');
const titreMenu = document.getElementById('titre-dynamique');
const specialMenu = document.getElementById('special-menu');
const scoreContainer = document.getElementById('score-container');
const timerContainer = document.getElementById('timer-container');

let pokemonsData = {};
let pokeDuModeActuel = [];
let pokemonsTrouves = [];
let scoreActuel = 0, scoreMax = 0;
let timerInterval, timerStarted = false, secondsElapsed = 0;

// Configuration des modes spéciaux incluant BST et Favoris[cite: 1]
const specialConfig = {
    'bst': { titre: 'Top 100 Bases Stats Totales', icon: '🌟', label: 'BST' },
    'favoris': { titre: 'Top 100 Pokémon Préférés', icon: '⭐', label: 'Votes' },
    'weight': { titre: 'Top 100 Plus Lourds', icon: '⚖️', label: 'kg' },
    'height': { titre: 'Top 100 Plus Grands', icon: '📏', label: 'm' },
    'atk': { titre: 'Top 100 Attaque', icon: '⚔️', label: 'ATK' },
    'spa': { titre: 'Top 100 Attaque Spéciale', icon: '🔮', label: 'ATK SPÉ' },
    'def': { titre: 'Top 100 Défense', icon: '🛡️', label: 'DEF' },
    'spd': { titre: 'Top 100 Défense Spéciale', icon: '✨', label: 'DEF SPÉ' },
    'spe': { titre: 'Top 100 Vitesse', icon: '🏃', label: 'VIT' },
    'hp': { titre: 'Top 100 PV', icon: '❤️', label: 'PV' },
    'mega': { titre: 'Méga-Évolutions', icon: '🧬', label: '' },
    'legendaires': { titre: 'Légendaires & Raretés', icon: '👑', label: '' }
};

// Le classement officiel du "Pokémon of the Year 2020" par Google[cite: 1]
const top100FavorisIDs = [
    658, 448, 778, 6, 197, 282, 445, 384, 112, 94,
    254, 248, 1, 157, 249, 130, 25, 133, 405, 190,
    150, 4, 385, 393, 260, 143, 212, 149, 257, 196,
    155, 158, 253, 3, 280, 722, 131, 381, 700, 395,
    380, 258, 250, 653, 330, 350, 483, 373, 471, 151,
    160, 493, 444, 390, 484, 134, 724, 706, 9, 255,
    491, 136, 152, 609, 392, 470, 7, 715, 478, 135,
    468, 78, 403, 39, 63, 612, 702, 635, 230, 386,
    214, 53, 5, 26, 497, 655, 461, 334, 447, 494,
    479, 744, 681, 245, 144, 460, 169, 175, 430, 10
];

// --- INITIALISATION DU MENU ---
function formatTime(sec) { 
    return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!timerStarted && scoreActuel < scoreMax) {
        timerStarted = true;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            if(document.getElementById('timer')) document.getElementById('timer').innerText = formatTime(secondsElapsed);
        }, 1000);
    }
}

function normaliserTexte(texte) { 
    return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase().trim(); 
}

// Variables pour le Blind Test
let pokemonMystereBT = null;
let audioCri = new Audio();

async function chargerPokemonsGlobaux() {
    const reponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    const data = await reponse.json();
    data.results.forEach((poke, index) => {
        let id = index + 1;
        pokemonsData[normaliserTexte(poke.name)] = { id: id, vraiNom: poke.name };
    });
}

// Fonction de lancement des modes Statistiques
window.lancerQuizStat = function(modeStr, titreCustom) {
    document.getElementById('special-menu').style.display = 'none';
    document.getElementById('stats-container').style.display = 'block';
    document.getElementById('titre-stat-choisi').innerText = titreCustom;
    
    scoreMax = 100; // Ou la longueur de ta liste
    document.getElementById('score').innerText = "0";
    
    input.disabled = false;
    input.placeholder = "Tapez un nom de Pokémon...";
    input.id = "saisie-stat"; // On change l'ID pour ne pas cibler la mauvaise barre

    // Ici tu chargerais tes requêtes API pour trier les 100 plus lourds/rapides
    // (Simplifié ici pour l'intégration de la structure)
    pokeDuModeActuel = top100FavorisIDs; 
    
    grid.innerHTML = "";
    pokeDuModeActuel.forEach(id => {
        let box = document.createElement('div');
        box.classList.add('pokemon-box-small');
        box.id = "box-" + id;
        box.innerHTML = `<span class="numero">#${id.toString().padStart(3, '0')}</span>`;
        grid.appendChild(box);
    });
}

// Lancement spécifique du Blind Test
window.lancerBlindTest = function() {
    document.getElementById('special-menu').style.display = 'none';
    document.getElementById('blind-test-container').style.display = 'block';
    nouveauPokemonBlindTest();
}

function nouveauPokemonBlindTest() {
    const idAleatoire = Math.floor(Math.random() * 1025) + 1;
    pokemonMystereBT = idAleatoire;
    audioCri.src = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${idAleatoire}.ogg`;
    
    document.getElementById('bt-resultat').innerHTML = "";
    const barreSaisieBT = document.getElementById('saisie-bt');
    barreSaisieBT.value = "";
    barreSaisieBT.disabled = false;
    barreSaisieBT.placeholder = "Qui est-ce ?";
    barreSaisieBT.focus();
}

// Gestion des saisies spécifiques au mode Stats
document.addEventListener('input', (e) => {
    if(e.target.id === 'saisie-stat') {
        const texteSaisi = normaliserTexte(e.target.value);
        if (pokemonsData[texteSaisi]) {
            const idPokemon = pokemonsData[texteSaisi].id;
            // Correction Mew/Mewtwo : on ne vide que si nouveau ![cite: 3]
            if (pokeDuModeActuel.includes(idPokemon) && !pokemonsTrouves.includes(idPokemon)) {
                validerStatPokemon(idPokemon, pokemonsData[texteSaisi].vraiNom);
                e.target.value = ""; 
            }
        }
    }
    else if(e.target.id === 'saisie-bt') {
        const texteSaisi = normaliserTexte(e.target.value);
        if (pokemonsData[texteSaisi] && pokemonsData[texteSaisi].id === pokemonMystereBT) {
            validerBlindTest(pokemonsData[texteSaisi].vraiNom);
            e.target.value = ""; 
        }
    }
});

function validerStatPokemon(id, vraiNom) {
    if (pokemonsTrouves.includes(id)) return;
    startTimer();
    pokemonsTrouves.push(id);
    scoreActuel++;
    document.getElementById('score').innerText = scoreActuel;
    
    let box = document.getElementById("box-" + id);
    if(box) {
        box.classList.add('trouve');
        box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">
                         <span class="nom" style="font-size: 0.45rem !important; margin-top: 2px !important; color: white; font-weight: bold;">${vraiNom.toUpperCase()}</span>`; // Taille ajustée[cite: 3]
    }
}

function validerBlindTest(vraiNom) {
    scoreActuel++;
    document.getElementById('bt-score').innerText = scoreActuel;
    document.getElementById('saisie-bt').disabled = true;
    
    const resultat = document.getElementById('bt-resultat');
    resultat.innerHTML = `
        <h2 style="color:#2ecc71;">Bravo ! C'était bien ${vraiNom.toUpperCase()} !</h2>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonMystereBT}.png" style="width:150px; height:150px;">
        <button class="btn-action" onclick="nouveauPokemonBlindTest()" style="margin-top:15px;">Pokémon Suivant ➡️</button>
    `;
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

// --- ÉVÉNEMENTS BOUTONS ---
if(document.getElementById('btn-play-sound')) {
    document.getElementById('btn-play-sound').addEventListener('click', () => audioCri.play());
}

if(document.getElementById('btn-retour-speciaux')) {
    document.getElementById('btn-retour-speciaux').addEventListener('click', () => location.reload());
}
if(document.getElementById('btn-retour-speciaux-stat')) {
    document.getElementById('btn-retour-speciaux-stat').addEventListener('click', () => location.reload());
}
if(document.getElementById('btn-reset-stat')) {
    document.getElementById('btn-reset-stat').addEventListener('click', () => location.reload());
}

// Abandon et Ombre mode Stats
if(document.getElementById('btn-ombre')) {
    document.getElementById('btn-ombre').addEventListener('click', () => {
        startTimer();
        pokeDuModeActuel.forEach(id => {
            let box = document.getElementById("box-" + id);
            if (box && !box.classList.contains('trouve') && !box.classList.contains('rate')) {
                box.innerHTML = `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">`;
            }
        });
        document.getElementById('btn-ombre').disabled = true;
    });
}

if(document.getElementById('btn-abandon')) {
    document.getElementById('btn-abandon').addEventListener('click', () => {
        if (confirm("Voulez-vous vraiment abandonner et révéler les réponses ?")) {
            clearInterval(timerInterval);
            document.getElementById('saisie-stat').disabled = true;
            document.getElementById('saisie-stat').placeholder = "Quiz terminé !";
            
            pokeDuModeActuel.forEach(id => {
                if (!pokemonsTrouves.includes(id)) {
                    let box = document.getElementById("box-" + id);
                    if(box) {
                        box.classList.add('rate');
                        box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">
                                         <span class="nom" style="font-size: 0.45rem !important; margin-top: 2px !important; color: white; font-weight: bold;">Inconnu</span>`; // Taille ajustée[cite: 3]
                    }
                }
            });
        }
    });
}

chargerPokemonsGlobaux();