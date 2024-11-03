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


/*
 * Initializes game state. Reads fresh values from settings and sets up game.
 * Resets game state values to defaults. Sets html elements to their defaults as well.
 * Ensures that total mines is within allowable range.
 * Total mines must be 10 less that amount of tiles for game not to hang and not to succeed instantly upon starting.
 */
function initGame() {
    rows = settings["rows"];
    columns = settings["columns"];
    mineCount = settings["mines"];
    buildBoard();

    time = 0;
    timer.text("0000");

    gameRunning = true;
    if (mineCount >= rows * columns) {
        mineCount = (rows * columns) - 10;
    }
    assignMines(mineCount, columns, rows, []);
    mineDisplay.text(mineCount.toString().padStart(3, "0"));
    smileyImage.attr("src", "resources/happy-smiley.png");
}

/*
 * Changes CSS class attributes for tile class. Changes height and width values for all tiles.
 * Reads fresh values from settings.
 */
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
                    smileyImage.attr("src", "resources/o-smiley.png");
                }
            });

            board.append(tile);

            tile.mouseup(function (event) {
                if (gameRunning) {
                    switch (event.which) {
                        case 1:
                            smileyImage.attr("src", "resources/happy-smiley.png");
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

/*
 * Handles left-clicks on tiles on the game board.
 * If flagMode is true the left click is handled as a right-click.
 * Checks if the clicked tile is a mine. If so, the game is over and frozen until restarted.
 * Starts game timer if first click of the game and calls method to "clean" area around the first click.
 * Otherwise, in the base case the method to reveal tiles around clicked tile is called and the victory condition is checked.
 *
 * tile : jQuery object of the clicked tile.
 */
function leftClickTile(tile) {
    if (flagMode) {
        rightClickTile(tile);
    } else if (!flagged.has(tile)) {
        if (!firstClick && mines.has(tile.attr("id"))) {
            clearInterval(timerID);
            revealMines();
            smileyImage.attr("src", "resources/dead-smiley.png");
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
            $("#smiley-image").attr("src", "resources/happy-smiley.png");
            checkVictory();
        }
    }
}

/*
 * Removes all mines from the 3x3 area around the first clicked tile.
 * After tiles are removed, assignMines is called to replace removed mines while ignoring tiles in the 3x3 area.
 *
 * id : String containing id of the first clicked tile.
 */

function firstClickCleaner(id) {
    let coords = id.split("-");
    let result = checkMines(parseInt(coords[0]) - 1, parseInt(coords[1]) - 1)
    let adjacentTiles = result[0];
    let adjacentMines = result[1];
    adjacentTiles.forEach((tile) => mines.delete(tile));
    assignMines(adjacentMines, columns, rows, adjacentTiles);
}

/*
 * Performs a breadth first search to find all connected tiles without mines. If mines are found the number is assigned to the tiles div text.
 * If the clicked tile has no adjacent mines, the adjacent tiles are added to the queue to continue search.
 * Tiles are not added to queue if they are already in queue or have been previously visited.
 *
 * id : String with id of starting tile
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

/*
 * Checks and counts amount of mines in a 3x3 area. Starts at the top left tile of area.
 * Returns a list containing a list of visited tiles and the total amount of mines found.
 *
 * startX : Number representing the row that the starting tile is in.
 * startY : Number representing the column that the starting tile is in.
 * returns list with list of visited tiles in index 0, and number of mines found in index 1.
 */
function checkMines(startX, startY) {
    let adjacentMines = 0;
    let visited = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let long = startX + i;
            let lat = startY + j;
            if (long >= 0 && long < rows && lat >= 0 && lat < columns) {
                if (mines.has(long + "-" + lat)) {
                    adjacentMines++;
                }
                visited.push(long + "-" + lat);
            }
        }
    }
    return [visited, adjacentMines];
}

/*
 * Handles right click events on tiles.
 * Toggles flag class on un-clicked tiles and updates mine count display to reflect how many mines are left based on placed flags.
 *
 */
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