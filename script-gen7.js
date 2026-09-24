const bgMusic = document.getElementById('bg-music'), btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;
btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; } 
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

const grid = document.getElementById('pokedex-grid'), input = document.getElementById('saisie'), scoreText = document.getElementById('score'), timerText = document.getElementById('timer');
let scoreActuel = 0, pokemonsData = {}, pokemonsTrouves = []; 
let timerInterval, timerStarted = false, secondsElapsed = parseInt(localStorage.getItem('timerGen7')) || 0;

function formatTime(sec) { return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`; }
timerText.innerText = formatTime(secondsElapsed);

function startTimer() {
    if (!timerStarted && scoreActuel < 88) {
        timerStarted = true;
        timerInterval = setInterval(() => { secondsElapsed++; timerText.innerText = formatTime(secondsElapsed); localStorage.setItem('timerGen7', secondsElapsed); }, 1000);
    }
}

window.addEventListener('beforeunload', (e) => { if (scoreActuel > 0 && scoreActuel < 88) { e.preventDefault(); e.returnValue = ''; } });
document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm("Voulez-vous vraiment recommencer à zéro ?")) { localStorage.removeItem('sauvegardeGen7'); localStorage.removeItem('timerGen7'); location.reload(); }
});

for (let i = 722; i <= 809; i++) {
    let box = document.createElement('div'); box.classList.add('pokemon-box'); box.id = "box-" + i;
    box.innerHTML = `<span class="numero">#${i.toString().padStart(3, '0')}</span>`; grid.appendChild(box);
}

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[- ]/g, "").toLowerCase().trim(); }

async function chargerPokemons() {
    input.placeholder = "Chargement..."; input.disabled = true; 
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_gte: 722, _lte: 809}}) { id name pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id } } }`;
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        data.data.pokemonspecies.forEach(e => {
            const id = e.id, nomAnglais = normaliserTexte(e.name), nomFrancais = normaliserTexte(e.pokemonspeciesnames[0].name), formes = e.pokemons.map(p => p.id);
            pokemonsData[nomFrancais] = { id, formes, vraiNom: e.pokemonspeciesnames[0].name }; pokemonsData[nomAnglais] = { id, formes, vraiNom: e.name }; 
        });

        const sauvegarde = localStorage.getItem('sauvegardeGen7');
        if (sauvegarde) {
            JSON.parse(sauvegarde).forEach(id => {
                let nomAffiche = "Trouvé";
                for (let cle in pokemonsData) { if (pokemonsData[cle].id === id) { nomAffiche = pokemonsData[cle].vraiNom; break; } }
                validerPokemon(id, pokemonsData[normaliserTexte(nomAffiche)].formes, nomAffiche, false);
            });
        }
        input.placeholder = "Tapez un nom de Pokémon..."; input.disabled = false; input.focus();
    } catch (err) { input.placeholder = "Erreur de chargement !"; }
}

function declencherVictoire() {
    new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/778.ogg').play();
    let duration = 15000, end = Date.now() + duration;
    let interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({ particleCount: 50, startVelocity: 30, spread: 360, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);
}

function validerPokemon(idPokemon, formes, nomSaisi, joueurActif = true) {
    const box = document.getElementById("box-" + idPokemon);
    if (!box.classList.contains('trouve')) {
        box.classList.add('trouve'); scoreActuel++; scoreText.innerText = scoreActuel;
        if(joueurActif) {
            startTimer();
            let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${idPokemon}.ogg`); cri.volume = 0.5; cri.play();
            pokemonsTrouves.push(idPokemon); localStorage.setItem('sauvegardeGen7', JSON.stringify(pokemonsTrouves));
        } else { pokemonsTrouves.push(idPokemon); }
        
        box.innerHTML = `<img id="img-${idPokemon}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formes[0]}.png" style="width: 80px; height: 80px; object-fit: contain;"><span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: white;">${nomSaisi.toUpperCase()}</span>`;
        if (formes.length > 1) {
            let index = 0; setInterval(() => {
                let img = document.getElementById(`img-${idPokemon}`);
                if (img) { index = (index + 1) % formes.length; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formes[index]}.png`; }
            }, 10000);
        }
        if (scoreActuel === 88 && joueurActif) { clearInterval(timerInterval); input.disabled = true; input.placeholder = "INCROYABLE ! FINI !"; declencherVictoire(); }
    }
}

input.addEventListener('input', (e) => {
    const texte = normaliserTexte(e.target.value);
    if (pokemonsData[texte] && !document.getElementById("box-" + pokemonsData[texte].id).classList.contains('trouve')) {
        validerPokemon(pokemonsData[texte].id, pokemonsData[texte].formes, e.target.value, true); e.target.value = "";
    }
});
chargerPokemons();