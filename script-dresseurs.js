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
// 1. LE DICTIONNAIRE DES DRESSEURS (Kanto + Johto)
// =========================================
const bddDresseurs = {
    'gen1': [
        {
            nom: "Pierre (Argenta)",
            sprite: "pierre.png", 
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF / Let's Go", pokemons: [74, 95] }, 
            ]
        },
        {
            nom: "Ondine (Azuria)",
            sprite: "ondine.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF / Let's Go", pokemons: [120, 121] }, 
            ]
        },
        {
            nom: "Major Bob (Carmin sur Mer)",
            sprite: "bob.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [100, 25, 26] }, 
                { nom: "Pokémon Jaune", pokemons: [26] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [100, 81, 26] } 
            ]
        },
        {
            nom: "Érika (Céladopole)",
            sprite: "erika.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [71, 114, 45] }, 
                { nom: "Pokémon Jaune", pokemons: [70, 114, 44] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [114, 71, 45] } 
            ]
        },
        {
            nom: "Koga (Parmanie)",
            sprite: "koga.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [109, 89, 109, 110] }, 
                { nom: "Pokémon Jaune", pokemons: [48, 48, 48, 49] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [110, 89, 42, 49] } 
            ]
        },
        {
            nom: "Morgane (Safrania)",
            sprite: "morgane.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [64, 122, 49, 65] }, 
                { nom: "Pokémon Jaune", pokemons: [63, 64, 65] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [122, 80, 124, 65] } 
            ]
        },
        {
            nom: "Auguste (Cramois'Île)",
            sprite: "auguste.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [58, 77, 78, 59] }, 
                { nom: "Pokémon Jaune", pokemons: [38, 78, 59] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [126, 78, 38, 59] } 
            ]
        },
        {
            nom: "Giovanni (Jadielle)",
            sprite: "giovanni.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [111, 51, 31, 34, 112] }, 
                { nom: "Pokémon Jaune", pokemons: [51, 53, 31, 34, 112] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [51, 31, 34, 112] } 
            ]
        },
        // --- CONSEIL 4 KANTO ---
        {
            nom: "Olga (Conseil 4)",
            sprite: "olga.png",
            equipes: [
                { nom: "Toutes Versions Confondues", pokemons: [87, 91, 80, 124, 131] } 
            ]
        },
        {
            nom: "Aldo (Conseil 4)",
            sprite: "aldo.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / Jaune / RFVF", pokemons: [95, 107, 106, 95, 68] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [95, 106, 107, 62, 68] } 
            ]
        },
        {
            nom: "Agatha (Conseil 4)",
            sprite: "agatha.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / Jaune / RFVF", pokemons: [94, 42, 93, 24, 94] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [24, 94, 42, 110, 94] } 
            ]
        },
        {
            nom: "Peter (Conseil 4)",
            sprite: "peter.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / Jaune / RFVF", pokemons: [130, 148, 148, 142, 149] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [117, 142, 130, 6, 149] } 
            ]
        },
        {
            nom: "Blue / Trace (Maître de la Ligue)",
            sprite: "blue.png",
            equipes: [
                { nom: "Rouge / Bleu / RFVF (Starter Plante)", pokemons: [18, 65, 112, 103, 130, 3] }, 
                { nom: "Rouge / Bleu / RFVF (Starter Feu)", pokemons: [18, 65, 112, 103, 130, 6] }, 
                { nom: "Rouge / Bleu / RFVF (Starter Eau)", pokemons: [18, 65, 112, 103, 59, 9] }, 
                { nom: "Jaune (Starter Évoli - Aquali)", pokemons: [28, 65, 38, 103, 112, 134] }, 
                { nom: "Jaune (Starter Évoli - Voltali)", pokemons: [28, 65, 91, 103, 112, 135] }, 
                { nom: "Jaune (Starter Évoli - Pyroli)", pokemons: [28, 65, 91, 103, 112, 136] }, 
                { nom: "Let's Go (Trace - Starter Évoli)", pokemons: [18, 78, 80, 105, 143, 135] }, 
                { nom: "Let's Go (Trace - Starter Pikachu)", pokemons: [18, 78, 80, 105, 143, 136] } 
            ]
        }
    ],

    // ==========================================================
    // GÉNÉRATION 2 (JOHTO)
    // ==========================================================
    'gen2': [
        {
            nom: "Albert (Mauville)",
            sprite: "albert.png",
            equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [16, 17] } ] 
        },
        {
            nom: "Hector (Écorcia)",
            sprite: "hector.png",
            equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [11, 14, 123] } ] 
        },
        {
            nom: "Blanche (Doublonville)",
            sprite: "blanche.png",
            equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [35, 241] } ] 
        },
        {
            nom: "Mortimer (Rosalia)",
            sprite: "mortimer.png",
            equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [92, 93, 93, 94] } ] 
        },
        {
            nom: "Gaspard (Irisia)",
            sprite: "gaspard.png",
            equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [57, 62] } ] 
        },
        {
            nom: "Jasmine (Oliville)",
            sprite: "jasmine.png",
            equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [81, 81, 208] } ] 
        },
        {
            nom: "Frédo (Acajou)",
            sprite: "fredo.png",
            equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [86, 87, 221] } ] 
        },
        {
            nom: "Sandra (Ébènelle)",
            sprite: "sandra.png",
            equipes: [
                { nom: "Or / Argent / Cristal", pokemons: [148, 148, 148, 230] }, 
                { nom: "HeartGold / SoulSilver", pokemons: [130, 148, 148, 230] } 
            ]
        },
        // --- ADMINS TEAM ROCKET ---
        {
            nom: "Amos (Admin Rocket)",
            sprite: "amos.png",
            equipes: [ { nom: "Tour Radio (HGSS)", pokemons: [41, 109] } ] 
        },
        {
            nom: "Lambda (Admin Rocket)",
            sprite: "lambda.png",
            equipes: [ { nom: "Tour Radio (HGSS)", pokemons: [109, 109, 109, 109, 109, 110] } ] 
        },
        {
            nom: "Lance (Admin Rocket)",
            sprite: "lance_rocket.png",
            equipes: [ { nom: "Tour Radio (HGSS)", pokemons: [24, 198, 45] } ] 
        },
        {
            nom: "Apollon (Admin Rocket)",
            sprite: "apollon.png",
            equipes: [ { nom: "Tour Radio (HGSS)", pokemons: [228, 109, 229] } ] 
        },
        // --- CONSEIL 4 JOHTO ---
        {
            nom: "Clément (Conseil 4)",
            sprite: "clement.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [178, 124, 103, 80, 178] }, 
                { nom: "2nd Passage (Remakes HGSS)", pokemons: [437, 124, 326, 80, 282, 178] } 
            ]
        },
        {
            nom: "Koga (Conseil 4)",
            sprite: "koga_ligue.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [168, 49, 205, 89, 169] }, 
                { nom: "2nd Passage (Remakes HGSS)", pokemons: [435, 49, 317, 89, 454, 169] } 
            ]
        },
        {
            nom: "Aldo (Conseil 4)",
            sprite: "aldo_ligue.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [237, 107, 106, 95, 68] }, 
                { nom: "2nd Passage (Remakes HGSS)", pokemons: [237, 107, 106, 297, 448, 68] } 
            ]
        },
        {
            nom: "Marion (Conseil 4)",
            sprite: "marion.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [197, 45, 94, 198, 229] }, 
                { nom: "2nd Passage (Remakes HGSS)", pokemons: [461, 442, 359, 430, 229, 197] } 
            ]
        },
        {
            nom: "Peter (Maître de la Ligue)",
            sprite: "peter_maitre.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [130, 149, 149, 142, 6, 149] }, 
                { nom: "2nd Passage (Remakes HGSS)", pokemons: [373, 445, 334, 142, 6, 149] } 
            ]
        },
        // --- RIVAL & BOSS SECRET ---
        {
            nom: "Silver (Rival)",
            sprite: "silver.png",
            equipes: [
                { nom: "Combat Final (Starter Plante - Méganium)", pokemons: [215, 169, 82, 94, 65, 154] }, 
                { nom: "Combat Final (Starter Feu - Typhlosion)", pokemons: [215, 169, 82, 94, 65, 157] }, 
                { nom: "Combat Final (Starter Eau - Aligatueur)", pokemons: [215, 169, 82, 94, 65, 160] } 
            ]
        },
        {
            nom: "Red (Boss Mont Argenté)",
            sprite: "red_boss.png",
            equipes: [
                { nom: "Équipe Ultime (HGSS)", pokemons: [25, 131, 143, 3, 6, 9] } 
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

// NOUVELLE FONCTION DE NORMALISATION : Efface les "." pour M. Mime !
function normaliserTexte(texte) { 
    return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[- .']/g, "").toLowerCase().trim(); 
}

// =========================================
// 3. TÉLÉCHARGEMENT DES DONNÉES
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

    let titreRegion = "Génération Inconnue";
    if (regionKey === 'gen1') titreRegion = "Génération 1 (Kanto)";
    else if (regionKey === 'gen2') titreRegion = "Génération 2 (Johto)";

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
            clearInterval(timerInterval); input.disabled = true; input.placeholder = "INCROYABLE ! RÉGION COMPLÉTÉE !";
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
    if (confirm(`Voulez-vous vraiment abandonner la région ?`)) {
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