document.getElementById('saisie').addEventListener('input', function(e) {
    let texte = e.target.value.toLowerCase();
    if(texte === "sabelette") {
        document.getElementById('resultat').innerHTML = "<h3>Bravo ! C'est Sabelette !</h3>";
    }
});