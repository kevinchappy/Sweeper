let settings = {
    "rows" : 10,
    "columns" : 8,
    "mines" : 8
};

 function initializeSettings() {
     if(localStorage.hasOwnProperty("rows")){
         settings.rows = parseInt(localStorage.getItem("rows"));
         $("#rows-slider").val(settings["rows"]);
         $("#rows-input").val(settings["rows"]);
     }
     if(localStorage.hasOwnProperty("columns")){
         settings.columns = parseInt(localStorage.getItem("columns"));
         $("#columns-slider").val(settings["columns"]);
         $("#columns-input").val(settings["columns"]);
     }

     if(localStorage.hasOwnProperty("mines")){
         settings.mines = parseInt(localStorage.getItem("mines"));
         $("#mines-slider").val(settings["mines"]);
         $("#mines-input").val(settings["mines"]);
     }

     setupInput($("#rows-slider"), $("#rows-input"), 4, 30 , "rows");
     setupInput($("#columns-slider"), $("#columns-input"), 4, 30, "columns");
     setupInput($("#mines-slider"), $("#mines-input"), 8, 600, "mines");
}


function setupInput(slider, input, min, max, key){
    slider.on("input", function (){
        let val = slider.val();
        settings[key] = val;
        input.val(val);
        localStorage.setItem(key, val);
    });

    input.on("submit", function (){
        let val = input.val();
        if (val < min){
            val = min;
            input.val(val);
        }
        if (val > max){
            val = max;
            input.val(val);
        }
        settings[key] = val;
        slider.val(val);
        localStorage.setItem(key, val);
    });
}