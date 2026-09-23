const grid = document.getElementById('pokedex-grid');
const input = document.getElementById('saisie');
const scoreText = document.getElementById('score');

let scoreActuel = 0;
let pokemonsData = {};
let pokemonsTrouves = []; // Tableau de sauvegarde

// Alerte si le joueur tente de fermer l'onglet
window.addEventListener('beforeunload', function (e) {
    if (scoreActuel > 0 && scoreActuel < 151) {
        e.preventDefault();
        e.returnValue = ''; // Requis par les navigateurs modernes
    }
});

// Action du bouton de réinitialisation
document.getElementById('btn-reset').addEventListener('click', function() {
    if(confirm("Voulez-vous vraiment tout effacer et recommencer à zéro ?")) {
        localStorage.removeItem('sauvegardeGen1');
        location.reload(); // Rafraîchit la page
    }
});

for (let i = 1; i <= 151; i++) {
    let box = document.createElement('div');
    box.classList.add('pokemon-box');
    box.id = "box-" + i;
    let numeroFormate = "#" + i.toString().padStart(3, '0');
    box.innerHTML = `<span class="numero">${numeroFormate}</span>`;
    grid.appendChild(box);
}

function normaliserTexte(texte) {
    return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function chargerPokemons() {
    input.placeholder = "Chargement des Pokémon...";
    input.disabled = true; 

    const requeteGraphQL = `
    query {
      pokemonspecies(where: {id: {_lte: 151}}) {
        id
        name
        pokemonspeciesnames(where: {language_id: {_eq: 5}}) {
          name
        }
        pokemons {
          id
        }
      }
    }`;

    try {
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: requeteGraphQL })
        });
        const data = await reponse.json();
        
        data.data.pokemonspecies.forEach(espece => {
            const id = espece.id;
            const nomAnglais = normaliserTexte(espece.name);
            const nomFrancais = normaliserTexte(espece.pokemonspeciesnames[0].name);
            const toutesLesFormes = espece.pokemons.map(p => p.id);
            
            // On sauvegarde aussi le "vraiNom" avec sa majuscule pour l'affichage de la sauvegarde
            pokemonsData[nomFrancais] = { id: id, formes: toutesLesFormes, vraiNom: espece.pokemonspeciesnames[0].name };
            pokemonsData[nomAnglais] = { id: id, formes: toutesLesFormes, vraiNom: espece.name }; 
        });

        // RÉCUPÉRATION DE LA SAUVEGARDE AU CHARGEMENT
        const sauvegarde = localStorage.getItem('sauvegardeGen1');
        if (sauvegarde) {
            const idsSauvegardes = JSON.parse(sauvegarde); 
            idsSauvegardes.forEach(id => {
                let nomAffiche = "Trouvé";
                for (let cle in pokemonsData) {
                    if (pokemonsData[cle].id === id) {
                        nomAffiche = pokemonsData[cle].vraiNom;
                        break;
                    }
                }
                // On valide le Pokémon sans jouer le cri (pour ne pas casser les oreilles au chargement)
                validerPokemon(id, pokemonsData[normaliserTexte(nomAffiche)].formes, nomAffiche, false);
            });
        }

        input.placeholder = "Tapez un nom de Pokémon...";
        input.disabled = false;
        input.focus();
    } catch (erreur) {
        input.placeholder = "Erreur de chargement !";
    }
}

function declencherVictoire() {
    const criPikachu = new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg');
    criPikachu.play();

    let duration = 15 * 1000;
    let animationEnd = Date.now() + duration;
    let defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    let interval = setInterval(function() {
        let timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) { return clearInterval(interval); }
        let particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

// Fonction séparée pour traiter la trouvaille d'un Pokémon
function validerPokemon(idPokemon, formes, nomSaisi, joueurActif = true) {
    const box = document.getElementById("box-" + idPokemon);
    
    if (!box.classList.contains('trouve')) {
        box.classList.add('trouve');
        
        scoreActuel++;
        scoreText.innerText = scoreActuel;

        // Si le joueur vient de taper le nom (joueurActif = true)
        if(joueurActif) {
            const cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${idPokemon}.ogg`);
            cri.volume = 0.5;
            cri.play();
            
            // On ajoute l'ID à la mémoire
            pokemonsTrouves.push(idPokemon);
            localStorage.setItem('sauvegardeGen1', JSON.stringify(pokemonsTrouves));
        } else {
            // Si c'est un chargement de page, on rajoute discrètement l'ID dans le tableau local
            pokemonsTrouves.push(idPokemon);
        }
        
        box.innerHTML = `
            <img id="img-${idPokemon}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formes[0]}.png" alt="Pokemon" style="width: 80px; height: 80px; object-fit: contain;">
            <span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: white;">${nomSaisi.toUpperCase()}</span>
        `;
        
        if (formes.length > 1) {
            let indexForme = 0;
            setInterval(() => {
                const imgElement = document.getElementById(`img-${idPokemon}`);
                if (imgElement) {
                    indexForme = (indexForme + 1) % formes.length;
                    imgElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formes[indexForme]}.png`;
                }
            }, 10000);
        }

        if (scoreActuel === 151 && joueurActif) {
            input.disabled = true;
            input.placeholder = "INCROYABLE ! VOUS AVEZ FINI !";
            declencherVictoire();
        }
    }
}

input.addEventListener('input', function(e) {
    const texteSaisi = normaliserTexte(e.target.value);
    
    if (pokemonsData[texteSaisi]) {
        const idPokemon = pokemonsData[texteSaisi].id;
        const formes = pokemonsData[texteSaisi].formes; 
        
        validerPokemon(idPokemon, formes, e.target.value, true);
        e.target.value = "";
    }
});

chargerPokemons();