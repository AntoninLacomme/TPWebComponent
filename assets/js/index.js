import "../templates/myAudioComponent/MyAudioComponent.js"

let audioComponent = document.querySelector ("my-audioplayer")

window.addEventListener ("keyup", (ev) => {
    switch (ev.key.toUpperCase ()) {
        case " ": audioComponent.playPause () ;break;
        case "ARROWRIGHT": ev.ctrlKey ? audioComponent.avancerPlaylist ():audioComponent.clicAvancer (); break;
        case "ARROWLEFT": ev.ctrlKey ? audioComponent.reculerPlaylist ():audioComponent.clicReculer (); break;
        case "R": audioComponent.reset (); break;
        case "L": audioComponent.setLoop (); break;
    }
    let number = parseInt(ev.key.toUpperCase ())
    if (number+1) {
        audioComponent.setPercentCurrentTime (number * 10)
    }
})

window.addEventListener ("keypress", (ev) => {
    switch (ev.key.toUpperCase ()) {
        case "+": audioComponent.addVolume (0.05); break;
        case "-": audioComponent.addVolume (-0.05); break;
    }
})