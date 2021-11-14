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
})

window.addEventListener ("keypress", (ev) => {
    switch (ev.key.toUpperCase ()) {
        case "+": audioComponent.addVolume (0.05); break;
        case "-": audioComponent.addVolume (-0.05); break;
    }
})