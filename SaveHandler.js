let table = $("#last10");
let saveEntries = [];

class SaveEntry{
    constructor(difficulty, time, date) {
        this.difficulty = difficulty;
        this.time = time;
        this.date = date;
    }
}

 function read(){
    if (localStorage.hasOwnProperty("saveEntries")) {
        saveEntries = JSON.parse(localStorage.saveEntries);
        saveEntries.forEach((saveEntry) => {table.prepend($("<tr><td>" + saveEntry.difficulty + "</td> <td>" + saveEntry.time + "</td> <td>" + saveEntry.date + "</td></tr>"))});
    }
}

 function save(difficulty, time) {
    if(saveEntries.length === 10) {
        saveEntries.shift();
        $("#last10 tr:last").remove();
    }

    let saveEntry = new SaveEntry(difficulty, time, new Date());
    table.prepend($("<tr><td>" + saveEntry.difficulty + "</td> <td>" + saveEntry.time + "</td> <td>" + saveEntry.date + "</td></tr>"));
    saveEntries.push(saveEntry);
    localStorage.setItem("saveEntries", JSON.stringify(saveEntries));
}