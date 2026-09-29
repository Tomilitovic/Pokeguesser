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
// 1. LE GRAND DICTIONNAIRE DES DRESSEURS (Générations 1 à 9)
// =========================================
const bddDresseurs = {

    'gen1': [
        { nom: "Pierre (Argenta)", sprite: "pierre.png", equipes: [ { nom: "Rouge / Bleu / Vert / RFVF / Let's Go", pokemons: [74, 95] }, { nom: "2nd Passage (Revanche)", pokemons: [76, 95, 139, 141, 142] } ] },
        { nom: "Ondine (Azuria)", sprite: "ondine.png", equipes: [ { nom: "Rouge / Bleu / Vert / RFVF / Let's Go", pokemons: [120, 121] }, { nom: "2nd Passage (Revanche)", pokemons: [55, 122, 131, 121, 130] } ] },
        { nom: "Major Bob (Carmin sur Mer)", sprite: "bob.png", equipes: [ { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [100, 25, 26] }, { nom: "Let's Go Pikachu / Évoli", pokemons: [100, 81, 26] }, { nom: "2nd Passage (Revanche)", pokemons: [101, 125, 82, 101, 26] } ] },
        { nom: "Érika (Céladopole)", sprite: "erika.png", equipes: [ { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [71, 114, 45] }, { nom: "2nd Passage (Revanche)", pokemons: [114, 45, 71, 103, 73] } ] },
        { nom: "Koga (Parmanie)", sprite: "koga.png", equipes: [ { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [109, 89, 109, 110] }, { nom: "2nd Passage (Revanche)", pokemons: [110, 89, 49, 73, 42] } ] },
        { nom: "Morgane (Safrania)", sprite: "morgane.png", equipes: [ { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [64, 122, 49, 65] }, { nom: "2nd Passage (Revanche)", pokemons: [122, 80, 124, 65, 97] } ] },
        { nom: "Auguste (Cramois'Île)", sprite: "auguste.png", equipes: [ { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [58, 77, 78, 59] }, { nom: "2nd Passage (Revanche)", pokemons: [126, 78, 38, 59, 105] } ] },
        { nom: "Giovanni (Jadielle)", sprite: "giovanni.png", equipes: [ { nom: "Rouge / Bleu / Vert / RFVF", pokemons: [111, 51, 31, 34, 112] }, { nom: "Let's Go Pikachu / Évoli", pokemons: [51, 31, 34, 112] } ] },
        { nom: "Conseil 4 (Ligue)", sprite: "ligue1.png", equipes: [ { nom: "Olga", pokemons: [87, 91, 80, 124, 131] }, { nom: "Aldo", pokemons: [95, 107, 106, 95, 68] }, { nom: "Agatha", pokemons: [94, 42, 93, 24, 94] }, { nom: "Peter", pokemons: [130, 148, 148, 142, 149] } ] },
        { nom: "Blue / Trace (Maître)", sprite: "blue.png", equipes: [ { nom: "RFVF (Starter Plante)", pokemons: [18, 65, 112, 103, 130, 3] }, { nom: "RFVF (Starter Feu)", pokemons: [18, 65, 112, 103, 130, 6] }, { nom: "RFVF (Starter Eau)", pokemons: [18, 65, 112, 103, 59, 9] }, { nom: "Let's Go (Trace - Starter Évoli)", pokemons: [18, 78, 80, 105, 143, 135] }, { nom: "Let's Go (Trace - Starter Pikachu)", pokemons: [18, 78, 80, 105, 143, 136] } ] }
    ],

    'gen2': [
        { nom: "Albert (Mauville)", sprite: "albert.png", equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [16, 17] }, { nom: "2nd Passage (Revanche HGSS)", pokemons: [398, 164, 277, 430, 279, 18] } ] },
        { nom: "Hector (Écorcia)", sprite: "hector.png", equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [11, 14, 123] }, { nom: "2nd Passage (Revanche HGSS)", pokemons: [292, 416, 127, 214, 469, 212] } ] },
        { nom: "Blanche (Doublonville)", sprite: "blanche.png", equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [35, 241] }, { nom: "2nd Passage (Revanche HGSS)", pokemons: [463, 301, 36, 417, 424, 241] } ] },
        { nom: "Mortimer (Rosalia)", sprite: "mortimer.png", equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [92, 93, 93, 94] }, { nom: "2nd Passage (Revanche HGSS)", pokemons: [426, 477, 302, 429, 94, 94] } ] },
        { nom: "Gaspard (Irisia)", sprite: "gaspard.png", equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [57, 62] }, { nom: "2nd Passage (Revanche HGSS)", pokemons: [308, 107, 106, 286, 57, 62] } ] },
        { nom: "Jasmine (Oliville)", sprite: "jasmine.png", equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [81, 81, 208] }, { nom: "2nd Passage (Revanche HGSS)", pokemons: [376, 227, 437, 462, 395, 208] } ] },
        { nom: "Frédo (Acajou)", sprite: "fredo.png", equipes: [ { nom: "Or / Argent / Cristal / HGSS", pokemons: [86, 87, 221] }, { nom: "2nd Passage (Revanche HGSS)", pokemons: [460, 87, 362, 478, 365, 473] } ] },
        { nom: "Sandra (Ébènelle)", sprite: "sandra.png", equipes: [ { nom: "HeartGold / SoulSilver", pokemons: [130, 148, 148, 230] }, { nom: "2nd Passage (Revanche HGSS)", pokemons: [130, 142, 230, 6, 149, 149] } ] },
        { nom: "Admins Team Rocket", sprite: "admin_rocket.png", equipes: [ { nom: "Amos (Tour Radio)", pokemons: [41, 109] }, { nom: "Lambda (Tour Radio)", pokemons: [109, 109, 109, 109, 109, 110] }, { nom: "Lance (Tour Radio)", pokemons: [24, 198, 45] }, { nom: "Apollon (Tour Radio)", pokemons: [228, 109, 229] } ] },
        { nom: "Conseil 4 (Ligue)", sprite: "ligue2.png", equipes: [ { nom: "Clément (2nd Passage)", pokemons: [437, 124, 326, 80, 282, 178] }, { nom: "Koga (2nd Passage)", pokemons: [435, 49, 317, 89, 454, 169] }, { nom: "Aldo (2nd Passage)", pokemons: [237, 107, 106, 297, 448, 68] }, { nom: "Marion (2nd Passage)", pokemons: [461, 442, 359, 430, 229, 197] } ] },
        { nom: "Peter (Maître de la Ligue)", sprite: "peter_maitre.png", equipes: [ { nom: "1er Passage (Ligue)", pokemons: [130, 149, 149, 142, 6, 149] }, { nom: "2nd Passage (Remakes HGSS)", pokemons: [373, 445, 334, 142, 6, 149] } ] },
        { nom: "Silver & Red", sprite: "silver_red.png", equipes: [ { nom: "Silver (Combat Final - Méganium)", pokemons: [215, 169, 82, 94, 65, 154] }, { nom: "Silver (Combat Final - Typhlosion)", pokemons: [215, 169, 82, 94, 65, 157] }, { nom: "Silver (Combat Final - Aligatueur)", pokemons: [215, 169, 82, 94, 65, 160] }, { nom: "Red (Boss Mont Argenté)", pokemons: [25, 131, 143, 3, 6, 9] } ] }
    ],

    'gen3': [
        { nom: "Roxanne (Mérouville)", sprite: "roxanne.png", equipes: [ { nom: "Rubis / Saphir / ROSA", pokemons: [74, 299] }, { nom: "2nd Passage (Revanche)", pokemons: [76, 95, 299, 139, 141] } ] },
        { nom: "Bastien (Myokara)", sprite: "bastien.png", equipes: [ { nom: "Rubis / Saphir / ROSA", pokemons: [66, 296] }, { nom: "2nd Passage (Revanche)", pokemons: [68, 308, 237, 106, 297] } ] },
        { nom: "Voltère (Lavandia)", sprite: "voltere.png", equipes: [ { nom: "Rubis / Saphir / ROSA", pokemons: [81, 100, 82] }, { nom: "2nd Passage (Revanche)", pokemons: [101, 82, 26, 310, 181] } ] },
        { nom: "Adriane (Vermilava)", sprite: "adriane.png", equipes: [ { nom: "Rubis / Saphir / ROSA", pokemons: [218, 219, 324] }, { nom: "2nd Passage (Revanche)", pokemons: [323, 219, 324, 229, 59] } ] },
        { nom: "Norman (Clémenti-Ville)", sprite: "norman.png", equipes: [ { nom: "Rubis / Saphir / ROSA", pokemons: [287, 288, 289] }, { nom: "2nd Passage (Revanche)", pokemons: [289, 289, 115, 128, 242] } ] },
        { nom: "Alizée (Cimetronelle)", sprite: "alizee.png", equipes: [ { nom: "Rubis / Saphir / ROSA", pokemons: [277, 357, 279, 334] }, { nom: "2nd Passage (Revanche)", pokemons: [333, 357, 279, 142, 334] } ] },
        { nom: "Lévy & Tatia (Algatia)", sprite: "levy_tatia.png", equipes: [ { nom: "Rubis / Saphir / ROSA", pokemons: [337, 338] }, { nom: "2nd Passage (Revanche)", pokemons: [178, 344, 97, 124, 337, 338] } ] },
        { nom: "Marc / Juan (Atalanopolis)", sprite: "marc_juan.png", equipes: [ { nom: "Marc (ROSA)", pokemons: [370, 340, 364, 348, 350] }, { nom: "Juan (Émeraude)", pokemons: [370, 340, 364, 342, 230] } ] },
        { nom: "Team Magma & Aqua (Boss)", sprite: "magma_aqua.png", equipes: [ { nom: "Max (Boss Magma)", pokemons: [262, 41, 323] }, { nom: "Arthur (Boss Aqua)", pokemons: [262, 42, 319] } ] },
        { nom: "Conseil 4 (Ligue)", sprite: "ligue3.png", equipes: [ { nom: "Damien (Revanche ROSA)", pokemons: [560, 275, 319, 430, 630, 359] }, { nom: "Spectra (Revanche ROSA)", pokemons: [354, 429, 302, 426, 593, 356] }, { nom: "Glacia (Revanche ROSA)", pokemons: [460, 362, 362, 584, 478, 365] }, { nom: "Aragon (Revanche ROSA)", pokemons: [334, 371, 230, 691, 697, 373] } ] },
        { nom: "Pierre Rochard & Marc (Maîtres)", sprite: "pierre_rochard.png", equipes: [ { nom: "Pierre Rochard (Maître ROSA)", pokemons: [227, 344, 306, 346, 348, 376] }, { nom: "Marc (Maître Émeraude)", pokemons: [321, 73, 272, 340, 130, 350] } ] },
        { nom: "Brice / Flora & Timmy (Rivaux)", sprite: "brice_flora.png", equipes: [ { nom: "Flora/Brice (Combat Final)", pokemons: [277, 321, 219, 351, 254] }, { nom: "Timmy (Revanche Ultime ROSA)", pokemons: [334, 462, 663, 445, 350, 282] } ] }
    ],

    // --- GÉNÉRATION 4 (AVEC LES PARTENAIRES CAFE COMBAT) ---
    'gen4': [
        { nom: "Pierrick (Charbourg)", sprite: "pierrick.png", equipes: [ { nom: "Diamant / Perle / DEPS", pokemons: [74, 95, 408] }, { nom: "Café Combat (Platine)", pokemons: [142, 476, 409, 411, 248, 76] }, { nom: "2nd Passage (Revanche DEPS)", pokemons: [248, 142, 348, 346, 369, 409] } ] },
        { nom: "Flo (Vestigion)", sprite: "flo.png", equipes: [ { nom: "Diamant / Perle / DEPS", pokemons: [420, 387, 407] }, { nom: "Café Combat (Platine)", pokemons: [189, 421, 182, 275, 389, 407] }, { nom: "2nd Passage (Revanche DEPS)", pokemons: [189, 192, 421, 455, 389, 407] } ] },
        { nom: "Mélina (Voilaroc)", sprite: "melina.png", equipes: [ { nom: "Diamant / Perle / DEPS", pokemons: [67, 308, 448] }, { nom: "Café Combat (Platine)", pokemons: [237, 286, 68, 392, 454, 448] }, { nom: "2nd Passage (Revanche DEPS)", pokemons: [237, 286, 454, 68, 392, 448] } ] },
        { nom: "Lovis (Verchamps)", sprite: "lovis.png", equipes: [ { nom: "Diamant / Perle / DEPS", pokemons: [130, 195, 419] }, { nom: "Café Combat (Platine)", pokemons: [319, 195, 419, 130, 272, 279] }, { nom: "2nd Passage (Revanche DEPS)", pokemons: [186, 195, 130, 279, 272, 419] } ] },
        { nom: "Kiméra (Unionpolis)", sprite: "kimera.png", equipes: [ { nom: "Diamant / Perle / DEPS", pokemons: [426, 94, 429] }, { nom: "Platine (Aventure)", pokemons: [355, 93, 429] }, { nom: "Café Combat (Platine)", pokemons: [354, 426, 477, 429, 94, 478] }, { nom: "2nd Passage (Revanche DEPS)", pokemons: [354, 426, 94, 477, 478, 429] } ] },
        { nom: "Charles (Joliberges)", sprite: "charles.png", equipes: [ { nom: "Diamant / Perle / DEPS", pokemons: [436, 208, 411] }, { nom: "Café Combat (Platine)", pokemons: [227, 208, 462, 411, 306, 476] }, { nom: "2nd Passage (Revanche DEPS)", pokemons: [227, 208, 462, 476, 306, 411] } ] },
        { nom: "Gladys (Frimapic)", sprite: "gladys.png", equipes: [ { nom: "Diamant / Perle / DEPS", pokemons: [459, 215, 308, 460] }, { nom: "Café Combat (Platine)", pokemons: [460, 461, 478, 471, 365, 473] }, { nom: "2nd Passage (Revanche DEPS)", pokemons: [460, 124, 461, 478, 471, 473] } ] },
        { nom: "Tanguy (Rivamar)", sprite: "tanguy.png", equipes: [ { nom: "Diamant / Perle / DEPS", pokemons: [26, 424, 224, 466] }, { nom: "Café Combat (Platine)", pokemons: [135, 26, 405, 171, 466, 462] }, { nom: "2nd Passage (Revanche DEPS)", pokemons: [479, 26, 405, 135, 466, 462] } ] },
        {
            nom: "Partenaires (Café Combat)", sprite: "partenaires_gen4.png", 
            equipes: [
                { nom: "Sara", pokemons: [202, 426, 297, 350, 242] },
                { nom: "Maïté", pokemons: [474, 94, 462, 468, 65] },
                { nom: "Armand", pokemons: [359, 217, 373, 376, 448] },
                { nom: "Viviane", pokemons: [291, 101, 169, 461, 59] },
                { nom: "Cornil", pokemons: [213, 477, 476, 197, 344] }
            ]
        },
        { nom: "Team Galaxie", sprite: "galaxie.png", equipes: [ { nom: "Hélio (Boss - Colonnes Lances)", pokemons: [430, 130, 461, 169] }, { nom: "Saturne (Admin)", pokemons: [64, 436, 454] } ] },
        { nom: "Conseil 4 (Ligue)", sprite: "ligue4.png", equipes: [ { nom: "Aaron (DP / DEPS 1er)", pokemons: [269, 267, 416, 214, 452] }, { nom: "Aaron (Revanche DEPS)", pokemons: [469, 212, 416, 214, 452, 330] }, { nom: "Terry (DP / DEPS 1er)", pokemons: [195, 185, 76, 340, 450] }, { nom: "Terry (Revanche DEPS)", pokemons: [340, 472, 34, 473, 464, 450] }, { nom: "Adrien (DP / DEPS 1er)", pokemons: [78, 208, 426, 428, 392] }, { nom: "Adrien (Revanche DEPS)", pokemons: [38, 229, 59, 78, 392, 467] }, { nom: "Lucio (DP / DEPS 1er)", pokemons: [122, 203, 308, 65, 437] }, { nom: "Lucio (Revanche DEPS)", pokemons: [122, 196, 80, 437, 65, 475] } ] },
        { nom: "Cynthia (Maître de la Ligue)", sprite: "cynthia.png", equipes: [ { nom: "1er Passage (DP / DEPS)", pokemons: [442, 407, 423, 448, 350, 445] }, { nom: "Revanche Ultime (DEPS)", pokemons: [442, 407, 468, 448, 350, 445] } ] },
        { nom: "René (Rival)", sprite: "rene.png", equipes: [ { nom: "Combat Final (Starter Plante)", pokemons: [398, 407, 143, 214, 78, 395] }, { nom: "Combat Final (Starter Feu)", pokemons: [398, 407, 143, 214, 419, 389] }, { nom: "Combat Final (Starter Eau)", pokemons: [398, 407, 143, 214, 78, 392] } ] }
    ],

    'gen5': [
        { nom: "Rachid, Noa, Armando", sprite: "r_n_a.png", equipes: [ { nom: "Ogoesse", pokemons: [506, 511, 513, 515] } ] },
        { nom: "Aloé & Tcheren", sprite: "aloe_tcheren.png", equipes: [ { nom: "Aloé (Noir/Blanc)", pokemons: [507, 505] }, { nom: "Tcheren (Arène N2/B2)", pokemons: [504, 507] } ] },
        { nom: "Artie (Volucité)", sprite: "artie.png", equipes: [ { nom: "Noir 2 / Blanc 2", pokemons: [541, 558, 542] } ] },
        { nom: "Inezia (Méanville)", sprite: "inezia.png", equipes: [ { nom: "Noir 2 / Blanc 2", pokemons: [587, 180, 523] } ] },
        { nom: "Bardane (Port Yoneuve)", sprite: "bardane.png", equipes: [ { nom: "Noir 2 / Blanc 2", pokemons: [552, 329, 530] } ] },
        { nom: "Carolina (Parsemille)", sprite: "carolina.png", equipes: [ { nom: "Noir 2 / Blanc 2", pokemons: [528, 227, 581] } ] },
        { nom: "Zhu & Strykna", sprite: "zhu_strykna.png", equipes: [ { nom: "Zhu (Flocombe - NB)", pokemons: [583, 615, 614] }, { nom: "Strykna (Ondes-sur-Mer - N2/B2)", pokemons: [109, 544] } ] },
        { nom: "Watson, Iris, Amana", sprite: "watson_iris_amana.png", equipes: [ { nom: "Watson (Janusia N2/B2)", pokemons: [621, 330, 612] }, { nom: "Amana (Papeloa N2/B2)", pokemons: [565, 563, 593] } ] },
        { nom: "Team Plasma", sprite: "plasma.png", equipes: [ { nom: "N (Combat Final NB)", pokemons: [643, 584, 601, 567, 581, 604] }, { nom: "Ghetis (Combat Final NB)", pokemons: [563, 626, 565, 537, 604, 635] }, { nom: "Nikolaï (Boss N2B2)", pokemons: [82, 462, 606, 603, 601, 601] } ] },
        { nom: "Conseil 4 (Ligue)", sprite: "ligue5.png", equipes: [ { nom: "Anis (Revanche N2B2)", pokemons: [563, 623, 426, 354, 593, 609] }, { nom: "Pieris (Revanche N2B2)", pokemons: [560, 553, 430, 229, 530, 625] }, { nom: "Percila (Revanche N2B2)", pokemons: [579, 561, 376, 437, 518, 576] }, { nom: "Kunz (Revanche N2B2)", pokemons: [538, 539, 448, 308, 534, 620] } ] },
        { nom: "Goyah & Iris (Maîtres)", sprite: "goyah_iris.png", equipes: [ { nom: "Goyah (Ligue Noir / Blanc)", pokemons: [617, 626, 584, 589, 621, 637] }, { nom: "Iris (Ligue Noir 2 / Blanc 2)", pokemons: [635, 621, 306, 131, 567, 612] } ] },
        { nom: "Rivaux (Tcheren, Bel, Matis)", sprite: "rivaux_5g.png", equipes: [ { nom: "Tcheren (Combat Final NB)", pokemons: [520, 512, 510, 521] }, { nom: "Matis (Combat Final N2B2)", pokemons: [520, 521, 626, 512, 500] } ] }
    ],

    'gen6': [
        { nom: "Violette (Neuvartault)", sprite: "violette.png", equipes: [ { nom: "1er Passage", pokemons: [283, 666] }, { nom: "2nd Passage (Château de Combat)", pokemons: [284, 469, 666] } ] },
        { nom: "Lino (Relifac-le-Haut)", sprite: "lino.png", equipes: [ { nom: "1er Passage", pokemons: [696, 698] }, { nom: "2nd Passage (Château de Combat)", pokemons: [696, 698, 697] } ] },
        { nom: "Cornélia (Yantra)", sprite: "cornelia.png", equipes: [ { nom: "1er Passage", pokemons: [619, 66, 701] }, { nom: "2nd Passage (Château de Combat)", pokemons: [66, 619, 701, 448] } ] },
        { nom: "Amaro (Port Tempères)", sprite: "amaro.png", equipes: [ { nom: "1er Passage", pokemons: [189, 673, 70] }, { nom: "2nd Passage (Château de Combat)", pokemons: [189, 673, 70, 71] } ] },
        { nom: "Lem (Illumis)", sprite: "lem.png", equipes: [ { nom: "1er Passage", pokemons: [587, 82, 695] }, { nom: "2nd Passage (Château de Combat)", pokemons: [587, 462, 695, 82] } ] },
        { nom: "Valériane (Romant-sous-Bois)", sprite: "valeriane.png", equipes: [ { nom: "1er Passage", pokemons: [303, 122, 700] }, { nom: "2nd Passage (Château de Combat)", pokemons: [303, 122, 700, 683] } ] },
        { nom: "Astéra (Flusselles)", sprite: "astera.png", equipes: [ { nom: "1er Passage", pokemons: [561, 199, 678] }, { nom: "2nd Passage (Château de Combat)", pokemons: [561, 199, 678, 282] } ] },
        { nom: "Urup (Auffrac-les-Congères)", sprite: "urup.png", equipes: [ { nom: "1er Passage", pokemons: [460, 615, 713] }, { nom: "2nd Passage (Château de Combat)", pokemons: [460, 615, 713, 365] } ] },
        { nom: "Team Flare", sprite: "flare.png", equipes: [ { nom: "Lysandre (Boss Final)", pokemons: [619, 468, 668, 130] }, { nom: "Xanthin (Admin)", pokemons: [691, 687] } ] },
        { nom: "Conseil 4 (Ligue)", sprite: "ligue6.png", equipes: [ { nom: "Malva (Feu)", pokemons: [668, 219, 323, 663] }, { nom: "Narcisse (Eau)", pokemons: [689, 121, 130, 693] }, { nom: "Thyméo (Acier)", pokemons: [707, 476, 212, 681] }, { nom: "Dracéna (Dragon)", pokemons: [691, 334, 621, 715] } ] },
        { nom: "Dianthéa (Maître)", sprite: "dianthea.png", equipes: [ { nom: "Ligue (X/Y)", pokemons: [701, 697, 699, 711, 706, 282] } ] },
        { nom: "Serena / Kalem (Rival)", sprite: "serena_kalem.png", equipes: [ { nom: "Combat Final Post-Game (Starter Plante)", pokemons: [461, 35, 135, 334, 359, 652] }, { nom: "Combat Final Post-Game (Starter Feu)", pokemons: [461, 35, 134, 334, 359, 655] }, { nom: "Combat Final Post-Game (Starter Eau)", pokemons: [461, 35, 136, 334, 359, 658] } ] }
    ],

    'gen7': [
        { nom: "Doyens d'Alola (Kahunas)", sprite: "doyens.png", equipes: [ { nom: "Pectorius (Mele-Mele)", pokemons: [66, 296, 740] }, { nom: "Alyxia (Akala)", pokemons: [299, 347, 745] }, { nom: "Danh (Ula-Ula)", pokemons: [302, 552, 53] }, { nom: "Paulie (Poni)", pokemons: [51, 423, 750, 330] } ] },
        { nom: "Team Skull & Fondation Æther", sprite: "skull_aether.png", equipes: [ { nom: "Guzma (Boss Skull)", pokemons: [768, 284, 127, 168] }, { nom: "Apocyne (Admin Skull)", pokemons: [41, 758] }, { nom: "Elsa-Mina (Boss Æther)", pokemons: [36, 549, 760, 428, 350] } ] },
        { nom: "Conseil 4 (Ligue Alola)", sprite: "ligue7.png", equipes: [ { nom: "Pectorius (Combat / Soleil-Lune)", pokemons: [297, 56, 62, 740, 750] }, { nom: "Molène (Acier / Ultra S-L)", pokemons: [707, 462, 212, 51, 376] }, { nom: "Alyxia (Roche)", pokemons: [369, 703, 348, 766, 745] }, { nom: "Margie (Spectre)", pokemons: [302, 426, 781, 478, 769] }, { nom: "Kahili (Vol)", pokemons: [227, 701, 741, 628, 733] } ] },
        { nom: "Euclide & Tili (Maîtres/Rivaux)", sprite: "euclide_tili.png", equipes: [ { nom: "Euclide (Défense du Titre - Soleil/Lune)", pokemons: [745, 143, 628, 38, 462, 724] }, { nom: "Tili (Défense du Titre - Ultra S/L)", pokemons: [26, 727, 471, 738, 66] }, { nom: "Gladio (Défense du Titre)", pokemons: [169, 448, 773, 134, 745, 474] } ] }
    ],

    'gen8': [
        { nom: "Percy (Plante)", sprite: "percy.png", equipes: [ { nom: "1er Passage", pokemons: [829, 830] }, { nom: "2nd Passage (Tournoi des Champions)", pokemons: [275, 45, 830, 762, 842] } ] },
        { nom: "Donna (Eau)", sprite: "donna.png", equipes: [ { nom: "1er Passage", pokemons: [118, 846, 834] }, { nom: "2nd Passage (Tournoi des Champions)", pokemons: [768, 279, 119, 846, 834] } ] },
        { nom: "Kabu (Feu)", sprite: "kabu.png", equipes: [ { nom: "1er Passage", pokemons: [38, 59, 851] }, { nom: "2nd Passage (Tournoi des Champions)", pokemons: [324, 38, 59, 776, 851] } ] },
        { nom: "Faïza & Chaz", sprite: "faiza_chaz.png", equipes: [ { nom: "Faïza (Épée - 2nd Passage)", pokemons: [701, 675, 865, 68, 453] }, { nom: "Chaz (Bouclier - 2nd Passage)", pokemons: [94, 778, 864, 477, 855] } ] },
        { nom: "Team Yell & Macro Cosmos", sprite: "yell_macro.png", equipes: [ { nom: "Shehroz (Macro Cosmos)", pokemons: [879, 601, 598, 863, 879] }, { nom: "Peterson (Team Yell)", pokemons: [860, 454, 862, 861] } ] },
        { nom: "Tarak (Maître Invaincu)", sprite: "tarak.png", equipes: [ { nom: "Combat Final", pokemons: [681, 612, 887, 537, 815, 6] } ] },
        { nom: "Nabil (Rival)", sprite: "nabil.png", equipes: [ { nom: "Combat Post-Game (Starter Plante)", pokemons: [832, 143, 823, 866, 815, 888] }, { nom: "Combat Post-Game (Starter Feu)", pokemons: [832, 143, 823, 866, 818, 888] }, { nom: "Combat Post-Game (Starter Eau)", pokemons: [832, 143, 823, 866, 812, 888] } ] },
        { nom: "Boss des DLC (Galar/Hisui)", sprite: "dlc8.png", equipes: [ { nom: "Mustar (Isolarmure)", pokemons: [620, 819, 776, 784, 86, 892] }, { nom: "Dhilan (Couronneige)", pokemons: [879, 567, 365, 884] }, { nom: "Saturnin (Isolarmure)", pokemons: [65, 80, 528, 867] }, { nom: "Sophora (Isolarmure)", pokemons: [452, 110, 569, 808] } ] }
    ],

    'gen9': [
        { nom: "Éra (Plante)", sprite: "era.png", equipes: [ { nom: "1er Passage", pokemons: [401, 192, 216] }, { nom: "2nd Passage (Revanche)", pokemons: [286, 185, 401, 357, 192] } ] },
        { nom: "Colza (Insecte)", sprite: "colza.png", equipes: [ { nom: "1er Passage", pokemons: [174, 191, 185] }, { nom: "2nd Passage (Revanche)", pokemons: [189, 192, 174, 763, 357] } ] },
        { nom: "Mashynn (Électrik)", sprite: "mashynn.png", equipes: [ { nom: "1er Passage", pokemons: [100, 73, 977, 939] }, { nom: "2nd Passage (Revanche)", pokemons: [101, 479, 100, 977, 939] } ] },
        { nom: "Kombu (Eau)", sprite: "kombu.png", equipes: [ { nom: "1er Passage", pokemons: [962, 51, 978] }, { nom: "2nd Passage (Revanche)", pokemons: [963, 977, 740, 962, 978] } ] },
        { nom: "Okuba (Arène - Normal)", sprite: "okuba.png", equipes: [ { nom: "1er Passage", pokemons: [354, 971, 972] }, { nom: "2nd Passage (Revanche)", pokemons: [354, 971, 206, 981, 972] } ] },
        { nom: "Laïmi (Spectre)", sprite: "laimi.png", equipes: [ { nom: "1er Passage", pokemons: [948, 979] }, { nom: "2nd Passage (Revanche)", pokemons: [354, 479, 429, 948, 979] } ] },
        { nom: "Tully (Psy)", sprite: "tully.png", equipes: [ { nom: "1er Passage", pokemons: [981, 282, 959] }, { nom: "2nd Passage (Revanche)", pokemons: [981, 282, 678, 475, 959] } ] },
        { nom: "Grusha (Glace)", sprite: "grusha.png", equipes: [ { nom: "1er Passage", pokemons: [873, 975, 974] }, { nom: "2nd Passage (Revanche)", pokemons: [873, 975, 461, 414, 974] } ] },
        { nom: "Team Star", sprite: "star.png", equipes: [ { nom: "Cassiopée (Boss Final)", pokemons: [197, 134, 135, 136, 471, 700] } ] },
        { nom: "Conseil 4 (Ligue Paldea)", sprite: "ligue9.png", equipes: [
            { nom: "Cayenn (Sol)", pokemons: [340, 323, 232, 53, 980] },
            { nom: "Popi (Acier)", pokemons: [879, 462, 437, 823, 959] },
            { nom: "Okuba (Ligue - Vol)", pokemons: [357, 741, 334, 398, 973] },
            { nom: "Thaïs (Dragon)", pokemons: [715, 691, 612, 840, 997] }
        ] },
        { nom: "Alisma & Professeurs", sprite: "alisma_prof.png", equipes: [
            { nom: "Alisma (Maîtresse en Chef)", pokemons: [956, 673, 977, 713, 983, 970] },
            { nom: "Prof Olim (IA - Écarlate)", pokemons: [985, 986, 987, 989, 988, 1005] },
            { nom: "Prof Turum (IA - Violet)", pokemons: [994, 991, 992, 993, 995, 1006] }
        ] },
        { nom: "Menzi (Rival)", sprite: "menzi.png", equipes: [
            { nom: "Combat Ultime (Starter Plante)", pokemons: [745, 968, 982, 706, 923, 911] },
            { nom: "Combat Ultime (Starter Feu)", pokemons: [745, 968, 982, 706, 923, 914] },
            { nom: "Combat Ultime (Starter Eau)", pokemons: [745, 968, 982, 706, 923, 908] }
        ] },
        { nom: "Boss des DLC (Paldea)", sprite: "dlc9.png", equipes: [
            { nom: "Kassis (Maître DLC 2)", pokemons: [149, 472, 727, 474, 982, 1019] },
            { nom: "Roseille (DLC 2)", pokemons: [227, 38, 971, 1013, 865] },
            { nom: "Taro (C4 Myrtille)", pokemons: [901, 80, 730, 79, 985] },
            { nom: "Nérine (C4 Myrtille)", pokemons: [85, 227, 376, 479, 1010] },
            { nom: "Rubépin (C4 Myrtille)", pokemons: [72, 85, 9, 254, 990] },
            { nom: "Irido (C4 Myrtille)", pokemons: [149, 330, 254, 409, 1011] }
        ] }
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

// NORMALISATION TEXTE : Retire les "." pour M. Mime !
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
    else if (regionKey === 'gen6') titreRegion = "Génération 6 (Kalos)";
    else if (regionKey === 'gen7') titreRegion = "Génération 7 (Alola)";
    else if (regionKey === 'gen8') titreRegion = "Génération 8 (Galar)";
    else if (regionKey === 'gen9') titreRegion = "Génération 9 (Paldea)";

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