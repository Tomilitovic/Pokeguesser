const grid = document.getElementById('pokedex-grid');
const input = document.getElementById('saisie');

// 1. On crée la grille vide de 151 cases (comme on l'a fait précédemment)
for (let i = 1; i <= 151; i++) {
    let box = document.createElement('div');
    box.classList.add('pokemon-box');
    box.id = "box-" + i;
    let numeroFormate = "#" + i.toString().padStart(3, '0');
    box.innerHTML = `<span class="numero">${numeroFormate}</span>`;
    grid.appendChild(box);
}

// 2. On prépare un dictionnaire vide en mémoire pour stocker les noms
let pokemonsData = {};

// 3. Fonction pour nettoyer le texte : enlève les majuscules et les accents (ex: transforme "Évoli" en "evoli")
function normaliserTexte(texte) {
    return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// 4. On récupère les données des 151 Pokémon d'un seul coup (Version mise à jour v1beta2)
async function chargerPokemons() {
    input.placeholder = "Chargement de la base de données...";
    input.disabled = true; // On bloque la saisie le temps du chargement

    // Nouvelle requête GraphQL sans le vieux préfixe 'pokemon_v2_'
    const requeteGraphQL = `
    query {
      pokemonspecies(where: {id: {_lte: 151}}) {
        id
        name
        pokemonspeciesnames(where: {language_id: {_eq: 5}}) {
          name
        }
      }
    }`;

    try {
        // On utilise la nouvelle adresse v1beta2
        const reponse = await fetch('https://graphql.pokeapi.co/v1beta2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: requeteGraphQL })
        });
        const data = await reponse.json();
        
        // On range les données reçues dans notre dictionnaire
        data.data.pokemonspecies.forEach(pokemon => {
            const id = pokemon.id;
            const nomAnglais = normaliserTexte(pokemon.name);
            const nomFrancais = normaliserTexte(pokemon.pokemonspeciesnames[0].name);
            
            // On associe les deux noms à l'identifiant
            pokemonsData[nomFrancais] = id;
            pokemonsData[nomAnglais] = id; 
        });

        // Le chargement est fini, on réactive la barre !
        input.placeholder = "Tapez un nom de Pokémon (FR ou EN)...";
        input.disabled = false;
        input.focus();
    } catch (erreur) {
        input.placeholder = "Erreur de chargement de la PokéAPI !";
        console.error(erreur);
    }
}

// 5. On écoute en direct chaque lettre tapée au clavier
input.addEventListener('input', function(e) {
    // On nettoie ce que le joueur vient de taper (pas de majuscule, pas d'accent)
    const texteSaisi = normaliserTexte(e.target.value);
    
    // Si le texte correspond exactement à un Pokémon de notre dictionnaire...
    if (pokemonsData[texteSaisi]) {
        const idPokemon = pokemonsData[texteSaisi];
        
        // On cible la bonne case correspondante
        const box = document.getElementById("box-" + idPokemon);
        
        // On vérifie qu'elle n'a pas déjà été trouvée
        if (!box.classList.contains('trouve')) {
            // On lui ajoute la classe CSS 'trouve' pour la bordure verte
            box.classList.add('trouve');
            
            // On construit le lien de l'image officielle HD
            const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idPokemon}.png`;
            
            // On remplace le numéro gris par l'image et le nom que le joueur a tapé
            box.innerHTML = `
                <img src="${imageUrl}" alt="Pokemon ${idPokemon}" style="width: 80px; height: 80px; object-fit: contain;">
                <span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: white;">${e.target.value.toUpperCase()}</span>
            `;
            
            // On vide instantanément la barre de recherche pour passer au suivant !
            e.target.value = "";
        }
    }
});

// On lance la fonction de chargement dès l'ouverture de la page
chargerPokemons();