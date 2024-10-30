const board = $("#board");
const timer = $("#time");
let flagged = new Set();
let mines = new Set();
let visited = new Set();
let gameRunning = false;
let time = 0;
let timerID = null;
let firstClick = true;
let columns = 8;
let rows = 8;
let mineCount = 10;

function restart(){
    console.log(settings.rows);
    console.log(settings.columns);
    console.log(settings.mines);
    reset();
    initGame();
}

function reset() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            $("#" + i + "-" + j).remove();
        }
    }

    firstClick = true;
    clearInterval(timerID);
    timerID = null;
    flagged = new Set();
    mines = new Set();
    visited = new Set();
}


function initGame() {
    rows = settings["rows"];
    columns = settings["columns"];
    mineCount = settings["mines"];
    buildBoard();

    time = 0;
    timer.text(time);
    timerID = setInterval(function () {
        timer.text(++time);
    }, 1000);

    gameRunning = true;
    if (mineCount >= rows * columns) {
        mineCount = (rows * columns) - 8;
    }
    assignMines(mineCount, columns, rows, []);
}

/**
 * Resizes the board based on tile size. Done dynamically so that board adjusts to resizing.
 *
 */
function resizeBoard(){
    let width = $("#0-0").outerHeight();
    board.css("width", Math.ceil(width * rows));
    board.css("height", Math.ceil(width * columns));
}

function buildBoard() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            let id = i + "-" + j;

            let tile = $(document.createElement("div"));
            tile.attr({
                class: "tile-unclicked",
                id: id,
                contextmenu: false
            });
            tile.on("contextmenu", function() {return false;})

            board.append(tile);

            tile.mouseup(function (event) {
                if (gameRunning) {
                    switch (event.which) {
                        case 1:
                            leftClickTile(tile);
                            break;
                        case 3:

                            rightClickTile(tile);
                            break;
                        default:
                            break;
                    }
                }
            })
        }
    }
    resizeBoard();
}

function checkVictory() {
    if (visited.size === (columns * rows) - mineCount) {
        gameRunning = false;
        clearInterval(timerID);
        revealMines();
        save("30x16-99", time);
    }
}

function revealMines() {
    mines.forEach(function (elem) {
        let mine = $("#" + elem);
        if (!mine.hasClass("tile-flagged")) {
            mine.addClass("mine");
        }
    });
}

function assignMines(numberOfMines, rows, columns, ignore) {
    while (numberOfMines > 0) {
        let lat = Math.floor(Math.random() * rows);
        let lng = Math.floor(Math.random() * columns);
        let id = lat + "-" + lng;

        if (!mines.has(id) && !ignore.includes(id)) {
            mines.add(id);
            numberOfMines--;
        }
    }
    $("#mines-count").text("" + mines.size);
}

function leftClickTile(tile) {
    if (!flagged.has(tile)) {
        if (!firstClick && mines.has(tile.attr("id"))) {
            clearInterval(timerID);
            revealMines();
            gameRunning = false;
        } else if (tile.hasClass("tile-unclicked")) {
            if (firstClick) {
                firstClickCleaner(tile.attr("id"));
                firstClick = false;
            }
            checkSurrounding(tile.attr("id"));
            checkVictory();
        }
    }
}

/**
 * "Cleans" first click by removing all adjacent mines to the first clicked tile and reshuffling them to the rest of the board.
 *
 * @param id
 */
function firstClickCleaner(id) {
    let adjacentMines = 0;
    let coords = id.split("-");
    let tiles = [];

    let x = parseInt(coords[0]) - 1;
    let y = parseInt(coords[1]) - 1;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let long = x + i;
            let lat = y + j;

            if (hasMine(long, lat)) {
                adjacentMines++;
            }
            mines.delete(long + "-" + lat);
            tiles.push(long + "-" + lat);
        }
    }
    assignMines(adjacentMines, columns, rows, tiles);
}

/*
* Checks if surrounding tiles to the one clicked are mines and counts them. Assigns count to div.
* If the clicked tile is blank, a breadth first search is performed to reveal all connected non-mine tile.
* */
function checkSurrounding(id) {
    let queue = [];
    queue.push(id);
    while (queue.length > 0) {
        let adjacent = [];
        id = queue.shift();
        visited.add(id);

        let coords = id.split("-");
        let adjacentMines = 0;
        let x = parseInt(coords[0]) - 1;
        let y = parseInt(coords[1]) - 1;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let long = x + i;
                let lat = y + j;

                if (long >= 0 && long < columns && lat >= 0 && lat < rows) {
                    if (hasMine(long, lat)) {
                        adjacentMines++;
                    } else {

                        let newTile = long + "-" + lat;

                        if ((newTile.length > 0 && !queue.includes(newTile) && !visited.has(newTile))) {
                            adjacent.push(newTile);
                        }
                    }
                }
            }
        }
        let tile = $("#" + id);
        if (adjacentMines > 0) {
            tile.append("" + adjacentMines);
            tile.addClass("x" + adjacentMines);
        } else {
            adjacent.forEach((element) => queue.push(element));
        }
        if (tile.hasClass("tile-flagged")) {
            tile.removeClass("tile-flagged");
        }
        tile.removeClass("tile-unclicked");
        tile.addClass("tile-clicked");
    }
}

function hasMine(x, y) {
    return mines.has(x + "-" + y);
}

function rightClickTile(tile) {
    if (!flagged.has(tile) && tile.hasClass("tile-unclicked")) {
        flagged.add(tile);
        tile.toggleClass("tile-flagged");
    } else {
        flagged.delete(tile);
        tile.toggleClass("tile-flagged");
    }
}