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

let allForms = []; 
let pokemonsData = {}; 
let pokeDuModeActuel = [];
let pokemonsTrouves = [];
let scoreActuel = 0, scoreMax = 0;
let modeActif = null; 
let timerInterval, timerStarted = false, secondsElapsed = 0;
let intervalsRotation = {}; 

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
    Object.values(intervalsRotation).forEach(clearInterval); intervalsRotation = {};
    titreMenu.style.display = 'none'; scoreContainer.style.display = 'none'; timerContainer.style.display = 'none'; btnRetour.style.display = 'none';
    input.disabled = true; input.placeholder = "Choisissez un mode spécial au-dessus...";
    specialMenu.style.display = 'flex';
});

function normaliserTexte(texte) { return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "").toLowerCase().trim(); }

async function initialiserBaseDeDonnees() {
    input.placeholder = "Analyse et fusion des Pokémon (patiente)..."; input.disabled = true;
    
    const requeteGraphQL = `query { pokemonspecies(where: {id: {_lte: 1025}}) { id is_legendary is_mythical pokemonspeciesnames(where: {language_id: {_eq: 5}}) { name } pokemons { id name weight height is_default pokemonstats { base_stat stat { name } } } } }`;
    
    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: requeteGraphQL }) });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(e => {
            const speciesId = e.id;
            const vraiNom = e.pokemonspeciesnames[0].name;
            const nomNormalise = normaliserTexte(vraiNom);

            pokemonsData[nomNormalise] = speciesId;

            // --- CATÉGORIES CORRIGÉES ---
            let category = null;
            const ubs = [793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806];
            const paradoxes = [984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010, 1020, 1021, 1022, 1023]; 
            const pseudos = [149, 248, 373, 376, 445, 635, 706, 784, 887, 998];

            if (ubs.includes(speciesId)) category = "Ultra-Chimères";
            else if (paradoxes.includes(speciesId)) category = "Paradoxes";
            else if (pseudos.includes(speciesId)) category = "Pseudo-Légendaires";
            else if (e.is_mythical) category = "Fabuleux"; 
            else if (e.is_legendary) category = "Légendaires";

            let normalForms = [];
            let megaForms = [];

            e.pokemons.forEach(p => {
                const name = p.name;
                if (name.includes("-gmax") || name.includes("-eternamax") || name.includes("-totem")) return; 

                if (name.includes("-mega") || name.includes("-primal")) {
                    megaForms.push(p);
                } else {
                    normalForms.push(p);
                }
            });

            if (normalForms.length > 0) {
                let maxWeight = 0, maxHeight = 0;
                let maxHp = 0, maxAtk = 0, maxDef = 0, maxSpa = 0, maxSpd = 0, maxSpe = 0;
                let formIds = [];

                normalForms.forEach(p => {
                    formIds.push(p.id);
                    if (p.weight / 10 > maxWeight) maxWeight = p.weight / 10;
                    if (p.height / 10 > maxHeight) maxHeight = p.height / 10;

                    let stats = {};
                    p.pokemonstats.forEach(s => stats[s.stat.name] = s.base_stat);
                    if (stats['hp'] > maxHp) maxHp = stats['hp'];
                    if (stats['attack'] > maxAtk) maxAtk = stats['attack'];
                    if (stats['defense'] > maxDef) maxDef = stats['defense'];
                    if (stats['special-attack'] > maxSpa) maxSpa = stats['special-attack'];
                    if (stats['special-defense'] > maxSpd) maxSpd = stats['special-defense'];
                    if (stats['speed'] > maxSpe) maxSpe = stats['speed'];
                });

                allForms.push({
                    id: speciesId,
                    speciesId: speciesId,
                    vraiNom: vraiNom,
                    formes: formIds,
                    isMega: false,
                    isDefault: true,
                    category: category,
                    weight: maxWeight, height: maxHeight,
                    hp: maxHp, atk: maxAtk, def: maxDef, spa: maxSpa, spd: maxSpd, spe: maxSpe
                });
            }

            if (megaForms.length > 0) {
                let maxWeight = 0, maxHeight = 0;
                let maxHp = 0, maxAtk = 0, maxDef = 0, maxSpa = 0, maxSpd = 0, maxSpe = 0;
                let formIds = [];

                megaForms.forEach(p => {
                    formIds.push(p.id);
                    if (p.weight / 10 > maxWeight) maxWeight = p.weight / 10;
                    if (p.height / 10 > maxHeight) maxHeight = p.height / 10;

                    let stats = {};
                    p.pokemonstats.forEach(s => stats[s.stat.name] = s.base_stat);
                    if (stats['hp'] > maxHp) maxHp = stats['hp'];
                    if (stats['attack'] > maxAtk) maxAtk = stats['attack'];
                    if (stats['defense'] > maxDef) maxDef = stats['defense'];
                    if (stats['special-attack'] > maxSpa) maxSpa = stats['special-attack'];
                    if (stats['special-defense'] > maxSpd) maxSpd = stats['special-defense'];
                    if (stats['speed'] > maxSpe) maxSpe = stats['speed'];
                });

                let suffix = megaForms[0].name.includes("-primal") ? " (Primo)" : " (Méga)";

                allForms.push({
                    id: formIds[0], 
                    speciesId: speciesId,
                    vraiNom: vraiNom + suffix,
                    formes: formIds, 
                    isMega: true,
                    isDefault: false,
                    category: null,
                    weight: maxWeight, height: maxHeight,
                    hp: maxHp, atk: maxAtk, def: maxDef, spa: maxSpa, spd: maxSpd, spe: maxSpe
                });
            }
        });
        input.placeholder = "Choisissez un mode spécial au-dessus !";
    } catch (err) { input.placeholder = "Erreur réseau !"; }
}

function chargerMode(mode) {
    modeActif = mode;
    Object.values(intervalsRotation).forEach(clearInterval); intervalsRotation = {};
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

    if (['weight', 'height', 'atk', 'def', 'spa', 'spd', 'spe', 'hp'].includes(mode)) {
        pokeDuModeActuel = [...allForms].sort((a, b) => b[mode] - a[mode]).slice(0, 100);
        
        let container = document.createElement('div'); container.classList.add('gen-container');
        let gridSmall = document.createElement('div'); gridSmall.classList.add('grid-small');

        pokeDuModeActuel.forEach((p, index) => {
            let box = document.createElement('div');
            // C'EST ICI : Utilisation de la nouvelle classe pokemon-box-special
            box.classList.add('pokemon-box-special');
            box.id = "box-" + p.id;
            box.innerHTML = `<span class="numero">#${index + 1}</span><div class="valeur-stat">${p[mode]} ${specialConfig[mode].label}</div>`;
            gridSmall.appendChild(box);
        });
        container.appendChild(gridSmall); grid.appendChild(container);

    } else if (mode === 'mega') {
        pokeDuModeActuel = allForms.filter(f => f.isMega).sort((a, b) => a.speciesId - b.speciesId);
        
        let container = document.createElement('div'); container.classList.add('gen-container');
        let gridSmall = document.createElement('div'); gridSmall.classList.add('grid-small');

        pokeDuModeActuel.forEach(p => {
            let box = document.createElement('div');
            box.classList.add('pokemon-box-special');
            box.id = "box-" + p.id;
            box.innerHTML = `<span class="numero">Méga</span>`;
            gridSmall.appendChild(box);
        });
        container.appendChild(gridSmall); grid.appendChild(container);

    } else if (mode === 'legendaires') {
        pokeDuModeActuel = allForms.filter(f => f.category && f.isDefault);
        pokeDuModeActuel.sort((a, b) => a.speciesId - b.speciesId); 
        
        const ordreCategories = ["Pseudo-Légendaires", "Légendaires", "Fabuleux", "Ultra-Chimères", "Paradoxes"];
        
        ordreCategories.forEach(cat => {
            const pokeDeLaCat = pokeDuModeActuel.filter(p => p.category === cat);
            if (pokeDeLaCat.length > 0) {
                let container = document.createElement('div'); container.classList.add('gen-container');
                container.innerHTML = `<h2 class="gen-title">${cat}</h2>`;
                let gridSmall = document.createElement('div'); gridSmall.classList.add('grid-small');

                pokeDeLaCat.forEach(p => {
                    let box = document.createElement('div');
                    box.classList.add('pokemon-box-special');
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

function validerForme(forme, joueurActif = true) {
    const box = document.getElementById("box-" + forme.id);
    if (!box || box.classList.contains('trouve')) return;

    box.classList.remove('rate'); 
    box.classList.add('trouve');
    scoreActuel++; scoreText.innerText = scoreActuel;
    pokemonsTrouves.push(forme.id);
    
    if(joueurActif) {
        startTimer();
        let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${forme.speciesId}.ogg`);
        cri.volume = 0.5; cri.play().catch(e => {}); 
    }
    
    let statInfo = "";
    if (['weight', 'height', 'atk', 'def', 'spa', 'spd', 'spe', 'hp'].includes(modeActif)) {
        statInfo = `<div class="valeur-stat">${forme[modeActif]} ${specialConfig[modeActif].label}</div>`;
    }
    
    box.innerHTML = `
        <img id="img-${forme.id}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${forme.id}.png">
        <span class="nom">${forme.vraiNom}</span>
        ${statInfo}
    `;

    if (forme.formes.length > 1) {
        let indexForme = 0;
        intervalsRotation[forme.id] = setInterval(() => {
            let img = document.getElementById(`img-${forme.id}`);
            if (img) { 
                indexForme = (indexForme + 1) % forme.formes.length; 
                img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${forme.formes[indexForme]}.png`; 
            }
        }, 5000); 
    }
        
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