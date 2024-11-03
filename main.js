const audio = $("#audio");
const audioImage = $("#audio-image");
const flagButton = $("#flag-button")
const audioButton = $("#audio-button");

/*
 * Starting point for websites
 */
$(document).ready(function () {
    initSaves();
    initSettings();
    initGame();
    $(window).resize(resizeBoard);
    $("#smiley-button").click(restart);
    audioButton.click(handleAudioButton);
    flagButton.click(handleFlagButton);
});

/*
 * Handles audio button functionality. Toggles audio on or off and changes button properties to reflect state.
 * Changed button image and background color.
 */
function handleAudioButton() {
    if (audio[0].paused) {
        audio[0].play();
        audioButton.css("background", "darkgray")
        audioImage.attr("src", "images/sound.png");
    } else {
        audio[0].pause();
        audioButton.css("background", "#dadada");
        audioImage.attr("src", "images/mute.png");
    }
}

/*
 * Handles flag button functionality. Toggles flag mode on or off and changes button properties to reflect state.
 * Changes button image and background color.
 */
function handleFlagButton() {
    if (flagMode) {
        flagMode = false;
        flagButton.css("background", "#dadada");
    } else {
        flagMode = true;
        flagButton.css("background", "darkgray");
    }
}