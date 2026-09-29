const bgMusic = document.getElementById('bg-music'), btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;
btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; }
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

// Éléments du DOM
const menuSpecial = document.getElementById('special-menu');
const containerBt = document.getElementById('blind-test-container');
const containerStats = document.getElementById('quiz-stats-container');

// Elements Stats
const grid = document.getElementById('pokedex-grid');
const inputStats = document.getElementById('saisie');
const scoreText = document.getElementById('score'), timerText = document.getElementById('timer');
const titreDynamique = document.getElementById('titre-dynamique-stat');

// Elements Blind Test
const inputBt = document.getElementById('saisie-bt');
const btnPlay = document.getElementById('btn-play-sound');
const btResultat = document.getElementById('bt-resultat');
const btScoreText = document.getElementById('bt-score');

// Variables globales
let allPokemons = {};
let pokemonsData = {};
let basePrete = false;

// Variables Mode Stats
let equipeActuelle = [];
let pokemonsTrouves = 0, scoreMax = 100;
let statActive = null, titreActif = null;
let timerInterval, timerStarted = false, secondsElapsed = 0;

// Variables Mode Blind Test
let pokeMystere = null;
let scoreBt = 0;

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[- .']/g, "").toLowerCase().trim(); }
function formatTime(sec) { return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }

// ==========================================
// 1. CHARGEMENT DE LA BASE DE DONNÉES
// ==========================================
async function initialiserBaseDeDonnees() {
    inputStats.placeholder = "Chargement des stats...";
    // Requête GraphQL pour récupérer le nom, et toutes les stats (Poids, HP, Attaque, Vitesse, etc.)
    const requeteGraphQL = `query { 
        pokemonspecies(where: {id: {_lte: 1025}}) { 
            id 
            pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } 
            pokemons { 
                is_default 
                weight 
                pokemonstats { stat_id base_stat } 
            } 
        } 
    }`;

    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(e => {
            const vraiNom = e.pokemonspeciesnames[0].name;
            const nomNormalise = normaliserTexte(vraiNom);
            
            let pDef = e.pokemons.find(p => p.is_default);
            let hp = 0, atk = 0, def = 0, spe = 0, weight = 0;
            
            if(pDef) {
                weight = pDef.weight; // Poids (en hectogrammes)
                pDef.pokemonstats.forEach(s => {
                    if(s.stat_id === 1) hp = s.base_stat;
                    if(s.stat_id === 2) atk = s.base_stat;
                    if(s.stat_id === 3) def = s.base_stat;
                    if(s.stat_id === 6) spe = s.base_stat; // Vitesse
                });
            }

            allPokemons[e.id] = { id: e.id, vraiNom: vraiNom, hp, atk, def, spe, weight };
            pokemonsData[nomNormalise] = e.id;
        });

        basePrete = true;
        inputStats.placeholder = "Le Pokédex est prêt ! Choisissez un mode.";
        inputBt.placeholder = "Cliquez sur 'Écouter' pour commencer !";
    } catch (err) { 
        inputStats.placeholder = "Erreur réseau !"; 
        inputBt.placeholder = "Erreur réseau !";
    }
}

// ==========================================
// 2. LOGIQUE DU MODE STATISTIQUES (TOP 100)
// ==========================================
function startTimer() {
    if (!timerStarted && pokemonsTrouves < scoreMax) {
        timerStarted = true;
        timerInterval = setInterval(() => { secondsElapsed++; timerText.innerText = formatTime(secondsElapsed); }, 1000);
    }
}

function lancerQuizStat(critere, titre) {
    if(!basePrete) return;
    
    statActive = critere; titreActif = titre;
    menuSpecial.style.display = 'none';
    containerStats.style.display = 'block';
    
    titreDynamique.innerText = titre;
    pokemonsTrouves = 0; secondsElapsed = 0;
    timerText.innerText = formatTime(0); clearInterval(timerInterval); timerStarted = false;
    document.getElementById('btn-ombre').disabled = false;
    grid.innerHTML = ''; equipeActuelle = [];

    // Trier les Pokémon selon le critère choisi
    let listeTriee = Object.values(allPokemons).filter(p => p.id).sort((a, b) => {
        if(critere === 'weight_asc') return a.weight - b.weight; // Du plus léger au plus lourd
        if(critere === 'weight_desc') return b.weight - a.weight; // Du plus lourd au plus léger
        return b[critere] - a[critere]; // Ordre décroissant pour les stats (Vitesse, Attaque, etc.)
    });

    // Prendre le Top 100
    let top100 = listeTriee.slice(0, 100);

    top100.forEach((poke, index) => {
        let htmlId = `box-stat-${index}`;
        equipeActuelle.push({ pokeId: poke.id, htmlId: htmlId, trouve: false });

        let box = document.createElement('div');
        box.className = 'pokemon-box';
        box.id = htmlId;
        
        // Optionnel : afficher la stat sur la case pour plus de clarté
        let valeurAffichee = "";
        if(critere.includes('weight')) valeurAffichee = `${poke.weight / 10} kg`;
        else valeurAffichee = `${poke[critere]} pts`;

        box.innerHTML = `<span style="font-size:0.8em; color:#7f8c8d;">#${index + 1} (${valeurAffichee})</span>`;
        grid.appendChild(box);
    });

    scoreText.innerText = pokemonsTrouves;
    inputStats.placeholder = `Trouvez le Top 100...`;
    inputStats.disabled = false; inputStats.focus();
}

function validerPokemonStat(pokeIdCible) {
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
            clearInterval(timerInterval); inputStats.disabled = true; inputStats.placeholder = "INCROYABLE ! DÉFI ACCOMPLI !";
            confetti({ particleCount: 150, spread: 180 });
        }
    }
    return trouveQuelqueChose;
}

inputStats.addEventListener('input', (e) => {
    if (!statActive) return;
    const texte = normaliserTexte(e.target.value);
    let pokeIdCible = pokemonsData[texte];
    if (texte === "nidoran") pokeIdCible = 32; 

    if (pokeIdCible && validerPokemonStat(pokeIdCible)) e.target.value = "";
});

document.getElementById('btn-ombre').addEventListener('click', () => {
    if (equipeActuelle.length === 0) return;
    startTimer();
    equipeActuelle.forEach(slot => {
        if (!slot.trouve) {
            document.getElementById(slot.htmlId).innerHTML += `<img class="ombre" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${slot.pokeId}.png">`;
        }
    });
    document.getElementById('btn-ombre').disabled = true;
});

document.getElementById('btn-abandon').addEventListener('click', () => {
    if (equipeActuelle.length === 0) return;
    if (confirm(`Voulez-vous vraiment abandonner ce défi ?`)) {
        clearInterval(timerInterval); inputStats.disabled = true; inputStats.placeholder = "Quiz terminé !";
        equipeActuelle.forEach(slot => {
            if (!slot.trouve) {
                const box = document.getElementById(slot.htmlId);
                box.classList.add('rate'); 
                box.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${slot.pokeId}.png"><span class="nom">${allPokemons[slot.pokeId].vraiNom}</span>`;
            }
        });
    }
});

document.getElementById('btn-reset-stat').addEventListener('click', () => { if(statActive) lancerQuizStat(statActive, titreActif); });

document.getElementById('btn-retour-speciaux-stat').addEventListener('click', () => {
    clearInterval(timerInterval); timerStarted = false; statActive = null;
    containerStats.style.display = 'none';
    menuSpecial.style.display = 'block';
});


// ==========================================
// 3. LOGIQUE DU MODE BLIND TEST
// ==========================================
function lancerBlindTest() {
    if(!basePrete) return;
    menuSpecial.style.display = 'none';
    containerBt.style.display = 'block';
    scoreBt = 0; btScoreText.innerText = scoreBt;
    nouveauPokemonBt();
}

function nouveauPokemonBt() {
    pokeMystere = Math.floor(Math.random() * 1025) + 1;
    inputBt.value = ""; 
    inputBt.placeholder = "Qui est ce Pokémon ?";
    inputBt.disabled = false; inputBt.focus();
    btResultat.innerHTML = '<img src="logo.jpeg" style="height:150px; opacity:0.2; border-radius:50%;">';
    jouerCri();
}

function jouerCri() {
    if(!pokeMystere) return;
    let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokeMystere}.ogg`);
    cri.volume = 0.8; cri.play().catch(()=>{});
}

btnPlay.addEventListener('click', jouerCri);

inputBt.addEventListener('input', (e) => {
    if(!pokeMystere) return;
    let texte = normaliserTexte(e.target.value);
    let pokeIdSaisi = pokemonsData[texte];
    if (texte === "nidoran") pokeIdSaisi = 32;
    
    if(pokeIdSaisi === pokeMystere) {
        scoreBt++;
        btScoreText.innerText = scoreBt;
        
        btResultat.innerHTML = `
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeMystere}.png" style="height:150px; filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));">
            <h2 style="color:#2ecc71; margin-top:10px;">Bravo ! C'était ${allPokemons[pokeMystere].vraiNom} !</h2>
        `;
        
        inputBt.disabled = true;
        confetti({ particleCount: 50, spread: 60 });
        
        setTimeout(nouveauPokemonBt, 2500);
    }
});

document.getElementById('btn-retour-speciaux-bt').addEventListener('click', () => {
    containerBt.style.display = 'none';
    menuSpecial.style.display = 'block';
    pokeMystere = null;
});

// INITIALISATION DU SCRIPT
initialiserBaseDeDonnees();