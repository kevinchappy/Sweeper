let board = $("#board");
let gameState = [];
let flagged = new Set();
let mines = new Set();
let firstClick = false;

$(document).ready(function () {
    initGame();
})

function initGame() {

    for (let i = 0; i < 8; i++) {
        let row = [];
        for (let j = 0; j < 8; j++) {
            let id = i + "." + j;
            let tile = $("<div class='tile-unclicked' id='" + id + "'>")
            board.append(tile);
            row.push(id);

            tile.mousedown(function (event) {
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
        gameState.push(row);
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

        let id = lat + "." + lng;

        if (!mines.has(id)) {
            mines.add(id);
            numberOfMines--;
        }
    }
    console.log(mines);
}


function leftClickTile(tile) {
    if (!flagged.has(tile)) {
        if (mines.has(tile.attr("id"))) {
            tile.addClass("mine")
        } else if(tile.hasClass("tile-unclicked")) {
            let coords = tile.attr("id").split(".");
            checkSurrounding(coords, tile);
            tile.removeClass("tile-unclicked");
            tile.addClass("tile-clicked");
        }
    }
}

function checkSurrounding(coords, tile) {
    let adjacentMines = 0;
    let y = parseInt(coords[1]);
    let x = parseInt(coords[0]);
    console.log("Checking surrounding for: " + x + "." + y);

    let first = x-1;
    let second = y-1;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if(hasMine(first+i, second+j)){
                adjacentMines++;
            }
        }
    }

    if (adjacentMines > 0) {
        tile.append("" + adjacentMines);
    }
}

function hasMine(x, y) {
    console.log("Checking mine at: " + x + "." + y);
    return mines.has(x + "." + y);
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