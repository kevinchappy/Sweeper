let board = $("#board");
let flagged = new Set();
let mines = new Set();
let visited = new Set();

$(document).ready(function () {
    $("#flag-button").click(function () {
        reset();
        initGame();
    })
    initGame();
})

function reset() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            $("#" + i + "-" + j).remove();
        }
    }

    flagged = new Set();
    mines = new Set();
    visited = new Set();
}

function initGame() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let id = i + "-" + j;
            let tile = $("<div class='tile-unclicked' id='" + id + "'>")
            board.append(tile);

            tile.mouseup(function (event) {
                switch (event.which) {
                    case 1:
                        leftClickTile(tile);
                        break;

                    case 2:
                        event.preventDefault();
                        rightClickTile(tile);
                        return false;
                    default:
                        break;
                }
            })
        }
    }
    assignMines(10, 8, 8);
}

function assignMines(numberOfMines, rows, columns) {
    if (numberOfMines >= rows * columns) {
        numberOfMines = (rows * columns) - 1;
    }
    while (numberOfMines > 0) {
        let lat = Math.floor(Math.random() * rows);
        let lng = Math.floor(Math.random() * columns);

        let id = lat + "-" + lng;

        if (!mines.has(id)) {
            mines.add(id);
            numberOfMines--;
        }
    }
}

function leftClickTile(tile) {
    if (!flagged.has(tile)) {
        if (mines.has(tile.attr("id"))) {
            tile.addClass("mine")
        } else if (tile.hasClass("tile-unclicked")) {
            checkSurrounding(tile.attr("id"));
        }
    }
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

                if (long >= 0 && long <= 7 && lat >= 0 && lat <= 7) {
                    if (hasMine(long, lat)) {
                        adjacentMines++;
                    } else {

                        let newTile = long + "-" + lat;

                        if ((!queue.includes(newTile) && !visited.has(newTile)) && newTile.length > 0) {
                            adjacent.push(newTile);
                        }
                    }
                }
            }
        }

        let tile = $("#" + id);

        if (adjacentMines > 0) {
            tile.append("" + adjacentMines);
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