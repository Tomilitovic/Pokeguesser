const bgMusic = document.getElementById('bg-music'), btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;
btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; }
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

const grid = document.getElementById('pokedex-grid');
const input = document.getElementById('saisie');
const scoreText = document.getElementById('score'), maxText = document.getElementById('score-max'), timerText = document.getElementById('timer');
const typeMenu = document.getElementById('type-menu');
const titreMenu = document.getElementById('titre-dynamique');
const scoreContainer = document.getElementById('score-container'), timerContainer = document.getElementById('timer-container');
const btnRetour = document.getElementById('btn-retour-modes');

let allPokemons = [];
let pokemonsData = {};
let equipeActuelle = [];
let pokemonsTrouves = 0, scoreMax = 0;
let typeActif = null, typeFrActif = null;
let timerInterval, timerStarted = false, secondsElapsed = 0;

function formatTime(sec) { return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }
function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[- .']/g, "").toLowerCase().trim(); }

function startTimer() {
    if (!timerStarted && pokemonsTrouves < scoreMax) {
        timerStarted = true;
        timerInterval = setInterval(() => { secondsElapsed++; timerText.innerText = formatTime(secondsElapsed); }, 1000);
    }
}

btnRetour.addEventListener('click', () => {
    typeActif = null; typeFrActif = null; clearInterval(timerInterval); timerStarted = false; grid.innerHTML = '';
    titreMenu.style.display = 'none'; scoreContainer.style.display = 'none'; timerContainer.style.display = 'none'; btnRetour.style.display = 'none';
    input.disabled = true; input.placeholder = "Choisissez un type au-dessus...";
    typeMenu.style.display = 'flex';
});

document.getElementById('btn-reset').addEventListener('click', () => { if(typeActif) lancerQuizType(typeActif, typeFrActif); });

async function initialiserBaseDeDonnees() {
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_lte: 1025}}) { id name pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id is_default pokemontypes { type { name } } } } }`;
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(e => {
            const vraiNom = e.pokemonspeciesnames[0].name;
            const nomNormalise = normaliserTexte(vraiNom);
            let types = [];
            let defaultForm = e.pokemons.find(p => p.is_default);
            if(defaultForm) defaultForm.pokemontypes.forEach(pt => types.push(pt.type.name));

            allPokemons[e.id] = { id: e.id, vraiNom: vraiNom, types: types };
            pokemonsData[nomNormalise] = e.id;
        });
        input.placeholder = "Le Pokédex est prêt ! Choisissez un type au-dessus 🌟";
    } catch (err) { input.placeholder = "Erreur réseau !"; }
}

function lancerQuizType(typeApi, typeFr) {
    typeActif = typeApi; typeFrActif = typeFr;
    typeMenu.style.display = 'none';
    scoreContainer.style.display = 'flex';
    timerContainer.style.display = 'block';
    btnRetour.style.display = 'inline-block';
    
    titreMenu.innerText = `Type : ${typeFr}`;
    titreMenu.style.display = 'block';

    pokemonsTrouves = 0; scoreMax = 0; secondsElapsed = 0;
    timerText.innerText = formatTime(0); clearInterval(timerInterval); timerStarted = false;
    document.getElementById('btn-ombre').disabled = false;
    grid.innerHTML = ''; equipeActuelle = [];

    // Recherche de tous les Pokémon possédant ce type
    for(let id=1; id<=1025; id++) {
        if(allPokemons[id] && allPokemons[id].types.includes(typeApi)) {
            scoreMax++;
            equipeActuelle.push({ pokeId: id, htmlId: `box-type-${id}`, trouve: false });

            let box = document.createElement('div');
            box.className = 'pokemon-box';
            box.id = `box-type-${id}`;
            box.innerText = `#${id}`;
            grid.appendChild(box);
        }
    }
    maxText.innerText = scoreMax;
    scoreText.innerText = pokemonsTrouves;
    input.placeholder = `Tapez le nom d'un Pokémon de type ${typeFr}...`;
    input.disabled = false; input.focus();
}

function validerPokemon(pokeIdCible) {
    let trouveQuelqueChose = false;
    equipeActuelle.forEach(slot => {
        if (slot.pokeId === pokeIdCible && !slot.trouve) {
            slot.trouve = true; trouveQuelqueChose = true; pokemonsTrouves++;
            const box = document.getElementById(slot.htmlId);
            box.classList.add('trouve');
            box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeIdCible}.png"><span class="nom">${allPokemons[pokeIdCible].vraiNom}</span>`;
        }
    });

    if (trouveQuelqueChose) {
        scoreText.innerText = pokemonsTrouves;
        startTimer();
        let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokeIdCible}.ogg`);
        cri.volume = 0.5; cri.play().catch(()=>{});

        if (pokemonsTrouves === scoreMax) {
            clearInterval(timerInterval); input.disabled = true; input.placeholder = "INCROYABLE ! TYPE COMPLÉTÉ !";
            confetti({ particleCount: 150, spread: 180 });
        }
    }
    return trouveQuelqueChose;
}

input.addEventListener('input', (e) => {
    if (!typeActif) return;
    const texte = normaliserTexte(e.target.value);
    let pokeIdCible = null;
    if (texte === "nidoran") pokeIdCible = 32; 
    else if (pokemonsData[texte]) pokeIdCible = pokemonsData[texte];

    if (pokeIdCible && validerPokemon(pokeIdCible)) e.target.value = "";
});

document.getElementById('btn-ombre').addEventListener('click', () => {
    if (equipeActuelle.length === 0) return;
    startTimer();
    equipeActuelle.forEach(slot => {
        if (!slot.trouve) {
            document.getElementById(slot.htmlId).innerHTML = `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${slot.pokeId}.png">`;
        }
    });
    document.getElementById('btn-ombre').disabled = true;
});

document.getElementById('btn-abandon').addEventListener('click', () => {
    if (equipeActuelle.length === 0) return;
    if (confirm(`Voulez-vous vraiment abandonner le type ${typeFrActif} ?`)) {
        clearInterval(timerInterval); input.disabled = true; input.placeholder = "Quiz terminé !";
        equipeActuelle.forEach(slot => {
            if (!slot.trouve) {
                const box = document.getElementById(slot.htmlId);
                box.classList.add('rate'); 
                box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${slot.pokeId}.png"><span class="nom">${allPokemons[slot.pokeId].vraiNom}</span>`;
            }
        });
    }
});

initialiserBaseDeDonnees();