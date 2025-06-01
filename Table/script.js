// const log = document.querySelector(".event-log-contents");

let tasksList = [];

let dateFilter = {
    start: null,
    end: null
};


let listePriorites = [{"idPriorite":1,"priorite":"Urgent"},{"idPriorite":2,"priorite":"Très Important"},{"idPriorite":3,"priorite":"Important"},{"idPriorite":4,"priorite":"Ordinaire"},{"idPriorite":5,"priorite":"Futile"}];
let listeTemps = [{"idTemps":1,"temps":"Instantané"},{"idTemps":2,"temps":"Rapide"},{"idTemps":3,"temps":"Moyen"},{"idTemps":4,"temps":"Long"},{"idTemps":5,"temps":"Très Long"}];
let listeCategories = [{"idCategorie": 1,"categorie":"Travail"},{"idCategorie": 2,"categorie":"Études"},{"idCategorie": 3,"categorie":"Loisirs"},{"idCategorie": 4,"categorie":"Famille"},{"idCategorie": 5,"categorie":"Personnel"}];
let listeDifficultes = [{"idDifficulte": 1,"difficulte":"Trèès Facile"},{"idDifficulte": 2,"difficulte":"Tranquille"},{"idDifficulte": 3,"difficulte":"Moyen"},{"idDifficulte": 4,"difficulte":"Difficile"},{"idDifficulte": 5,"difficulte":"Inabordable"}];

let dataString = localStorage.getItem("tasks");

if (dataString != null) {
    tasksList = JSON.parse(dataString);

    // On initialise les tâches une à une, comme de l'unpacking (parseInt() car on parse des String pas des integers
    tasksList = tasksList.map((task, index) => ({
        ...task,
        id: task.id ?? index,
        idPriorite: parseInt(task.idPriorite),
        idTemps: parseInt(task.idTemps),
        idCategorie: parseInt(task.idCategorie),
        idDifficulte: parseInt(task.idDifficulte),
        statut: task.statut || "en attente" // par défaut
    }));

}


document.onreadystatechange = () => {
    // log.textContent = `${log.textContent}readystate: ${document.readyState}\n`; // DEBUG
    if (document.readyState === "complete") {
        generateTable();
    }
};

console.log(tasksList); // DEBUG

function generateTable() {
    document.getElementById("tableBody").innerHTML = "";

    let tableHTML = ``;

    tasksList.forEach(function (item, index) {

        if (!item.statut) item.statut = "En attente";
        if (item.statut === "Terminé") return;

        if (dateFilter.start || dateFilter.end) {
            const taskDate = new Date(item.dateLimite);
            if (dateFilter.start && taskDate < new Date(dateFilter.start)) return;
            if (dateFilter.end && taskDate > new Date(dateFilter.end)) return;
        }


        // Générations des boutons d'avancement
        let status = ["En attente", "En cours", "Terminé"];
        let statutButtons = status.map(st => {
            const isCurrent = item.statut === st;
            return `<button type="button"
                                    class="statut-btn ${isCurrent ? "active" : ""}"
                                    data-taskid="${item.id}"
                                    data-newstatut="${st}"
                                    ${isCurrent ? 'disabled' : ''}
                                    >${st}</button>`;
        }).join(" ");

        // Priorite
        let foundPriorite = listePriorites.find(priorityElement => priorityElement.idPriorite===item.idPriorite);
        // Temps
        let foundTemps = listeTemps.find(timeElement => timeElement.idTemps===item.idTemps);
        // Categorie
        let foundCategorie = listeCategories.find(categoryElement => categoryElement.idCategorie===item.idCategorie);
        // Difficulte
        let foundDifficulte = listeDifficultes.find(difficulteElement => difficulteElement.idDifficulte===item.idDifficulte);


        // Debug / Placeholder
        let prioriteText = foundPriorite?.priorite || "Inconnu";
        let tempsText = foundTemps?.temps || "Inconnu";
        let categorieText = foundCategorie?.categorie || "Inconnu";
        let difficulteText = foundDifficulte?.difficulte || "Inconnu";

        const today = new Date();
        const taskDate = new Date(item.dateLimite);

        // Vérifie si expirée (avant aujourd'hui) et pas terminée
        const isExpired = isDateBeforeToday(item.dateLimite) && item.statut !== "Terminé";


        // Génération de l'HTML de la table
        tableHTML += `<tr data-status="${item.statut}">
                                      <td>${item.Tache}</td>
                                      <td>${prioriteText}</td>
                                      <td>${tempsText}</td>
                                      <td>${categorieText}</td>
                                      <td>${difficulteText}</td>
                                      <td>${item.dateLimite}</td>
                                      <td>${statutButtons}</td></tr>`;
    });

    document.getElementById("tableBody").insertAdjacentHTML(`beforeend`, tableHTML);


    // On met à jour les boutons de statut
    document.querySelectorAll('.statut-btn').forEach(btn => {
        btn.addEventListener("click", function () {
            const taskId = parseInt(this.dataset.taskid);
            const newStatut = this.dataset.newstatut;
            updateTaskStatus(taskId, newStatut);
        });
    });
}

function updateTaskStatus(taskId, newStatut) {
    const task = tasksList.find(t => t.id === taskId);
    if (!task) {
        console.error("Tâche introuvable pour ID:", taskId);
        return;
    }

    task.statut = newStatut;
    localStorage.setItem("tasks", JSON.stringify(tasksList));
    generateTable();
}

function applyDateFilter() {
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;

    dateFilter.start = start ? new Date(start).toISOString().split('T')[0] : null;
    dateFilter.end = end ? new Date(end).toISOString().split('T')[0] : null;

    generateTable();
}

function resetDateFilter() {
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    dateFilter.start = null;
    dateFilter.end = null;
    generateTable();
}

function isDateBeforeToday(dateStr) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return d < today;
}
