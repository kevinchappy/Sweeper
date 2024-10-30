$(document).ready(function () {
    initializeSettings();
    read();
    initGame();
    $(window).resize(resizeBoard);
    $("#flag-button").click(restart);

});


function handleAudioButton(){

}