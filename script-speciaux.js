const bgMusic = document.getElementById('bg-music'), btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;
btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; }
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

const grid = document.getElementById('pokedex-grid'), input = document.getElementById('saisie');
const scoreText = document.getElementById('score'), timerText = document.getElementById('timer'), maxText = document.getElementById('score-max');
const titreMenu = document.getElementById('titre-dynamique');
const specialMenu = document.getElementById('special-menu');
const scoreContainer = document.getElementById('score-container');
const timerContainer = document.getElementById('timer-container');
const btnRetour = document.getElementById('btn-retour-modes');

let allForms = []; // Contiendra TOUTES les formes (Base, Méga, Primo, etc.)
let pokemonsData = {}; // Répertoire de validation (Nom -> ID de l'espèce)
let pokeDuModeActuel = [];
let pokemonsTrouves = [];
let scoreActuel = 0, scoreMax = 0;
let modeActif = null; 
let timerInterval, timerStarted = false, secondsElapsed = 0;

// =========================================
// 1. CONFIGURATION DES MODES SPÉCIAUX
// =========================================
const specialConfig = {
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

for (let key in specialConfig) {
    let btn = document.createElement('button');
    btn.className = 'btn-special';
    btn.id = 'btn-special-' + key;
    btn.innerHTML = `<span>${specialConfig[key].icon}</span> <span>${specialConfig[key].titre}</span>`;
    btn.onclick = () => chargerMode(key);
    specialMenu.appendChild(btn);
}

function formatTime(sec) { return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }

function startTimer() {
    if (!timerStarted && scoreActuel < scoreMax && modeActif) {
        timerStarted = true;
        timerInterval = setInterval(() => { secondsElapsed++; timerText.innerText = formatTime(secondsElapsed); }, 1000);
    }
}

document.getElementById('btn-reset').addEventListener('click', () => { if(modeActif) chargerMode(modeActif); });

btnRetour.addEventListener('click', () => {
    modeActif = null; clearInterval(timerInterval); timerStarted = false; grid.innerHTML = '';
    titreMenu.style.display = 'none'; scoreContainer.style.display = 'none'; timerContainer.style.display = 'none'; btnRetour.style.display = 'none';
    input.disabled = true; input.placeholder = "Choisissez un mode spécial au-dessus...";
    specialMenu.style.display = 'flex';
});

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "").toLowerCase().trim(); }

// =========================================
// 2. TÉLÉCHARGEMENT DE LA BASE DE DONNÉES ENRICHIE
// =========================================
async function initialiserBaseDeDonnees() {
    input.placeholder = "Analyse des statistiques et Méga-évolutions (patiente)..."; input.disabled = true;
    
    // Requête géante : on prend TOUT (Statistiques, Poids, Taille, Rareté)
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_lte: 1025}}) { id is_legendary is_mythical pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id name weight height is_default pokemonstats { base_stat stat { name } } } } }`;
    
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(e => {
            const speciesId = e.id;
            const vraiNom = e.pokemonspeciesnames[0].name;
            const nomNormalise = normaliserTexte(vraiNom);

            // Création du dictionnaire pour la validation textuelle
            pokemonsData[nomNormalise] = speciesId;

            // Catégorisation pour le mode Légendaires
            let category = null;
            const ubs = [793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806];
            const paradoxes = [984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 1009, 1010, 1020, 1021, 1022, 1023];
            const pseudos = [149, 248, 373, 376, 445, 635, 706, 784, 887, 998];

            if (ubs.includes(speciesId)) category = "Ultra-Chimères";
            else if (paradoxes.includes(speciesId)) category = "Paradoxes";
            else if (pseudos.includes(speciesId)) category = "Pseudo-Légendaires";
            else if (e.is_mythical) category = "Fabuleux";
            else if (e.is_legendary) category = "Légendaires";

            // Enregistrement de chaque FORME du Pokémon
            e.pokemons.forEach(p => {
                let stats = {};
                p.pokemonstats.forEach(s => stats[s.stat.name] = s.base_stat);

                // Détection Méga/Primo
                let isMega = false;
                let displayName = vraiNom;
                if (p.name.includes("-mega-x")) { displayName += " (Méga X)"; isMega = true; }
                else if (p.name.includes("-mega-y")) { displayName += " (Méga Y)"; isMega = true; }
                else if (p.name.includes("-mega")) { displayName += " (Méga)"; isMega = true; }
                else if (p.name.includes("-primal")) { displayName += " (Primo)"; isMega = true; }

                allForms.push({
                    id: p.id,
                    speciesId: speciesId,
                    vraiNom: displayName,
                    isDefault: p.is_default,
                    isMega: isMega,
                    category: category,
                    weight: p.weight / 10, // Converti en Kg
                    height: p.height / 10, // Converti en Mètres
                    hp: stats['hp'],
                    atk: stats['attack'],
                    def: stats['defense'],
                    spa: stats['special-attack'],
                    spd: stats['special-defense'],
                    spe: stats['speed']
                });
            });
        });
        input.placeholder = "Choisissez un mode spécial au-dessus !";
    } catch (err) { input.placeholder = "Erreur réseau !"; }
}

// =========================================
// 3. CHARGEMENT D'UN MODE SPÉCIFIQUE
// =========================================
function chargerMode(mode) {
    modeActif = mode;
    document.querySelectorAll('.btn-special').forEach(b => b.classList.remove('actif'));
    document.getElementById('btn-special-' + mode).classList.add('actif');

    specialMenu.style.display = 'none';
    scoreContainer.style.display = 'flex';
    timerContainer.style.display = 'block';
    btnRetour.style.display = 'inline-block';

    titreMenu.innerText = specialConfig[mode].titre;
    titreMenu.style.display = 'block';

    pokemonsTrouves = []; scoreActuel = 0; secondsElapsed = 0;
    timerText.innerText = formatTime(0); clearInterval(timerInterval); timerStarted = false;
    document.getElementById('btn-ombre').disabled = false;
    grid.innerHTML = '';

    // LOGIQUE DE SÉLECTION SELON LE MODE
    if (['weight', 'height', 'atk', 'def', 'spa', 'spd', 'spe', 'hp'].includes(mode)) {
        // Trie TOUTES les formes et garde les 100 premières
        pokeDuModeActuel = [...allForms].sort((a, b) => b[mode] - a[mode]).slice(0, 100);
        
        let container = document.createElement('div');
        container.classList.add('gen-container');
        let gridSmall = document.createElement('div');
        gridSmall.classList.add('grid-small');

        pokeDuModeActuel.forEach((p, index) => {
            let box = document.createElement('div');
            box.classList.add('pokemon-box-micro');
            box.id = "box-" + p.id;
            // On affiche le classement ET la statistique secrète
            box.innerHTML = `<span class="numero">#${index + 1}</span><div class="valeur-stat">${p[mode]} ${specialConfig[mode].label}</div>`;
            gridSmall.appendChild(box);
        });
        container.appendChild(gridSmall); grid.appendChild(container);

    } else if (mode === 'mega') {
        // Mode Méga : On récupère uniquement les méga-évolutions
        pokeDuModeActuel = allForms.filter(f => f.isMega);
        
        let container = document.createElement('div');
        container.classList.add('gen-container');
        let gridSmall = document.createElement('div');
        gridSmall.classList.add('grid-small');

        pokeDuModeActuel.forEach(p => {
            let box = document.createElement('div');
            box.classList.add('pokemon-box-micro');
            box.id = "box-" + p.id;
            box.innerHTML = `<span class="numero">Méga</span>`;
            gridSmall.appendChild(box);
        });
        container.appendChild(gridSmall); grid.appendChild(container);

    } else if (mode === 'legendaires') {
        // Mode Légendaires : Uniquement les formes de base pour éviter les doublons
        pokeDuModeActuel = allForms.filter(f => f.category && f.isDefault);
        
        const ordreCategories = ["Pseudo-Légendaires", "Légendaires", "Fabuleux", "Ultra-Chimères", "Paradoxes"];
        
        ordreCategories.forEach(cat => {
            const pokeDeLaCat = pokeDuModeActuel.filter(p => p.category === cat);
            if (pokeDeLaCat.length > 0) {
                let container = document.createElement('div');
                container.classList.add('gen-container');
                container.innerHTML = `<h2 class="gen-title">${cat}</h2>`;
                let gridSmall = document.createElement('div');
                gridSmall.classList.add('grid-small');

                pokeDeLaCat.forEach(p => {
                    let box = document.createElement('div');
                    box.classList.add('pokemon-box-micro');
                    box.id = "box-" + p.id;
                    box.innerHTML = `<span class="numero">#${p.speciesId.toString().padStart(3, '0')}</span>`;
                    gridSmall.appendChild(box);
                });
                container.appendChild(gridSmall); grid.appendChild(container);
            }
        });
    }

    scoreMax = pokeDuModeActuel.length;
    scoreText.innerText = scoreActuel;
    maxText.innerText = scoreMax;
    input.placeholder = `Tapez un nom de Pokémon...`;
    input.disabled = false; input.focus();
}

function declencherVictoire() {
    new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg').play();
    let duration = 15000, end = Date.now() + duration;
    let interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({ particleCount: 50, startVelocity: 30, spread: 360, origin: { x: Math.random(), y: Math.random() } });
    }, 250);
}

// =========================================
// 4. VALIDATION INTÉLLIGENTE (Gère les Méga automatiquement !)
// =========================================
function validerForme(forme, joueurActif = true) {
    const box = document.getElementById("box-" + forme.id);
    if (!box || box.classList.contains('trouve')) return;

    box.classList.remove('rate'); 
    box.classList.add('trouve');
    scoreActuel++; scoreText.innerText = scoreActuel;
    pokemonsTrouves.push(forme.id);
    
    // Joue le cri de l'espèce de base
    if(joueurActif) {
        startTimer();
        let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${forme.speciesId}.ogg`);
        cri.volume = 0.5; cri.play().catch(e => {}); // Ignore les erreurs si audio manquant
    }
    
    // Garde la statistique affichée si on est dans un mode Top 100
    let statInfo = "";
    if (['weight', 'height', 'atk', 'def', 'spa', 'spd', 'spe', 'hp'].includes(modeActif)) {
        statInfo = `<div class="valeur-stat">${forme[modeActif]} ${specialConfig[modeActif].label}</div>`;
    }
    
    box.innerHTML = `
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${forme.id}.png">
        <span class="nom">${forme.vraiNom}</span>
        ${statInfo}
    `;
        
    if (scoreActuel === scoreMax && joueurActif) {
        clearInterval(timerInterval); input.disabled = true; input.placeholder = "INCROYABLE ! MODE COMPLÉTÉ !";
        declencherVictoire();
    }
}

input.addEventListener('input', (e) => {
    if (!modeActif) return;
    const texte = normaliserTexte(e.target.value);
    
    let targetSpeciesIds = [];
    if (texte === "nidoran") targetSpeciesIds = [29, 32];
    else if (pokemonsData[texte]) targetSpeciesIds = [pokemonsData[texte]];

    if (targetSpeciesIds.length > 0) {
        let trouveQuelqueChose = false;
        
        targetSpeciesIds.forEach(sId => {
            // On cherche TOUTES les formes de ce Pokémon présentes dans la grille actuelle !
            // Ex: Si tu tapes "Dracaufeu" dans le mode Méga, ça validera le X et le Y d'un seul coup.
            const formesAValider = pokeDuModeActuel.filter(f => f.speciesId === sId);
            
            formesAValider.forEach(forme => {
                if (!pokemonsTrouves.includes(forme.id)) {
                    validerForme(forme, true);
                    trouveQuelqueChose = true;
                }
            });
        });

        if (trouveQuelqueChose) e.target.value = "";
    }
});

// ACTIONS OMBRE ET ABANDON
document.getElementById('btn-ombre').addEventListener('click', () => {
    if (pokeDuModeActuel.length === 0) return;
    startTimer();
    pokeDuModeActuel.forEach(p => {
        let box = document.getElementById("box-" + p.id);
        if (!box.classList.contains('trouve') && !box.classList.contains('rate')) {
            let infoSup = ['weight', 'height', 'atk', 'def', 'spa', 'spd', 'spe', 'hp'].includes(modeActif) ? `<div class="valeur-stat">${p[modeActif]} ${specialConfig[modeActif].label}</div>` : `<span class="numero">#${p.speciesId.toString().padStart(3, '0')}</span>`;
            box.innerHTML = `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png">${infoSup}`;
        }
    });
    document.getElementById('btn-ombre').disabled = true;
});

document.getElementById('btn-abandon').addEventListener('click', () => {
    if (pokeDuModeActuel.length === 0) return;
    if (confirm(`Voulez-vous vraiment abandonner le mode ${specialConfig[modeActif].titre} ?`)) {
        clearInterval(timerInterval); 
        input.disabled = true; input.placeholder = "Quiz terminé !";
        
        pokeDuModeActuel.forEach(p => {
            if (!pokemonsTrouves.includes(p.id)) {
                let box = document.getElementById("box-" + p.id);
                box.classList.add('rate'); 
                
                let statInfo = ['weight', 'height', 'atk', 'def', 'spa', 'spd', 'spe', 'hp'].includes(modeActif) ? `<div class="valeur-stat">${p[modeActif]} ${specialConfig[modeActif].label}</div>` : '';
                box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png"><span class="nom">${p.vraiNom}</span>${statInfo}`;
            }
        });
    }
});

initialiserBaseDeDonnees();