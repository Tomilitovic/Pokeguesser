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
let equipeActuelle = []; // Liste des objets { idPokemon, divId, trouve }
let pokemonsTrouves = 0;
let scoreMax = 0;
let regionActive = null; 
let timerInterval, timerStarted = false, secondsElapsed = 0;

// =========================================
// 1. LE DICTIONNAIRE DES DRESSEURS (La grosse base de données manuelle)
// =========================================
// Sprites : On utilise les sprites officiels de Pokémon Showdown
const bddDresseurs = {
    'gen1': [
        {
            nom: "Pierre (Argenta)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/brock.png",
            equipes: [
                { nom: "Équipe Arène", pokemons: [74, 95] } // Racaillou, Onix
            ]
        },
        {
            nom: "Ondine (Azuria)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/misty.png",
            equipes: [
                { nom: "Équipe Arène", pokemons: [120, 121] } // Stari, Staross
            ]
        },
        {
            nom: "Major Bob (Carmin sur Mer)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/lt.surge.png",
            equipes: [
                { nom: "Équipe Arène", pokemons: [100, 25, 26] } // Voltorbe, Pikachu, Raichu
            ]
        },
        {
            nom: "Érika (Céladopole)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/erika.png",
            equipes: [
                { nom: "Équipe Arène", pokemons: [71, 114, 45] } // Empiflor, Saquedeneu, Rafflesia
            ]
        },
        {
            nom: "Koga (Parmanie)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/koga.png",
            equipes: [
                { nom: "Équipe Arène", pokemons: [109, 89, 109, 110] } // Smogo, Grotadmorv, Smogo, Smogogo
            ]
        },
        {
            nom: "Morgiane (Safrania)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/sabrina.png",
            equipes: [
                { nom: "Équipe Arène", pokemons: [64, 122, 49, 65] } // Kadabra, M. Mime, Aéromite, Alakazam
            ]
        },
        {
            nom: "Auguste (Cramois'Île)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/blaine.png",
            equipes: [
                { nom: "Équipe Arène", pokemons: [58, 77, 78, 59] } // Caninos, Ponyta, Galopa, Arcanin
            ]
        },
        {
            nom: "Giovanni (Jadielle)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/giovanni.png",
            equipes: [
                { nom: "Équipe Arène", pokemons: [111, 51, 31, 34, 112] } // Rhinocorne, Triopikeur, Nidoqueen, Nidoking, Rhinoféros
            ]
        },
        // --- CONSEIL 4 ---
        {
            nom: "Olga (Conseil 4)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/lorelei.png",
            equipes: [
                { nom: "Équipe Ligue", pokemons: [87, 91, 80, 124, 131] }
            ]
        },
        {
            nom: "Aldo (Conseil 4)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/bruno.png",
            equipes: [
                { nom: "Équipe Ligue", pokemons: [95, 107, 106, 95, 68] }
            ]
        },
        {
            nom: "Agatha (Conseil 4)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/agatha.png",
            equipes: [
                { nom: "Équipe Ligue", pokemons: [94, 42, 93, 24, 94] }
            ]
        },
        {
            nom: "Peter (Conseil 4)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/lance.png",
            equipes: [
                { nom: "Équipe Ligue", pokemons: [130, 148, 148, 142, 149] }
            ]
        },
        // --- RIVAL (MAÎTRE) ---
        {
            nom: "Blue (Maître de la Ligue)",
            sprite: "https://play.pokemonshowdown.com/sprites/trainers/blue.png",
            equipes: [
                { nom: "Équipe Starter Plante (Bulbizarre)", pokemons: [18, 65, 112, 103, 130, 3] },
                { nom: "Équipe Starter Feu (Salamèche)", pokemons: [18, 65, 112, 102, 130, 6] },
                { nom: "Équipe Starter Eau (Carapuce)", pokemons: [18, 65, 112, 103, 59, 9] }
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
    let uniqueIdCounter = 0; // Pour donner un ID HTML unique (car un pokémon peut apparaitre plusieurs fois !)

    dresseursList.forEach(dresseur => {
        let section = document.createElement('div');
        section.className = 'dresseur-section';

        // L'en-tête avec la photo et le nom
        section.innerHTML = `
            <div class="dresseur-header">
                <img src="${dresseur.sprite}" alt="${dresseur.nom}">
                <h2>${dresseur.nom}</h2>
            </div>
        `;

        // Génération des équipes
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
// Quand on tape un nom, on valide TOUTES les cases qui attendent ce Pokémon
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
    if (texte === "nidoran") pokeIdCible = 32; // Raccourci simple
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