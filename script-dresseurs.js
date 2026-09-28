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

let allPokemons = []; 
let pokemonsData = {}; 
let equipeActuelle = []; 
let pokemonsTrouves = 0;
let scoreMax = 0;
let regionActive = null; 
let timerInterval, timerStarted = false, secondsElapsed = 0;

// =========================================
// 1. LE DICTIONNAIRE DES DRESSEURS (Toutes les versions incluses !)
// =========================================
const bddDresseurs = {
    'gen1': [
        {
            nom: "Pierre (Argenta)",
            sprite: "pierre.png", // Image à héberger toi-même
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF / Let's Go", pokemons: [74, 95] }, // Racaillou, Onix
            ]
        },
        {
            nom: "Ondine (Azuria)",
            sprite: "ondine.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF / Let's Go", pokemons: [120, 121] }, // Stari, Staross
            ]
        },
        {
            nom: "Major Bob (Carmin sur Mer)",
            sprite: "bob.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [100, 25, 26] }, // Voltorbe, Pikachu, Raichu
                { nom: "Pokémon Jaune", pokemons: [26] }, // Raichu
                { nom: "Let's Go Pikachu / Évoli", pokemons: [100, 81, 26] } // Voltorbe, Magnéti, Raichu
            ]
        },
        {
            nom: "Érika (Céladopole)",
            sprite: "erika.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [71, 114, 45] }, // Empiflor, Saquedeneu, Rafflesia
                { nom: "Pokémon Jaune", pokemons: [70, 114, 44] }, // Boustiflor, Saquedeneu, Ortide
                { nom: "Let's Go Pikachu / Évoli", pokemons: [114, 71, 45] } // Saquedeneu, Empiflor, Rafflesia
            ]
        },
        {
            nom: "Koga (Parmanie)",
            sprite: "koga.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [109, 89, 109, 110] }, // Smogo, Grotadmorv, Smogo, Smogogo
                { nom: "Pokémon Jaune", pokemons: [48, 48, 48, 49] }, // Mimitoss x3, Aéromite
                { nom: "Let's Go Pikachu / Évoli", pokemons: [110, 89, 42, 49] } // Smogogo, Grotadmorv, Nosferalto, Aéromite
            ]
        },
        {
            nom: "Morgiane (Safrania)",
            sprite: "morgiane.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [64, 122, 49, 65] }, // Kadabra, M. Mime, Aéromite, Alakazam
                { nom: "Pokémon Jaune", pokemons: [63, 64, 65] }, // Abra, Kadabra, Alakazam
                { nom: "Let's Go Pikachu / Évoli", pokemons: [122, 80, 124, 65] } // M. Mime, Flagadoss, Lippoutou, Alakazam
            ]
        },
        {
            nom: "Auguste (Cramois'Île)",
            sprite: "auguste.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [58, 77, 78, 59] }, // Caninos, Ponyta, Galopa, Arcanin
                { nom: "Pokémon Jaune", pokemons: [38, 78, 59] }, // Feunard, Galopa, Arcanin
                { nom: "Let's Go Pikachu / Évoli", pokemons: [126, 78, 38, 59] } // Magmar, Galopa, Feunard, Arcanin
            ]
        },
        {
            nom: "Giovanni (Jadielle)",
            sprite: "giovanni.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [111, 51, 31, 34, 112] }, // Rhinocorne, Triopikeur, Nidoqueen, Nidoking, Rhinoféros
                { nom: "Pokémon Jaune", pokemons: [51, 53, 31, 34, 112] }, // Triopikeur, Persian, Nidoqueen, Nidoking, Rhinoféros
                { nom: "Let's Go Pikachu / Évoli", pokemons: [51, 31, 34, 112] } // Triopikeur, Nidoqueen, Nidoking, Rhinoféros
            ]
        },
        // --- CONSEIL 4 ---
        {
            nom: "Olga (Conseil 4)",
            sprite: "olga.png",
            equipes: [
                { nom: "Toutes Versions Confondues", pokemons: [87, 91, 80, 124, 131] } // Lamantine, Crustabri, Flagadoss, Lippoutou, Lokhlass
            ]
        },
        {
            nom: "Aldo (Conseil 4)",
            sprite: "aldo.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / Jaune / RFVF", pokemons: [95, 107, 106, 95, 68] }, // Onix, Tygnon, Kicklee, Onix, Mackogneur
                { nom: "Let's Go Pikachu / Évoli", pokemons: [95, 106, 107, 62, 68] } // Onix, Kicklee, Tygnon, Tartard, Mackogneur
            ]
        },
        {
            nom: "Agatha (Conseil 4)",
            sprite: "agatha.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / Jaune / RFVF", pokemons: [94, 42, 93, 24, 94] }, // Ectoplasma, Nosferalto, Spectrum, Arbok, Ectoplasma
                { nom: "Let's Go Pikachu / Évoli", pokemons: [24, 94, 42, 110, 94] } // Arbok, Ectoplasma, Nosferalto, Smogogo, Ectoplasma
            ]
        },
        {
            nom: "Peter (Conseil 4)",
            sprite: "peter.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / Jaune / RFVF", pokemons: [130, 148, 148, 142, 149] }, // Léviator, Draco x2, Ptéra, Dracolosse
                { nom: "Let's Go Pikachu / Évoli", pokemons: [117, 142, 130, 6, 149] } // Hypocéan, Ptéra, Léviator, Dracaufeu, Dracolosse
            ]
        },
        // --- RIVAUX ---
        {
            nom: "Blue / Trace (Maître de la Ligue)",
            sprite: "blue.png",
            equipes: [
                { nom: "Rouge / Bleu / RFVF (Starter Plante)", pokemons: [18, 65, 112, 103, 130, 3] }, // Florizarre
                { nom: "Rouge / Bleu / RFVF (Starter Feu)", pokemons: [18, 65, 112, 103, 130, 6] }, // Dracaufeu
                { nom: "Rouge / Bleu / RFVF (Starter Eau)", pokemons: [18, 65, 112, 103, 59, 9] }, // Tortank
                { nom: "Jaune (Starter Évoli - Aquali)", pokemons: [28, 65, 38, 103, 112, 134] }, // Aquali
                { nom: "Jaune (Starter Évoli - Voltali)", pokemons: [28, 65, 91, 103, 112, 135] }, // Voltali
                { nom: "Jaune (Starter Évoli - Pyroli)", pokemons: [28, 65, 91, 103, 112, 136] }, // Pyroli
                { nom: "Let's Go (Trace - Starter Évoli)", pokemons: [18, 78, 80, 105, 143, 135] }, // Voltali (Trace)
                { nom: "Let's Go (Trace - Starter Pikachu)", pokemons: [18, 78, 80, 105, 143, 136] } // Raichu Alola / Pyroli (Trace)
            ]
        }
    ]
};

// =========================================
// 2. LOGIQUE GLOBALE
// =========================================
function formatTime(sec) { return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }

function startTimer() {
    if (!timerStarted && pokemonsTrouves < scoreMax) {
        timerStarted = true;
        timerInterval = setInterval(() => { secondsElapsed++; timerText.innerText = formatTime(secondsElapsed); }, 1000);
    }
}

document.getElementById('btn-reset').addEventListener('click', () => { if(regionActive) lancerQuizDresseurs(regionActive); });

btnRetour.addEventListener('click', () => {
    regionActive = null; clearInterval(timerInterval); timerStarted = false; grid.innerHTML = '';
    titreMenu.style.display = 'none'; scoreContainer.style.display = 'none'; timerContainer.style.display = 'none'; btnRetour.style.display = 'none';
    input.disabled = true; input.placeholder = "Choisissez une génération de dresseurs au-dessus...";
    specialMenu.style.display = 'flex';
});

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[- ]/g, "").toLowerCase().trim(); }

// =========================================
// 3. TÉLÉCHARGEMENT DES DONNÉES (Pour avoir les Types)
// =========================================
async function initialiserBaseDeDonnees() {
    input.placeholder = "Chargement du Pokédex (patiente)..."; input.disabled = true;
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_lte: 1025}}) { id name pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id is_default pokemontypes { type { name } } } } }`;
    
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(e => {
            const vraiNom = e.pokemonspeciesnames[0].name;
            const nomNormalise = normaliserTexte(vraiNom);

            // On cherche les types de sa forme de base
            let types = [];
            let defaultForm = e.pokemons.find(p => p.is_default);
            if(defaultForm) {
                defaultForm.pokemontypes.forEach(pt => types.push(pt.type.name));
            }

            allPokemons[e.id] = { id: e.id, vraiNom: vraiNom, types: types };
            pokemonsData[nomNormalise] = e.id;
        });

        input.placeholder = "Choisissez une région de dresseurs au-dessus !";
    } catch (err) { input.placeholder = "Erreur réseau !"; }
}

// =========================================
// 4. LANCEMENT DU QUIZ DRESSEUR
// =========================================
function lancerQuizDresseurs(regionKey) {
    regionActive = regionKey;
    specialMenu.style.display = 'none';
    scoreContainer.style.display = 'flex';
    timerContainer.style.display = 'block';
    btnRetour.style.display = 'inline-block';

    const titreRegion = regionKey === 'gen1' ? 'Génération 1 (Kanto)' : 'Génération Inconnue';
    titreMenu.innerText = `Dresseurs : ${titreRegion}`;
    titreMenu.style.display = 'block';

    pokemonsTrouves = 0; scoreMax = 0; secondsElapsed = 0;
    timerText.innerText = formatTime(0); clearInterval(timerInterval); timerStarted = false;
    document.getElementById('btn-ombre').disabled = false;
    grid.innerHTML = '';
    equipeActuelle = [];

    const dresseursList = bddDresseurs[regionKey];
    let uniqueIdCounter = 0; 

    dresseursList.forEach(dresseur => {
        let section = document.createElement('div');
        section.className = 'dresseur-section';

        section.innerHTML = `
            <div class="dresseur-header">
                <img src="${dresseur.sprite}" alt="${dresseur.nom}" onerror="this.src='logo.jpeg'">
                <h2>${dresseur.nom}</h2>
            </div>
        `;

        dresseur.equipes.forEach(equipe => {
            let pContainer = document.createElement('div');
            
            if (dresseur.equipes.length > 1) {
                let titreEquipe = document.createElement('div');
                titreEquipe.className = 'equipe-titre';
                titreEquipe.innerText = `➤ ${equipe.nom}`;
                pContainer.appendChild(titreEquipe);
            }

            let gridSmall = document.createElement('div');
            gridSmall.className = 'grid-small';
            gridSmall.style.marginBottom = "15px";

            equipe.pokemons.forEach(pokeId => {
                uniqueIdCounter++;
                const htmlId = `box-dresseur-${uniqueIdCounter}`;
                const pokeInfo = allPokemons[pokeId];
                
                scoreMax++;
                equipeActuelle.push({ htmlId: htmlId, pokeId: pokeId, trouve: false });

                let box = document.createElement('div');
                box.className = 'pokemon-box-special';
                box.id = htmlId;

                // Affichage des types en guise d'indice
                let typeHtml = `<div class="types-inconnus">`;
                pokeInfo.types.forEach(t => {
                    typeHtml += `<img src="https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/${t}.svg" alt="${t}">`;
                });
                typeHtml += `</div>`;

                box.innerHTML = typeHtml;
                gridSmall.appendChild(box);
            });

            pContainer.appendChild(gridSmall);
            section.appendChild(pContainer);
        });

        grid.appendChild(section);
    });

    scoreText.innerText = pokemonsTrouves;
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
// 5. VALIDATION GLOBALE
// =========================================
function validerEquipePokemon(pokeIdCible) {
    let trouveQuelqueChose = false;

    equipeActuelle.forEach(slot => {
        if (slot.pokeId === pokeIdCible && !slot.trouve) {
            slot.trouve = true;
            trouveQuelqueChose = true;
            pokemonsTrouves++;

            const box = document.getElementById(slot.htmlId);
            box.classList.add('trouve');
            
            const pokeInfo = allPokemons[pokeIdCible];
            box.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeIdCible}.png">
                <span class="nom">${pokeInfo.vraiNom}</span>
            `;
        }
    });

    if (trouveQuelqueChose) {
        scoreText.innerText = pokemonsTrouves;
        startTimer();
        let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokeIdCible}.ogg`);
        cri.volume = 0.5; cri.play().catch(e => {});

        if (pokemonsTrouves === scoreMax) {
            clearInterval(timerInterval); input.disabled = true; input.placeholder = "INCROYABLE ! KANTO COMPLÉTÉ !";
            declencherVictoire();
        }
    }

    return trouveQuelqueChose;
}

input.addEventListener('input', (e) => {
    if (!regionActive) return;
    const texte = normaliserTexte(e.target.value);
    
    let pokeIdCible = null;
    if (texte === "nidoran") pokeIdCible = 32; 
    else if (pokemonsData[texte]) pokeIdCible = pokemonsData[texte];

    if (pokeIdCible) {
        const cEstValide = validerEquipePokemon(pokeIdCible);
        if (cEstValide) e.target.value = "";
    }
});

// ACTIONS OMBRE ET ABANDON
document.getElementById('btn-ombre').addEventListener('click', () => {
    if (equipeActuelle.length === 0) return;
    startTimer();
    equipeActuelle.forEach(slot => {
        if (!slot.trouve) {
            const box = document.getElementById(slot.htmlId);
            box.innerHTML = `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${slot.pokeId}.png">`;
        }
    });
    document.getElementById('btn-ombre').disabled = true;
});

document.getElementById('btn-abandon').addEventListener('click', () => {
    if (equipeActuelle.length === 0) return;
    if (confirm(`Voulez-vous vraiment abandonner la région ${regionActive} ?`)) {
        clearInterval(timerInterval); 
        input.disabled = true; input.placeholder = "Quiz terminé !";
        
        equipeActuelle.forEach(slot => {
            if (!slot.trouve) {
                const box = document.getElementById(slot.htmlId);
                box.classList.add('rate'); 
                const pokeInfo = allPokemons[slot.pokeId];
                box.innerHTML = `
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${slot.pokeId}.png">
                    <span class="nom">${pokeInfo.vraiNom}</span>
                `;
            }
        });
    }
});

initialiserBaseDeDonnees();