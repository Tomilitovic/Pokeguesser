// On cible la zone de la grille dans notre HTML
const grid = document.getElementById('pokedex-grid');

// On crée une boucle mathématique qui va de 1 à 151
for (let i = 1; i <= 151; i++) {
    
    // 1. On crée une case (une balise 'div' en HTML)
    let box = document.createElement('div');
    
    // 2. On lui donne le style 'pokemon-box' défini dans le CSS
    box.classList.add('pokemon-box');
    
    // 3. On lui donne un identifiant unique (box-1, box-2, etc.) pour la retrouver plus tard
    box.id = "box-" + i;
    
    // 4. On formate le numéro pour qu'il affiche #001, #010, #151 (toujours 3 chiffres)
    let numeroFormate = "#" + i.toString().padStart(3, '0');
    
    // 5. On écrit ce numéro gris à l'intérieur de la case
    box.innerHTML = `<span class="numero">${numeroFormate}</span>`;
    
    // 6. On injecte la case terminée dans la grille de la page web
    grid.appendChild(box);
}