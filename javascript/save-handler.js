let table = $("#last10");
let saveEntries = [];

/*
 * Class that contains save information for a finished round.
 * Contains difficulty, round time and date and time of completion in local time format.
 */
class SaveEntry {
    constructor(difficulty, time, date) {
        this.difficulty = difficulty;
        this.time = time;
        this.date = date;
    }
}

/*
 * Loads saves from storage and populates table element.
 */
function initSaves() {
    if (localStorage.hasOwnProperty("saveEntries")) {
        saveEntries = JSON.parse(localStorage.saveEntries);
        saveEntries.forEach((saveEntry) => {
            table.prepend(createRow(saveEntry.difficulty, saveEntry.time, saveEntry.date));
        });
    }
}

/*
 * Stores entry of finished game round to table element. Also saves list of entries in localStorage.
 * Limits entries to 10 and removes oldest entry if length is equal to 10.
 *
 * difficulty : String containing difficulty settings
 * time : String containing game length
 */
function save(difficulty, time) {
    if (saveEntries.length === 10) {
        saveEntries.shift();
        $("#last10 tr:last").remove();
    }
    let newSaveEntry = new SaveEntry(difficulty, time, new Date().toLocaleString());
    table.prepend(createRow(newSaveEntry.difficulty, newSaveEntry.time, newSaveEntry.date));
    saveEntries.push(newSaveEntry);
    localStorage.setItem("saveEntries", JSON.stringify(saveEntries));
}

/* Creates new table row to containing 3 columns. Columns contain difficulty settings, time and current date in local format.
 *
 * difficulty : String containing difficulty settings
 * time : String containing game length
 * date : String containing local date and time
 * returns table row jQuery element
 */
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