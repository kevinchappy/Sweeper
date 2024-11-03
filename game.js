const board = $("#board");
const timer = $("#time");
const mineDisplay = $("#mine-count");
const smileyImage = $("#smiley-image");
let flagged = new Set();
let mines = new Set();
let visited = new Set();
let gameRunning = false;
let time = 0;
let timerID = null;
let firstClick = true;
let flagMode = false;
let columns = 8;
let rows = 8;
let mineCount = 10;

function initGame() {
    rows = settings["rows"];
    columns = settings["columns"];
    mineCount = settings["mines"];
    buildBoard();

    time = 0;
    timer.text("0000");

    gameRunning = true;
    if (mineCount >= rows * columns) {
        mineCount = (rows * columns) - 9;
    }
    assignMines(mineCount, columns, rows, []);
    mineDisplay.text(mineCount.toString().padStart(3, "0"));
    smileyImage.attr("src", "images/happy-smiley.png");
}

function changeTileSize() {
    let tileStyle = $(".tile");
    tileStyle.css("width", settings["tile-size"] + "px");
    tileStyle.css("height", settings["tile-size"] + "px");
}

function buildBoard() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let id = i + "-" + j;

            let tile = $(document.createElement("div"));
            tile.attr({
                class: "tile tile-unclicked",
                id: id,
                contextmenu: false
            });
            tile.contextmenu(function () {
                return false;
            });
            tile.mousedown(function (event) {
                if (event.button === 0 && gameRunning) {
                    smileyImage.attr("src", "images/o-smiley.png");
                }
            });

            board.append(tile);

            tile.mouseup(function (event) {
                if (gameRunning) {
                    switch (event.which) {
                        case 1:
                            smileyImage.attr("src", "images/happy-smiley.png");
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
    changeTileSize();
    resizeBoard();
}

function reset() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
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

function restart() {
    reset();
    initGame();
}

/**
 * Resizes the board based on tile size. Done dynamically so that board adjusts to resizing.
 *
 */
function resizeBoard() {
    let width = $("#0-0").outerHeight();
    board.css("height", Math.ceil(width * rows));
    board.css("width", Math.ceil(width * columns));
}


function checkVictory() {
    if (visited.size === (columns * rows) - mines.size) {
        gameRunning = false;
        clearInterval(timerID);
        revealMines();
        save(columns + "x" + rows + " / " + mines.size, time);
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
        let lat = Math.floor(Math.random() * columns);
        let lng = Math.floor(Math.random() * rows);
        let id = lat + "-" + lng;

        if (!mines.has(id) && !ignore.includes(id)) {
            mines.add(id);
            numberOfMines--;
        }
    }
    $("#mines-count").text("" + mines.size);
}

function leftClickTile(tile) {
    if (flagMode) {
        rightClickTile(tile);
    } else if (!flagged.has(tile)) {
        if (!firstClick && mines.has(tile.attr("id"))) {
            clearInterval(timerID);
            revealMines();
            smileyImage.attr("src", "images/dead-smiley.png");
            gameRunning = false;
        } else if (tile.hasClass("tile-unclicked")) {
            if (firstClick) {
                timerID = setInterval(function () {
                    time++;
                    timer.text(time.toString().padStart(4, "0"));
                    if (time === 9999) {
                        clearInterval(timerID);
                    }
                }, 1000);
                firstClickCleaner(tile.attr("id"));
                firstClick = false;
            }
            revealTiles(tile.attr("id"));
            $("#smiley-image").attr("src", "images/happy-smiley.png");
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
    let coords = id.split("-");
    let result = checkMines(parseInt(coords[0]) - 1, parseInt(coords[1]) - 1)
    let adjacentTiles = result[0];
    let adjacentMines = result[1];
    adjacentTiles.forEach((tile) => mines.delete(tile));
    assignMines(adjacentMines, columns, rows, adjacentTiles);
}

/**
 * Checks if surrounding tiles to the one clicked are mines and counts them. Assigns count to div.
 * If the clicked tile is blank, a breadth first search is performed to reveal all connected non-mine tile.
 *
 * @param id
 * */
function revealTiles(id) {
    let queue = [];
    queue.push(id);
    while (queue.length > 0) {
        id = queue.shift();
        visited.add(id);
        let coords = id.split("-");
        let result = checkMines(parseInt(coords[0]) - 1, parseInt(coords[1]) - 1);
        let adjacent = result[0];
        let adjacentMines = result[1];

        adjacent = adjacent.filter((newTile) => (newTile.length > 0 && !queue.includes(newTile) && !visited.has(newTile)));

        let tile = $("#" + id);
        if (adjacentMines > 0) {
            tile.append("" + adjacentMines);
            tile.addClass("adjacent-" + adjacentMines);
        } else {
            adjacent.forEach((element) => queue.push(element));
        }
        if (tile.hasClass("tile-flagged")) {
            tile.removeClass("tile-flagged");
            mineCount++;
            mineDisplay.text(mineCount.toString().padStart(3, "0"));
        }
        tile.removeClass("tile-unclicked");
        tile.addClass("tile-clicked");
    }
}

function checkMines(startX, startY) {
    let adjacentMines = 0;
    let visited = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let long = startX + i;
            let lat = startY + j;
            if (long >= 0 && long < rows && lat >= 0 && lat < columns) {
                if (mines.has(x + "-" + y)) {
                    adjacentMines++;
                }
                visited.push(long + "-" + lat);
            }
        }
    }
    return [visited, adjacentMines];
}

function rightClickTile(tile) {
    if (tile.hasClass("tile-unclicked") && !firstClick) {
        if (!flagged.has(tile) && mineCount > 0) {
            mineCount--;
            flagged.add(tile);
            tile.toggleClass("tile-flagged");
        } else if (flagged.has(tile)) {
            mineCount++;
            flagged.delete(tile);
            tile.toggleClass("tile-flagged");
        }
        mineDisplay.text(mineCount.toString().padStart(3, "0"));
    }
}