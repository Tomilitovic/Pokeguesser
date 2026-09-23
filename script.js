const grid = document.getElementById('pokedex-grid');
const input = document.getElementById('saisie');
const scoreText = document.getElementById('score');

let scoreActuel = 0;
let pokemonsData = {};

// 1. Génération de la grille vide
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

// 2. Chargement des données (incluant les formes alternatives !)
async function chargerPokemons() {
    input.placeholder = "Chargement des Pokémon...";
    input.disabled = true; 

    // On a modifié la requête pour demander aussi les "pokemons" (les formes alternatives : Méga, Alola, etc.)
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
            
            // On récupère tous les IDs de ses formes (ex: Florizarre a la forme normale + la Méga-évolution)
            const toutesLesFormes = espece.pokemons.map(p => p.id);
            
            // On stocke l'ID principal ET le tableau des formes alternatives
            pokemonsData[nomFrancais] = { id: id, formes: toutesLesFormes };
            pokemonsData[nomAnglais] = { id: id, formes: toutesLesFormes }; 
        });

        input.placeholder = "Tapez un nom de Pokémon...";
        input.disabled = false;
        input.focus();
    } catch (erreur) {
        input.placeholder = "Erreur de chargement !";
    }
}

// 3. Fonction pour déclencher les feux d'artifice à la fin
function declencherVictoire() {
    // Le cri de Pikachu (ID 25)
    const criPikachu = new Audio('https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg');
    criPikachu.play();

    // La magie des feux d'artifice
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

// 4. Écoute de la saisie du joueur
input.addEventListener('input', function(e) {
    const texteSaisi = normaliserTexte(e.target.value);
    
    // Si on trouve le Pokémon...
    if (pokemonsData[texteSaisi]) {
        const idPokemon = pokemonsData[texteSaisi].id;
        const formes = pokemonsData[texteSaisi].formes; 
        const box = document.getElementById("box-" + idPokemon);
        
        if (!box.classList.contains('trouve')) {
            box.classList.add('trouve');
            
            // 1. Augmenter et afficher le score
            scoreActuel++;
            scoreText.innerText = scoreActuel;

            // 2. Jouer le cri du Pokémon
            const cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${idPokemon}.ogg`);
            cri.volume = 0.5; // On met le volume à la moitié pour que ça ne soit pas trop fort
            cri.play();
            
            // 3. Afficher l'image (en lui donnant un identifiant unique)
            box.innerHTML = `
                <img id="img-${idPokemon}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formes[0]}.png" alt="Pokemon" style="width: 80px; height: 80px; object-fit: contain;">
                <span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: white;">${e.target.value.toUpperCase()}</span>
            `;
            
            // 4. Si le Pokémon a des formes alternatives (Méga, Alola...), on les fait défiler toutes les 10s
            if (formes.length > 1) {
                let indexForme = 0;
                setInterval(() => {
                    const imgElement = document.getElementById(`img-${idPokemon}`);
                    if (imgElement) {
                        indexForme = (indexForme + 1) % formes.length;
                        imgElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formes[indexForme]}.png`;
                    }
                }, 10000); // 10000 millisecondes = 10 secondes
            }
            
            // On vide la barre
            e.target.value = "";

            // 5. Vérifier si on a gagné le jeu
            if (scoreActuel === 151) {
                input.disabled = true;
                input.placeholder = "INCROYABLE ! VOUS AVEZ FINI !";
                declencherVictoire();
            }
        }
    }
});

// Lancement de la récupération des données
chargerPokemons();