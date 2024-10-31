let table = $("#last10");
let saveEntries = [];

class SaveEntry {
    constructor(difficulty, time, date) {
        this.difficulty = difficulty;
        this.time = time;
        this.date = date;
    }
}

function read() {
    if (localStorage.hasOwnProperty("saveEntries")) {
        saveEntries = JSON.parse(localStorage.saveEntries);
        saveEntries.forEach((saveEntry) => {
            table.prepend(createRow(saveEntry.difficulty, saveEntry.time, saveEntry.date));
        });
    }
}

function save(difficulty, time) {
    if (saveEntries.length === 10) {
        saveEntries.shift();
        $("#last10 tr:last").remove();
    }
    let saveEntry = new SaveEntry(difficulty, time, new Date().toLocaleString());
    table.prepend(createRow(saveEntry.difficulty, saveEntry.time, saveEntry.date));
    saveEntries.push(saveEntry);
    localStorage.setItem("saveEntries", JSON.stringify(saveEntries));
}

function createRow(difficulty, time, date) {
    let row = $(document.createElement("tr"));
    let col1 = $(document.createElement("td"));
    let col2 = $(document.createElement("td"));
    let col3 = $(document.createElement("td"));

    col1.text(difficulty);
    col2.text(time);
    col3.text(date);

    row.append([col1, col2, col3]);

    return row;
}