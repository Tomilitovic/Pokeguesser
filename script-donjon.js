const bgMusic = document.getElementById('bg-music');
const btnMute = document.getElementById('btn-mute');
let isMusicPlaying = false;

btnMute.addEventListener('click', () => {
    if (isMusicPlaying) { bgMusic.pause(); btnMute.innerText = "🔇 Musique OFF"; }
    else { bgMusic.play(); btnMute.innerText = "🔊 Musique ON"; }
    isMusicPlaying = !isMusicPlaying;
});

// --- BASE DE DONNÉES DES POKÉMON (8 COULEURS + NATURES) ---
const casting = [
    // BRAVE
    { id: 935, nom: "Charbambin", nature: "Brave", couleur: "Rouge", desc: "Tu brûles d'une volonté de fer ! Petit mais incroyablement vaillant, tu ne recules jamais." },
    { id: 258, nom: "Gobou", nature: "Brave", couleur: "Bleu", desc: "Sous tes airs mignons se cache un courage immense. Tu protèges toujours tes amis." },
    { id: 252, nom: "Arcko", nature: "Brave", couleur: "Vert", desc: "Fier et indépendant. Tu as un grand sens de la justice et du sang-froid." },
    { id: 150, nom: "Mewtwo", nature: "Brave", couleur: "Blanc", desc: "Solitaire, incroyablement intelligent et puissant. Tu ne te laisses faire par personne." },
    { id: 403, nom: "Lixy", nature: "Brave", couleur: "Jaune", desc: "Tu débordes d'énergie et de courage ! Ton potentiel est électrisant." },
    
    // TIMIDE
    { id: 155, nom: "Héricendre", nature: "Timide", couleur: "Rouge", desc: "Tu es un peu réservé(e) au début, mais tu sais réchauffer le cœur de tes proches." },
    { id: 816, nom: "Larméléon", nature: "Timide", couleur: "Bleu", desc: "Très sensible et empathique. Tu préfères souvent rester en retrait, et c'est très bien !" },
    { id: 495, nom: "Vipélierre", nature: "Timide", couleur: "Vert", desc: "Tu observes beaucoup avant d'agir. Ton calme et ta retenue sont tes plus grandes forces." },
    { id: 778, nom: "Mimiqui", nature: "Timide", couleur: "Noir", desc: "Tu te caches parfois sous une carapace, mais tu as un cœur en or et tu cherches juste à être aimé(e)." },
    { id: 104, nom: "Osselait", nature: "Timide", couleur: "Marron", desc: "Tu as parfois le cœur lourd et tu te protèges du monde, mais ta force intérieure est grande." },

    // FOUFOU
    { id: 4, nom: "Salamèche", nature: "Foufou", couleur: "Rouge", desc: "Tu as de l'énergie à revendre ! Toujours prêt(e) à t'amuser et à foncer tête baissée." },
    { id: 393, nom: "Tiplouf", nature: "Foufou", couleur: "Bleu", desc: "Un brin fier et maladroit ! Tu adores être le centre de l'attention." },
    { id: 906, nom: "Poussacha", nature: "Foufou", couleur: "Vert", desc: "Capricieux mais tellement attachant ! Tu aimes t'amuser et faire tourner les autres en bourrique." },
    { id: 885, nom: "Fantyrm", nature: "Foufou", couleur: "Noir", desc: "Imprévisible et fêtard ! Tu adores surprendre les autres, même si on te trouve parfois étrange." },
    { id: 133, nom: "Évoli", nature: "Foufou", couleur: "Marron", desc: "Plein d'enthousiasme et de potentiel infini ! Tu t'adaptes à toutes les situations." },

    // RELAX
    { id: 909, nom: "Chochodile", nature: "Relax", couleur: "Rouge", desc: "Manger, dormir et rêvasser ! Tu vis à ton propre rythme, sans aucune pression." },
    { id: 7, nom: "Carapuce", nature: "Relax", couleur: "Bleu", desc: "Tu prends la vie du bon côté, en te laissant porter par le courant." },
    { id: 387, nom: "Tortipouss", nature: "Relax", couleur: "Vert", desc: "Paisible et aimant la nature. Tu aimes te prélasser au soleil tranquillement." },
    { id: 446, nom: "Goinfrex", nature: "Relax", couleur: "Noir", desc: "La sieste et un bon repas sont tes priorités. Pourquoi stresser ?" },
    { id: 79, nom: "Ramoloss", nature: "Relax", couleur: "Rose", desc: "Rien ne presse ! Tu es souvent dans la lune et tu adores te détendre." },
    { id: 54, nom: "Psykokwak", nature: "Relax", couleur: "Jaune", desc: "Tu as parfois mal à la tête avec tout ce stress... Prends ton temps, tout va bien se passer !" },

    // MALIN / BIZARRE
    { id: 725, nom: "Flamiaou", nature: "Malin", couleur: "Rouge", desc: "Indépendant et rusé. Tu analyses toujours la situation avant de dévoiler tes cartes." },
    { id: 656, nom: "Grenousse", nature: "Malin", couleur: "Bleu", desc: "Vif d'esprit et agile. Tu as toujours une longueur d'avance sur les autres." },
    { id: 810, nom: "Ouistempo", nature: "Bizarre", couleur: "Vert", desc: "Tu aimes faire du bruit et mettre l'ambiance là où tu passes !" },
    { id: 438, nom: "Manzaï", nature: "Malin", couleur: "Marron", desc: "Tu adores jouer la comédie et faire semblant pour te sortir des ennuis avec malice !" },
    { id: 439, nom: "Mime Jr.", nature: "Bizarre", couleur: "Rose", desc: "Très créatif et amusant, tu adores imiter les autres pour les faire rire !" },

    // JOVIAL
    { id: 813, nom: "Flambino", nature: "Jovial", couleur: "Rouge", desc: "Hyperactif et toujours souriant ! Tu as besoin de te dépenser sans cesse." },
    { id: 912, nom: "Coiffeton", nature: "Jovial", couleur: "Bleu", desc: "Sociable, bien coiffé(e) et toujours de bonne humeur ! Tu aimes que les choses soient bien faites." },
    { id: 1, nom: "Bulbizarre", nature: "Jovial", couleur: "Vert", desc: "Loyal et amical. Tu es le pilier sur lequel tes amis peuvent toujours compter." },
    { id: 25, nom: "Pikachu", nature: "Jovial", couleur: "Jaune", desc: "La mascotte absolue ! Curieux, énergique et prêt à te lier d'amitié avec le monde entier." },

    // NAÏF / PRUDENT
    { id: 498, nom: "Gruikui", nature: "Naïf", couleur: "Rouge", desc: "Honnête et transparent. Tu fonces avec le sourire sans voir le danger." },
    { id: 501, nom: "Moustillon", nature: "Naïf", couleur: "Bleu", desc: "Très expressif, tu montres facilement tes émotions, mais tu as un cœur vaillant." },
    { id: 722, nom: "Brindibou", nature: "Prudent", couleur: "Vert", desc: "Tu aimes le confort et tu réfléchis toujours à deux fois avant de prendre un risque." },
    { id: 300, nom: "Skitty", nature: "Naïf", couleur: "Rose", desc: "Tu aimes courir après tout ce qui bouge. Ta candeur et ta joie de vivre sont contagieuses !" },
    { id: 175, nom: "Togepi", nature: "Naïf", couleur: "Blanc", desc: "Pur(e) et innocent(e). Tu as besoin d'affection et tu répands la chance autour de toi." },
    { id: 359, nom: "Absol", nature: "Prudent", couleur: "Blanc", desc: "Très observateur, tu pressens les problèmes de loin. Les autres te comprennent parfois mal." }
];

// --- BANQUE DE QUESTIONS ---
const poolQuestions = [
    { text: "Un portefeuille est tombé par terre. Que fais-tu ?", reponses: [ { text: "Je le donne à la police !", points: { "Brave": 2 } }, { text: "Je prends l'argent en cachette...", points: { "Malin": 2 } }, { text: "Je le laisse là, flemme.", points: { "Relax": 2 } } ] },
    { text: "Tu es face à une porte très sombre. Qu'y a-t-il derrière ?", reponses: [ { text: "Un gros monstre !", points: { "Timide": 2 } }, { text: "Un trésor secret !", points: { "Naïf": 2 } }, { text: "Juste une pièce vide.", points: { "Prudent": 2 } } ] },
    { text: "On te fait une blague complètement nulle. Ta réaction ?", reponses: [ { text: "J'éclate de rire quand même !", points: { "Jovial": 2 } }, { text: "Je fais semblant de rire...", points: { "Timide": 1 } }, { text: "Je lâche un gros soupir.", points: { "Brave": 1, "Malin": 1 } } ] },
    { text: "C'est les vacances d'été ! Quel est ton programme ?", reponses: [ { text: "Faire la fête tous les jours !", points: { "Foufou": 2 } }, { text: "Dormir et ne rien faire.", points: { "Relax": 2 } }, { text: "Partir à l'aventure !", points: { "Brave": 2 } } ] },
    { text: "Un de tes amis pleure à chaudes larmes. Que fais-tu ?", reponses: [ { text: "Je pleure avec lui...", points: { "Naïf": 2 } }, { text: "Je lui fais un gros câlin.", points: { "Jovial": 2 } }, { text: "Je cherche le coupable pour le taper !", points: { "Brave": 2 } } ] },
    { text: "T'arrive-t-il de t'endormir en plein cours ?", reponses: [ { text: "Presque tous les jours...", points: { "Relax": 2 } }, { text: "Jamais, je suis concentré(e) !", points: { "Prudent": 2 } }, { text: "Seulement si je m'ennuie.", points: { "Foufou": 1 } } ] },
    { text: "Quelqu'un te double effrontément dans une file d'attente...", reponses: [ { text: "Hé ! Fais la queue comme tout le monde !", points: { "Brave": 2 } }, { text: "Je ne dis rien, j'évite les problèmes.", points: { "Timide": 2 } }, { text: "Je lui fais un croche-patte.", points: { "Malin": 2 } } ] },
    { text: "Un extraterrestre atterrit dans ton jardin et te parle !", reponses: [ { text: "Cool ! Je discute avec lui.", points: { "Bizarre": 2 } }, { text: "Je fuis en hurlant !", points: { "Timide": 2 } }, { text: "Je lui demande de m'emmener dans l'espace !", points: { "Foufou": 2 } } ] },
    { text: "Tu as un gros examen demain matin...", reponses: [ { text: "Je révise toute la nuit.", points: { "Prudent": 2 } }, { text: "J'improviserai, ça passe !", points: { "Naïf": 2 } }, { text: "Je prépare une antisèche au cas où...", points: { "Malin": 2 } } ] },
    { text: "Trouves-tu que tu es quelqu'un de bizarre ?", reponses: [ { text: "Oui, totalement ! Et j'adore ça.", points: { "Bizarre": 2 } }, { text: "Non, je suis plutôt normal(e).", points: { "Prudent": 1 } }, { text: "Un peu, mais je le cache bien.", points: { "Malin": 1 } } ] }
];

const questionCouleur = { 
    text: "Pour finir... Parmi ces couleurs, laquelle te représente le plus profondément ?", 
    reponses: [
        { text: "Le Rouge ❤️ (Feu, Passion)", couleur: "Rouge" },
        { text: "Le Bleu 💙 (Eau, Calme)", couleur: "Bleu" },
        { text: "Le Vert 💚 (Plante, Nature)", couleur: "Vert" },
        { text: "Le Jaune 💛 (Électricité, Joie)", couleur: "Jaune" },
        { text: "Le Rose 💖 (Douceur, Amour)", couleur: "Rose" },
        { text: "Le Blanc 🤍 (Pureté, Lumière)", couleur: "Blanc" },
        { text: "Le Marron 🤎 (Terre, Confort)", couleur: "Marron" },
        { text: "Le Noir 🖤 (Mystère, Nuit)", couleur: "Noir" }
    ] 
};

// --- LOGIQUE DU JEU ---
let questionsActuelles = [], currentQuestionIndex = 0;
let scoresNatures = { "Brave":0, "Timide":0, "Foufou":0, "Relax":0, "Malin":0, "Jovial":0, "Naïf":0, "Prudent":0, "Bizarre":0 };
let couleurFinale = "";

const introContainer = document.getElementById('intro-container');
const quizContainer = document.getElementById('quiz-container');
const resultatContainer = document.getElementById('resultat-container');
const texteQuestion = document.getElementById('texte-question');
const reponsesContainer = document.getElementById('reponses-container');
const compteurText = document.getElementById('compteur-question');

function melanger(array) { return array.sort(() => Math.random() - 0.5); }

document.getElementById('btn-start').addEventListener('click', startQuiz);
document.getElementById('btn-restart-quiz').addEventListener('click', startQuiz);

function startQuiz() {
    bgMusic.play().catch(()=>{}); isMusicPlaying = true; btnMute.innerText = "🔊 Musique ON";
    introContainer.style.display = 'none';
    resultatContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    
    for(let key in scoresNatures) scoresNatures[key] = 0;
    couleurFinale = "";
    
    // On tire 9 questions au hasard
    questionsActuelles = melanger([...poolQuestions]).slice(0, 9);
    questionsActuelles.push(questionCouleur); // La 10ème est la couleur
    
    currentQuestionIndex = 0;
    afficherQuestion();
}

function afficherQuestion() {
    reponsesContainer.innerHTML = '';
    compteurText.innerText = `Question ${currentQuestionIndex + 1} / 10`;
    let q = questionsActuelles[currentQuestionIndex];
    texteQuestion.innerText = q.text;

    q.reponses.forEach(rep => {
        let btn = document.createElement('button');
        btn.innerText = rep.text;
        btn.className = 'btn-reponse';
        
        // Attribution des classes CSS pour les couleurs
        if(currentQuestionIndex === 9) {
            const cssClassMap = {
                "Rouge": "btn-rouge", "Bleu": "btn-bleu", "Vert": "btn-vert", "Noir": "btn-noir",
                "Rose": "btn-rose", "Blanc": "btn-blanc", "Marron": "btn-marron", "Jaune": "btn-jaune"
            };
            if(cssClassMap[rep.couleur]) btn.classList.add(cssClassMap[rep.couleur]);
        }

        btn.addEventListener('click', () => validerReponse(rep));
        reponsesContainer.appendChild(btn);
    });
}

function validerReponse(reponseChoisie) {
    if (reponseChoisie.points) {
        for (let nature in reponseChoisie.points) {
            scoresNatures[nature] += reponseChoisie.points[nature];
        }
    }
    if (reponseChoisie.couleur) {
        couleurFinale = reponseChoisie.couleur;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < 10) {
        afficherQuestion();
    } else {
        afficherResultat();
    }
}

function afficherResultat() {
    quizContainer.style.display = 'none';
    
    // Trouver la nature gagnante
    let topNature = Object.keys(scoresNatures).reduce((a, b) => scoresNatures[a] > scoresNatures[b] ? a : b);

    // Trouver le Pokémon correspondant (Nature + Couleur, sinon juste Nature)
    let monPokemon = casting.find(p => p.nature === topNature && p.couleur === couleurFinale);
    if (!monPokemon) monPokemon = casting.find(p => p.nature === topNature);
    if (!monPokemon) monPokemon = casting.find(p => p.couleur === couleurFinale) || casting[0];

    // Affichage avec API
    document.getElementById('resultat-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${monPokemon.id}.png`;
    document.getElementById('resultat-nom').innerText = monPokemon.nom;
    document.getElementById('resultat-desc').innerText = `(Nature dominante : ${topNature})\n\n${monPokemon.desc}`;
    
    resultatContainer.style.display = 'block';

    // Jouer le cri officiel
    let cri = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${monPokemon.id}.ogg`);
    cri.volume = 0.6;
    cri.play().catch(e => console.log("Erreur audio", e));
}