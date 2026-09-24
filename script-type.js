const bgMusic = document.getElementById('bg-music'), btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;
btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; }
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

const grid = document.getElementById('pokedex-grid'), input = document.getElementById('saisie');
const scoreText = document.getElementById('score'), timerText = document.getElementById('timer'), maxText = document.getElementById('score-max');

let allPokemons = []; // Stockera les 1025 Pokémon avec leurs types
let pokemonsTrouves = [];
let scoreActuel = 0, scoreMax = 0;
let typeActif = 'fire'; // Type par défaut au lancement
let timerInterval, timerStarted = false, secondsElapsed = 0;
let intervalsFormes = {}; // Pour gérer les clignotements des formes

// Configuration officielle des 18 types (Couleurs et traductions)
const typeConfig = {
    'normal': { fr: 'Normal', color: '#A8A77A' }, 'fire': { fr: 'Feu', color: '#EE8130' },
    'water': { fr: 'Eau', color: '#6390F0' }, 'electric': { fr: 'Électrik', color: '#F7D02C' },
    'grass': { fr: 'Plante', color: '#7AC74C' }, 'ice': { fr: 'Glace', color: '#96D9D6' },
    'fighting': { fr: 'Combat', color: '#C22E28' }, 'poison': { fr: 'Poison', color: '#A33EA1' },
    'ground': { fr: 'Sol', color: '#E2BF65' }, 'flying': { fr: 'Vol', color: '#A98FF3' },
    'psychic': { fr: 'Psy', color: '#F95587' }, 'bug': { fr: 'Insecte', color: '#A6B91A' },
    'rock': { fr: 'Roche', color: '#B6A136' }, 'ghost': { fr: 'Spectre', color: '#735797' },
    'dragon': { fr: 'Dragon', color: '#6F35FC' }, 'dark': { fr: 'Ténèbres', color: '#705746' },
    'steel': { fr: 'Acier', color: '#B7B7CE' }, 'fairy': { fr: 'Fée', color: '#D685AD' }
};

// 1. GÉNÉRATION DES BOUTONS DE TYPES
const typeMenu = document.getElementById('type-menu');
for (let key in typeConfig) {
    let btn = document.createElement('button');
    btn.className = 'btn-type';
    btn.id = 'btn-type-' + key;
    btn.style.backgroundColor = typeConfig[key].color;
    // On utilise les icônes officielles au format SVG (haute qualité)
    btn.innerHTML = `<img src="https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/${key}.svg" alt="${typeConfig[key].fr}"> ${typeConfig[key].fr}`;
    btn.onclick = () => chargerType(key);
    typeMenu.appendChild(btn);
}

function formatTime(sec) { return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }

function startTimer() {
    if (!timerStarted && scoreActuel < scoreMax) {
        timerStarted = true;
        timerInterval = setInterval(() => { secondsElapsed++; timerText.innerText = formatTime(secondsElapsed); localStorage.setItem('timerType_' + typeActif, secondsElapsed); }, 1000);
    }
}

window.addEventListener('beforeunload', (e) => { if (scoreActuel > 0 && scoreActuel < scoreMax) { e.preventDefault(); e.returnValue = ''; } });
document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm(`Voulez-vous vraiment effacer votre sauvegarde du type ${typeConfig[typeActif].fr} ?`)) {
        localStorage.removeItem('sauvegardeType_' + typeActif); localStorage.removeItem('timerType_' + typeActif);
        location.reload();
    }
});

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "").toLowerCase().trim(); }

// 2. FONCTION POUR CHANGER DE TYPE
function chargerType(type) {
    typeActif = type;
    
    // Met en surbrillance le bouton sélectionné
    document.querySelectorAll('.btn-type').forEach(b => b.classList.remove('actif'));
    document.getElementById('btn-type-' + type).classList.add('actif');
    
    // Arrête tous les clignotements d'images du type précédent
    Object.values(intervalsFormes).forEach(clearInterval);
    intervalsFormes = {};

    // Charge la sauvegarde et le timer SPÉCIFIQUES à ce type
    pokemonsTrouves = JSON.parse(localStorage.getItem('sauvegardeType_' + type)) || [];
    secondsElapsed = parseInt(localStorage.getItem('timerType_' + type)) || 0;
    timerText.innerText = formatTime(secondsElapsed);
    clearInterval(timerInterval); timerStarted = false;

    // Filtre les Pokémon qui possèdent ce type (même via une forme d'Alola/Galar !)
    const pokeDuType = allPokemons.filter(p => p.types.includes(type));
    scoreMax = pokeDuType.length;
    scoreActuel = pokemonsTrouves.length;
    scoreText.innerText = scoreActuel;
    maxText.innerText = scoreMax;

    grid.innerHTML = '';
    
    // Dessine les 9 blocs de génération pour le type sélectionné
    for (let gen = 1; gen <= 9; gen++) {
        const pokeDeCetteGen = pokeDuType.filter(p => p.generation === gen);
        if (pokeDeCetteGen.length > 0) {
            let container = document.createElement('div');
            container.classList.add('gen-container');
            container.innerHTML = `<h2 class="gen-title">Génération ${gen}</h2>`;
            let gridSmall = document.createElement('div');
            gridSmall.classList.add('grid-small');

            pokeDeCetteGen.forEach(p => {
                let box = document.createElement('div');
                box.classList.add('pokemon-box-small');
                box.id = "box-" + p.id;
                
                if (pokemonsTrouves.includes(p.id)) {
                    // Si le Pokémon était déjà trouvé dans la sauvegarde
                    box.classList.add('trouve');
                    box.innerHTML = `<img id="img-${p.id}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png"><span class="nom" style="font-size: 0.45rem !important; margin-top: 2px !important; color: white; font-weight: bold;">${p.vraiNom}</span>`;
                    setupFormes(p);
                } else {
                    box.innerHTML = `<span class="numero">#${p.id.toString().padStart(3, '0')}</span>`;
                }
                gridSmall.appendChild(box);
            });
            container.appendChild(gridSmall); grid.appendChild(container);
        }
    }
    input.placeholder = `Tapez un nom de Pokémon de type ${typeConfig[type].fr}...`;
    input.disabled = false; input.focus();
}

function setupFormes(p) {
    if (p.formes.length > 1) {
        let index = 0;
        intervalsFormes[p.id] = setInterval(() => {
            let img = document.getElementById(`img-${p.id}`);
            if (img) { index = (index + 1) % p.formes.length; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.formes[index]}.png`; }
        }, 10000);
    }
}

// 3. TÉLÉCHARGEMENT INITIAL DE LA BASE DE DONNÉES
async function initialiserBaseDeDonnees() {
    input.placeholder = "Analyse des types des 1025 Pokémon (patiente)..."; input.disabled = true;
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_lte: 1025}}) { id name generation_id pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id pokemontypes { type { name } } } } }`;
    
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(e => {
            let typesSet = new Set();
            // On récupère TOUS les types du Pokémon (y compris ceux de ses méga-évolutions ou formes régionales)
            e.pokemons.forEach(p => p.pokemontypes.forEach(pt => typesSet.add(pt.type.name)));
            
            allPokemons.push({
                id: e.id, generation: e.generation_id,
                nomAnglais: normaliserTexte(e.name), nomFrancais: normaliserTexte(e.pokemonspeciesnames[0].name),
                vraiNom: e.pokemonspeciesnames[0].name,
                formes: e.pokemons.map(p => p.id), types: Array.from(typesSet)
            });
        });

        // Une fois téléchargé, on lance automatiquement l'affichage du type "Feu" pour commencer
        chargerType('fire');
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

// 4. ÉCOUTE DE LA SAISIE
input.addEventListener('input', (e) => {
    const texte = normaliserTexte(e.target.value);
    // On cherche le Pokémon dans la liste globale
    const p = allPokemons.find(poke => poke.nomAnglais === texte || poke.nomFrancais === texte);

    // S'il existe, qu'il est du type actuellement sélectionné, et qu'on ne l'a pas encore trouvé
    if (p && p.types.includes(typeActif) && !pokemonsTrouves.includes(p.id)) {
        pokemonsTrouves.push(p.id);
        scoreActuel++; scoreText.innerText = scoreActuel;
        localStorage.setItem('sauvegardeType_' + typeActif, JSON.stringify(pokemonsTrouves));
        
        startTimer();
        let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${p.id}.ogg`);
        cri.volume = 0.5; cri.play();
        
        let box = document.getElementById("box-" + p.id);
        box.classList.add('trouve');
        box.innerHTML = `<img id="img-${p.id}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png"><span class="nom" style="font-size: 0.45rem !important; margin-top: 2px !important; color: white; font-weight: bold;">${p.vraiNom}</span>`;
        setupFormes(p);

        if (scoreActuel === scoreMax) { clearInterval(timerInterval); input.disabled = true; input.placeholder = "INCROYABLE ! VOUS AVEZ FINI CE TYPE !"; declencherVictoire(); }
        e.target.value = "";
    }
});

initialiserBaseDeDonnees();