/*
 * Program for handling game settings and setting up event handlers for elements that manipulate settings.
 */

let settings = {
    "rows": 10,
    "columns": 8,
    "mines": 8,
    "tile-size": 34
};

/*
 * Reads and initializes settings variables from localStorage if they exist.
 * Sets up input handler for UI elements that manipulate settings.
 */
function initSettings() {
    if (localStorage.hasOwnProperty("rows")) {
        settings["rows"] = parseInt(localStorage.getItem("rows"));
        $("#rows-slider").val(settings["rows"]);
        $("#rows-input").val(settings["rows"]);
    }
    if (localStorage.hasOwnProperty("columns")) {
        settings["columns"] = parseInt(localStorage.getItem("columns"));
        $("#columns-slider").val(settings["columns"]);
        $("#columns-input").val(settings["columns"]);
    }

    if (localStorage.hasOwnProperty("mines")) {
        settings["mines"] = parseInt(localStorage.getItem("mines"));
        $("#mines-slider").val(settings["mines"]);
        $("#mines-input").val(settings["mines"]);
    }

    if (localStorage.hasOwnProperty("tile-size")) {
        settings["tile-size"] = parseInt(localStorage.getItem("tile-size"));
        $("#size-slider").val(settings["tile-size"]);
        $("#size-input").val(settings["tile-size"]);
    }

    setupInput($("#rows-slider"), $("#rows-input"), 1, 30, "rows");
    setupInput($("#columns-slider"), $("#columns-input"), 1, 30, "columns");
    setupInput($("#mines-slider"), $("#mines-input"), 1, 600, "mines");
    setupInput($("#size-slider"), $("#size-input"), 28, 40, "tile-size");
}

/*
 * Sets up event handlers for slider and number input element. Both elements are set up to mirror each other and update
 * the given settings variable when either element is changed.
 * Special case for "tile-size" key that calls function to resize game board when altered.
 *
 * slider : Jquery object for slider to set up input handler for.
 * input : Jquery object for number input to set up input handler for.
 * min : Minimum value that slider and input accepts.
 * max : Maximum value that slider and input accepts
 * key : localStorage entry key.
 */
function setupInput(slider, input, min, max, key) {
    slider.on("input", function () {
        let val = slider.val();
        settings[key] = val;
        input.val(val);
        localStorage.setItem(key, val);

        if (key === "tile-size") {
            changeTileSize();
            resizeBoard();
        }
    });
    input.click(function () {
        this.select();
    });
    input.on("input", function () {
        let val = input.val();
        if (val < min) {
            val = min;
            input.val(val);
        }
        if (val > max) {
            val = max;
            input.val(val);
        }
        settings[key] = val;
        slider.val(val);
        localStorage.setItem(key, val);

        if (key === "tile-size") {
            changeTileSize();
            resizeBoard();
        }
    });
}

