let audio = $("#audio");
let audioImage = $("#audio-image");
let flagButton = $("#flag-button")

$(document).ready(function () {
    read();
    initializeSettings();
    initGame();
    $(window).resize(resizeBoard);
    $("#smiley-button").click(restart);
    $("#audio-button").click(handleAudioButton);
    flagButton.click(handleFlagButton);
});


function handleAudioButton(){
    if (audio[0].paused) {
        audio[0].play();

        audioImage.attr("src", "images/sound.png");
    }else{
        audio[0].pause();
        audioImage.attr("src", "images/mute.png");
    }
}

function handleFlagButton(){
    if (flagMode){
        flagMode = false;
        flagButton.css("background", "#dadada");
    }else{
        flagMode = true;
        flagButton.css("background", "darkgray");
    }
}