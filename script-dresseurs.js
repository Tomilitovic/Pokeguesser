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
// 1. LE DICTIONNAIRE DES DRESSEURS (Gen 1 à 5)
// =========================================
const bddDresseurs = {
    // --- GÉNÉRATION 1 ---
    'gen1': [
        {
            nom: "Pierre (Argenta)",
            sprite: "pierre.png", 
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF / Let's Go", pokemons: [74, 95] }, 
                { nom: "2nd Passage (Revanche)", pokemons: [76, 95, 139, 141, 142] }
            ]
        },
        {
            nom: "Ondine (Azuria)",
            sprite: "ondine.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF / Let's Go", pokemons: [120, 121] }, 
                { nom: "2nd Passage (Revanche)", pokemons: [55, 122, 131, 121, 130] } 
            ]
        },
        {
            nom: "Major Bob (Carmin sur Mer)",
            sprite: "bob.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [100, 25, 26] }, 
                { nom: "Pokémon Jaune", pokemons: [26] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [100, 81, 26] },
                { nom: "2nd Passage (Revanche)", pokemons: [101, 125, 82, 101, 26] } 
            ]
        },
        {
            nom: "Érika (Céladopole)",
            sprite: "erika.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [71, 114, 45] }, 
                { nom: "Pokémon Jaune", pokemons: [70, 114, 44] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [114, 71, 45] },
                { nom: "2nd Passage (Revanche)", pokemons: [114, 45, 71, 103, 73] } 
            ]
        },
        {
            nom: "Koga (Parmanie)",
            sprite: "koga.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [109, 89, 109, 110] }, 
                { nom: "Pokémon Jaune", pokemons: [48, 48, 48, 49] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [110, 89, 42, 49] },
                { nom: "2nd Passage (Revanche)", pokemons: [110, 89, 49, 73, 42] } 
            ]
        },
        {
            nom: "Morgane (Safrania)",
            sprite: "morgane.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [64, 122, 49, 65] }, 
                { nom: "Pokémon Jaune", pokemons: [63, 64, 65] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [122, 80, 124, 65] },
                { nom: "2nd Passage (Revanche)", pokemons: [122, 80, 124, 65, 97] } 
            ]
        },
        {
            nom: "Auguste (Cramois'Île)",
            sprite: "auguste.png",
            equipes: [
                { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [58, 77, 78, 59] }, 
                { nom: "Pokémon Jaune", pokemons: [38, 78, 59] }, 
                { nom: "Let's Go Pikachu / Évoli", pokemons: [126, 78, 38, 59] },
                { nom: "2nd Passage (Revanche)", pokemons: [126, 78, 38, 59, 105] } 
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
            nom: "Blue / Trace (Maître)",
            sprite: "blue.png",
            equipes: [
                { nom: "RFVF (Starter Plante)", pokemons: [18, 65, 112, 103, 130, 3] }, 
                { nom: "RFVF (Starter Feu)", pokemons: [18, 65, 112, 103, 130, 6] }, 
                { nom: "RFVF (Starter Eau)", pokemons: [18, 65, 112, 103, 59, 9] }, 
                { nom: "Jaune (Aquali)", pokemons: [28, 65, 38, 103, 112, 134] }, 
                { nom: "Jaune (Voltali)", pokemons: [28, 65, 91, 103, 112, 135] }, 
                { nom: "Jaune (Pyroli)", pokemons: [28, 65, 91, 103, 112, 136] }, 
                { nom: "Let's Go (Trace - Starter Évoli)", pokemons: [18, 78, 80, 105, 143, 135] }, 
                { nom: "Let's Go (Trace - Starter Pikachu)", pokemons: [18, 78, 80, 105, 143, 136] } 
            ]
        }
    ],

    // --- GÉNÉRATION 2 ---
    'gen2': [
        {
            nom: "Albert (Mauville)",
            sprite: "albert.png",
            equipes: [ 
                { nom: "Or / Argent / Cristal / HGSS", pokemons: [16, 17] },
                { nom: "2nd Passage (Revanche HGSS)", pokemons: [398, 164, 277, 430, 279, 18] }
            ] 
        },
        {
            nom: "Hector (Écorcia)",
            sprite: "hector.png",
            equipes: [ 
                { nom: "Or / Argent / Cristal / HGSS", pokemons: [11, 14, 123] },
                { nom: "2nd Passage (Revanche HGSS)", pokemons: [292, 416, 127, 214, 469, 212] }
            ] 
        },
        {
            nom: "Blanche (Doublonville)",
            sprite: "blanche.png",
            equipes: [ 
                { nom: "Or / Argent / Cristal / HGSS", pokemons: [35, 241] },
                { nom: "2nd Passage (Revanche HGSS)", pokemons: [463, 301, 36, 417, 424, 241] }
            ] 
        },
        {
            nom: "Mortimer (Rosalia)",
            sprite: "mortimer.png",
            equipes: [ 
                { nom: "Or / Argent / Cristal / HGSS", pokemons: [92, 93, 93, 94] },
                { nom: "2nd Passage (Revanche HGSS)", pokemons: [426, 477, 302, 429, 94, 94] }
            ] 
        },
        {
            nom: "Gaspard (Irisia)",
            sprite: "gaspard.png",
            equipes: [ 
                { nom: "Or / Argent / Cristal / HGSS", pokemons: [57, 62] },
                { nom: "2nd Passage (Revanche HGSS)", pokemons: [308, 107, 106, 286, 57, 62] }
            ] 
        },
        {
            nom: "Jasmine (Oliville)",
            sprite: "jasmine.png",
            equipes: [ 
                { nom: "Or / Argent / Cristal / HGSS", pokemons: [81, 81, 208] },
                { nom: "2nd Passage (Revanche HGSS)", pokemons: [376, 227, 437, 462, 395, 208] }
            ] 
        },
        {
            nom: "Frédo (Acajou)",
            sprite: "fredo.png",
            equipes: [ 
                { nom: "Or / Argent / Cristal / HGSS", pokemons: [86, 87, 221] },
                { nom: "2nd Passage (Revanche HGSS)", pokemons: [460, 87, 362, 478, 365, 473] }
            ] 
        },
        {
            nom: "Sandra (Ébènelle)",
            sprite: "sandra.png",
            equipes: [
                { nom: "Or / Argent / Cristal", pokemons: [148, 148, 148, 230] }, 
                { nom: "HeartGold / SoulSilver", pokemons: [130, 148, 148, 230] },
                { nom: "2nd Passage (Revanche HGSS)", pokemons: [130, 142, 230, 6, 149, 149] } 
            ]
        },
        {
            nom: "Admins Team Rocket",
            sprite: "admin_rocket.png",
            equipes: [ 
                { nom: "Amos (Tour Radio)", pokemons: [41, 109] },
                { nom: "Lambda (Tour Radio)", pokemons: [109, 109, 109, 109, 109, 110] },
                { nom: "Lance (Tour Radio)", pokemons: [24, 198, 45] },
                { nom: "Apollon (Tour Radio)", pokemons: [228, 109, 229] }
            ] 
        },
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
        {
            nom: "Silver (Rival)",
            sprite: "silver.png",
            equipes: [
                { nom: "Combat Final (Starter Plante)", pokemons: [215, 169, 82, 94, 65, 154] }, 
                { nom: "Combat Final (Starter Feu)", pokemons: [215, 169, 82, 94, 65, 157] }, 
                { nom: "Combat Final (Starter Eau)", pokemons: [215, 169, 82, 94, 65, 160] } 
            ]
        },
        {
            nom: "Red (Boss Mont Argenté)",
            sprite: "red_boss.png",
            equipes: [
                { nom: "Équipe Ultime (HGSS)", pokemons: [25, 131, 143, 3, 6, 9] } 
            ]
        }
    ],

    // --- GÉNÉRATION 3 ---
    'gen3': [
        {
            nom: "Roxanne (Mérouville)",
            sprite: "roxanne.png",
            equipes: [
                { nom: "Rubis / Saphir / Émeraude / ROSA", pokemons: [74, 299] },
                { nom: "2nd Passage (Revanche Émeraude)", pokemons: [76, 95, 299, 139, 141] }
            ]
        },
        {
            nom: "Bastien (Myokara)",
            sprite: "bastien.png",
            equipes: [
                { nom: "Rubis / Saphir / ROSA", pokemons: [66, 296] },
                { nom: "Pokémon Émeraude", pokemons: [66, 307, 296] },
                { nom: "2nd Passage (Revanche Émeraude)", pokemons: [68, 308, 237, 106, 297] }
            ]
        },
        {
            nom: "Voltère (Lavandia)",
            sprite: "voltere.png",
            equipes: [
                { nom: "Rubis / Saphir / ROSA", pokemons: [81, 100, 82] },
                { nom: "Pokémon Émeraude", pokemons: [100, 309, 82, 310] },
                { nom: "2nd Passage (Revanche Émeraude)", pokemons: [101, 82, 26, 310, 181] } 
            ]
        },
        {
            nom: "Adriane (Vermilava)",
            sprite: "adriane.png",
            equipes: [
                { nom: "Rubis / Saphir / ROSA", pokemons: [218, 219, 324] },
                { nom: "Pokémon Émeraude", pokemons: [322, 218, 323, 324] },
                { nom: "2nd Passage (Revanche Émeraude)", pokemons: [323, 219, 324, 229, 59] }
            ]
        },
        {
            nom: "Norman (Clémenti-Ville)",
            sprite: "norman.png",
            equipes: [
                { nom: "Rubis / Saphir / ROSA", pokemons: [287, 288, 289] },
                { nom: "Pokémon Émeraude", pokemons: [327, 288, 264, 289] },
                { nom: "2nd Passage (Revanche Émeraude)", pokemons: [289, 289, 115, 128, 242] }
            ]
        },
        {
            nom: "Alizée (Cimetronelle)",
            sprite: "alizee.png",
            equipes: [
                { nom: "Rubis / Saphir / ROSA", pokemons: [277, 357, 279, 334] },
                { nom: "Pokémon Émeraude", pokemons: [333, 357, 279, 227, 334] },
                { nom: "2nd Passage (Revanche Émeraude)", pokemons: [333, 357, 279, 142, 334] }
            ]
        },
        {
            nom: "Lévy & Tatia (Algatia)",
            sprite: "levy_tatia.png",
            equipes: [
                { nom: "Rubis / Saphir / ROSA", pokemons: [337, 338] },
                { nom: "Pokémon Émeraude", pokemons: [344, 178, 337, 338] },
                { nom: "2nd Passage (Revanche Émeraude)", pokemons: [178, 344, 97, 124, 337, 338] }
            ]
        },
        {
            nom: "Marc (Atalanopolis - ROSA)",
            sprite: "marc.png",
            equipes: [
                { nom: "Rubis / Saphir / ROSA", pokemons: [370, 340, 364, 348, 350] }
            ]
        },
        {
            nom: "Juan (Atalanopolis - Émeraude)",
            sprite: "juan.png",
            equipes: [
                { nom: "Pokémon Émeraude", pokemons: [370, 340, 364, 342, 230] },
                { nom: "2nd Passage (Revanche Émeraude)", pokemons: [62, 340, 131, 342, 230] }
            ]
        },
        {
            nom: "Team Magma (Boss & Admins)",
            sprite: "magma.png",
            equipes: [
                { nom: "Max (Boss - Mont Chimnée)", pokemons: [262, 41, 323] },
                { nom: "Courtney (Admin - ROSA)", pokemons: [323] },
                { nom: "Kelvin (Admin - ROSA)", pokemons: [109, 322] }
            ]
        },
        {
            nom: "Team Aqua (Boss & Admins)",
            sprite: "aqua.png",
            equipes: [
                { nom: "Arthur (Boss - ROSA)", pokemons: [262, 42, 319] },
                { nom: "Matthieu (Admin - ROSA)", pokemons: [319] },
                { nom: "Sarah (Admin - ROSA)", pokemons: [89, 318] }
            ]
        },
        {
            nom: "Damien (Conseil 4)",
            sprite: "damien.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [262, 275, 319, 342, 359] },
                { nom: "2nd Passage (Revanche ROSA)", pokemons: [560, 275, 319, 430, 630, 359] } 
            ]
        },
        {
            nom: "Spectra (Conseil 4)",
            sprite: "spectra.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [356, 354, 354, 302, 356] },
                { nom: "2nd Passage (Revanche ROSA)", pokemons: [354, 429, 302, 426, 593, 356] }
            ]
        },
        {
            nom: "Glacia (Conseil 4)",
            sprite: "glacia.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [361, 361, 362, 362, 365] },
                { nom: "2nd Passage (Revanche ROSA)", pokemons: [460, 362, 362, 584, 478, 365] }
            ]
        },
        {
            nom: "Aragon (Conseil 4)",
            sprite: "aragon.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [371, 334, 346, 330, 373] },
                { nom: "2nd Passage (Revanche ROSA)", pokemons: [334, 371, 230, 691, 697, 373] }
            ]
        },
        {
            nom: "Pierre Rochard & Marc (Maîtres)",
            sprite: "pierre_rochard.png",
            equipes: [
                { nom: "Pierre Rochard (Maître ROSA)", pokemons: [227, 344, 306, 346, 348, 376] },
                { nom: "Marc (Maître Émeraude)", pokemons: [321, 73, 272, 340, 130, 350] }
            ]
        },
        {
            nom: "Brice / Flora & Timmy (Rivaux)",
            sprite: "brice_flora.png",
            equipes: [
                { nom: "Flora/Brice (Combat Final)", pokemons: [277, 321, 219, 351, 254] },
                { nom: "Timmy (Route Victoire)", pokemons: [334, 101, 282, 315, 300, 282] },
                { nom: "Timmy (Revanche ROSA)", pokemons: [334, 462, 663, 445, 350, 282] }
            ]
        }
    ],

    // --- GÉNÉRATION 4 ---
    'gen4': [
        {
            nom: "Pierrick (Charbourg)",
            sprite: "pierrick.png",
            equipes: [
                { nom: "Diamant / Perle / Platine / DEPS", pokemons: [74, 95, 408] },
                { nom: "Café Combat / Revanche DEPS", pokemons: [142, 476, 409, 411, 445, 408] }
            ]
        },
        {
            nom: "Flo (Vestigion)",
            sprite: "flo.png",
            equipes: [
                { nom: "Diamant / Perle / DEPS", pokemons: [420, 387, 407] },
                { nom: "Café Combat / Revanche DEPS", pokemons: [189, 275, 428, 460, 389, 407] }
            ]
        },
        {
            nom: "Mélina (Voilaroc)",
            sprite: "melina.png",
            equipes: [
                { nom: "Diamant / Perle / DEPS", pokemons: [67, 308, 448] },
                { nom: "Café Combat / Revanche DEPS", pokemons: [237, 286, 68, 392, 454, 448] }
            ]
        },
        {
            nom: "Lovis (Verchamps)",
            sprite: "lovis.png",
            equipes: [
                { nom: "Diamant / Perle / DEPS", pokemons: [130, 195, 419] },
                { nom: "Café Combat / Revanche DEPS", pokemons: [279, 195, 130, 319, 427, 419] }
            ]
        },
        {
            nom: "Kiméra (Unionpolis)",
            sprite: "kimera.png",
            equipes: [
                { nom: "Diamant / Perle / DEPS", pokemons: [426, 94, 429] },
                { nom: "Café Combat / Revanche DEPS", pokemons: [354, 426, 94, 477, 428, 429] }
            ]
        },
        {
            nom: "Charles (Joliberges)",
            sprite: "charles.png",
            equipes: [
                { nom: "Diamant / Perle / DEPS", pokemons: [436, 208, 411] },
                { nom: "Café Combat / Revanche DEPS", pokemons: [227, 462, 411, 208, 460, 411] }
            ]
        },
        {
            nom: "Gladys (Frimapic)",
            sprite: "gladys.png",
            equipes: [
                { nom: "Diamant / Perle / DEPS", pokemons: [215, 460, 459, 460] }, 
                { nom: "Café Combat / Revanche DEPS", pokemons: [460, 461, 478, 471, 365, 473] }
            ]
        },
        {
            nom: "Tanguy (Rivamar)",
            sprite: "tanguy.png",
            equipes: [
                { nom: "Diamant / Perle / DEPS", pokemons: [26, 424, 224, 466] },
                { nom: "Café Combat / Revanche DEPS", pokemons: [101, 135, 462, 479, 466, 466] }
            ]
        },
        {
            nom: "Team Galaxie (Boss & Admins)",
            sprite: "galaxie.png",
            equipes: [
                { nom: "Hélio (Boss - Colonnes Lances)", pokemons: [430, 130, 461, 169] },
                { nom: "Mars (Admin)", pokemons: [41, 432] },
                { nom: "Jupiter (Admin)", pokemons: [41, 435] },
                { nom: "Saturne (Admin)", pokemons: [64, 436, 454] }
            ]
        },
        {
            nom: "Aaron (Conseil 4)",
            sprite: "aaron.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [269, 416, 452, 454, 469] },
                { nom: "2nd Passage (Revanche DEPS)", pokemons: [469, 461, 416, 452, 454, 469] }
            ]
        },
        {
            nom: "Terry (Conseil 4)",
            sprite: "terry.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [195, 450, 477, 340, 450] },
                { nom: "2nd Passage (Revanche DEPS)", pokemons: [450, 477, 340, 464, 472, 450] }
            ]
        },
        {
            nom: "Adrien (Conseil 4)",
            sprite: "adrien.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [78, 428, 208, 426, 392] },
                { nom: "2nd Passage (Revanche DEPS)", pokemons: [229, 136, 78, 467, 392, 467] }
            ]
        },
        {
            nom: "Lucio (Conseil 4)",
            sprite: "lucio.png",
            equipes: [
                { nom: "1er Passage (Ligue)", pokemons: [122, 203, 437, 65, 438] },
                { nom: "2nd Passage (Revanche DEPS)", pokemons: [122, 196, 437, 65, 475, 438] }
            ]
        },
        {
            nom: "Cynthia (Maître de la Ligue)",
            sprite: "cynthia.png",
            equipes: [
                { nom: "1er Passage (Diamant / Perle / DEPS)", pokemons: [442, 407, 448, 468, 350, 445] },
                { nom: "2nd Passage (Revanche DEPS)", pokemons: [442, 407, 468, 448, 350, 445] }
            ]
        },
        {
            nom: "René (Rival)",
            sprite: "rene.png",
            equipes: [
                { nom: "Combat Final (Starter Plante)", pokemons: [398, 407, 143, 214, 78, 395] },
                { nom: "Combat Final (Starter Feu)", pokemons: [398, 407, 143, 214, 419, 389] },
                { nom: "Combat Final (Starter Eau)", pokemons: [398, 407, 143, 214, 78, 392] }
            ]
        }
    ],

    // --- GÉNÉRATION 5 ---
    'gen5': [
        {
            nom: "Rachid, Noa, Armando (Ogoesse)",
            sprite: "r_n_a.png",
            equipes: [
                { nom: "Rachid (Noir / Blanc)", pokemons: [506, 511] },
                { nom: "Noa (Noir / Blanc)", pokemons: [506, 513] },
                { nom: "Armando (Noir / Blanc)", pokemons: [506, 515] }
            ]
        },
        {
            nom: "Aloé (Maillard)",
            sprite: "aloe.png",
            equipes: [
                { nom: "Noir / Blanc", pokemons: [507, 505] }
            ]
        },
        {
            nom: "Artie (Volucité)",
            sprite: "artie.png",
            equipes: [
                { nom: "Noir / Blanc", pokemons: [544, 558, 542] },
                { nom: "Noir 2 / Blanc 2", pokemons: [541, 558, 542] }
            ]
        },
        {
            nom: "Inezia (Méanville)",
            sprite: "inezia.png",
            equipes: [
                { nom: "Noir / Blanc", pokemons: [587, 587, 523] },
                { nom: "Noir 2 / Blanc 2", pokemons: [587, 180, 523] }
            ]
        },
        {
            nom: "Bardane (Port Yoneuve)",
            sprite: "bardane.png",
            equipes: [
                { nom: "Noir / Blanc", pokemons: [552, 536, 530] },
                { nom: "Noir 2 / Blanc 2", pokemons: [552, 329, 530] }
            ]
        },
        {
            nom: "Carolina (Parsemille)",
            sprite: "carolina.png",
            equipes: [
                { nom: "Noir / Blanc", pokemons: [528, 528, 581] },
                { nom: "Noir 2 / Blanc 2", pokemons: [528, 227, 581] }
            ]
        },
        {
            nom: "Zhu (Flocombe)",
            sprite: "zhu.png",
            equipes: [
                { nom: "Noir / Blanc", pokemons: [583, 615, 614] }
            ]
        },
        {
            nom: "Watson & Iris (Janusia)",
            sprite: "watson_iris.png",
            equipes: [
                { nom: "Noir / Blanc", pokemons: [610, 621, 612] },
                { nom: "Watson (Noir 2 / Blanc 2)", pokemons: [621, 330, 612] }
            ]
        },
        {
            nom: "Tcheren (Pavonnay)",
            sprite: "tcheren_arene.png",
            equipes: [
                { nom: "Noir 2 / Blanc 2", pokemons: [504, 507] }
            ]
        },
        {
            nom: "Strykna (Ondes-sur-Mer)",
            sprite: "strykna.png",
            equipes: [
                { nom: "Noir 2 / Blanc 2", pokemons: [109, 544] }
            ]
        },
        {
            nom: "Amana (Papeloa)",
            sprite: "amana.png",
            equipes: [
                { nom: "Noir 2 / Blanc 2", pokemons: [565, 563, 593] }
            ]
        },
        {
            nom: "Team Plasma (Boss & Admins)",
            sprite: "plasma.png",
            equipes: [
                { nom: "N (Combat Final NB)", pokemons: [643, 584, 601, 567, 581, 604] },
                { nom: "Ghetis (Combat Final NB)", pokemons: [563, 626, 565, 537, 604, 635] },
                { nom: "Nikolaï (Boss NB2)", pokemons: [82, 462, 606, 603, 601, 601] }
            ]
        },
        {
            nom: "Anis (Conseil 4)",
            sprite: "anis.png",
            equipes: [
                { nom: "1er Passage (Ligue NB/NB2)", pokemons: [563, 623, 593, 609] },
                { nom: "2nd Passage (Revanche NB2)", pokemons: [563, 623, 426, 354, 593, 609] }
            ]
        },
        {
            nom: "Pieris (Conseil 4)",
            sprite: "pieris.png",
            equipes: [
                { nom: "1er Passage (Ligue NB/NB2)", pokemons: [560, 553, 530, 625] },
                { nom: "2nd Passage (Revanche NB2)", pokemons: [560, 553, 430, 229, 530, 625] }
            ]
        },
        {
            nom: "Percila (Conseil 4)",
            sprite: "percila.png",
            equipes: [
                { nom: "1er Passage (Ligue NB/NB2)", pokemons: [579, 561, 518, 576] },
                { nom: "2nd Passage (Revanche NB2)", pokemons: [579, 561, 376, 437, 518, 576] }
            ]
        },
        {
            nom: "Kunz (Conseil 4)",
            sprite: "kunz.png",
            equipes: [
                { nom: "1er Passage (Ligue NB/NB2)", pokemons: [538, 539, 534, 620] },
                { nom: "2nd Passage (Revanche NB2)", pokemons: [538, 539, 448, 308, 534, 620] }
            ]
        },
        {
            nom: "Goyah & Iris (Maîtres)",
            sprite: "goyah_iris.png",
            equipes: [
                { nom: "Goyah (Ligue Noir / Blanc)", pokemons: [617, 626, 584, 589, 621, 637] },
                { nom: "Iris (Ligue Noir 2 / Blanc 2)", pokemons: [635, 621, 306, 131, 567, 612] }
            ]
        },
        {
            nom: "Tcheren, Bel, Matis (Rivaux)",
            sprite: "rivaux_5g.png",
            equipes: [
                { nom: "Tcheren (Combat Final NB)", pokemons: [520, 512, 510, 521] }, 
                { nom: "Bel (Combat Final NB)", pokemons: [508, 514, 518, 503] }, 
                { nom: "Matis (Combat Final NB2)", pokemons: [520, 521, 626, 512, 500] } 
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
    else if (regionKey === 'gen3') titreRegion = "Génération 3 (Hoenn)";
    else if (regionKey === 'gen4') titreRegion = "Génération 4 (Sinnoh)";
    else if (regionKey === 'gen5') titreRegion = "Génération 5 (Unys)";

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