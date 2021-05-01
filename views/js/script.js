var netflix = '/nouveau-jingle-netflix.mp3';
var munanyo = '/chupapi-short.mp3';

var audio = new Audio('https://www.myinstants.com/media/sounds/'+netflix);
audio.play();

var showModal = false;

function modal(title, img, description) {
    console.log(title, img, description);
    if (!showModal) {
        showModal = true;
        $('.blur').css('visibility', 'visible');
        $('.modal').css('visibility', 'visible');
    } else {
        showModal = false;
        $('.blur').css('visibility', 'hidden');
        $('.modal').css('visibility', 'hidden');
    }
}