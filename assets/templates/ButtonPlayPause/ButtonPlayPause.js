import './libs/webaudio-controls.js';

const getBaseURL = () => {
    const base = new URL('.', import.meta.url);
    return `${base}`;
};

const template = document.createElement ("template");
template.innerHTML = 
`<style>
    div{
        display: flex;
        align-content: flex-start;
        align-items: center;
        position: relative;
        top: -20px;
        color: ivory;
    }

    button {
        opacity: inherit;
    }

    #search-button {
        border-radius: 100%;
        width: 100px;
        height: 100px;
        border: solid 10px green;
        background-color: orange;
        text-align: center;
        padding: 0;
    }
    
    button:hover {
        background-color: gray;
    }

    #search-button:hover {
        background-color: rgb(255,69,0);
    }

    #back-10 {
        width: 50px;
        border-top-left-radius: 1em;
        border-bottom-left-radius: 1em;
    }

    #avance-10 {
        width: 50px;
        border-top-right-radius: 1em;
        border-bottom-right-radius: 1em;
    }

    #loop {
        margin-left: 2em;
    }

    span {
        display: flex;
        flex-direction: column;
    }

    span > input {
        width: 300px;
    }

    .span-volume {
        margin-left: 2em;
    }

    .span-speed {
        margin-right: 2em;
        align-items: flex-end;
    }

    #reset {
        border-radius: 100%;
        width: 45px;
        height: 45px;
        border: solid thin black;
        margin-right: 2em;
    }

    img {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    #speed, #volume, #loop {
        position: relative;
        top: 23px;
    }

</style>

<div>
    <span class="span-speed">
        <webaudio-knob id="speed" tooltip="Vitesse:%s" src="assets/templates/ButtonPlayPause/assets/bouton2.png" 
        sprites="127" value=1 min="0.25" max="4" step=0.25>
        Volume</webaudio-knob>
    </span>
    <button id="reset">
        <img src="./assets/templates/ButtonPlayPause/assets/icon-reset.png" width="20"/> 
    </button>
    <button id="back-10">
        <img src="./assets/templates/ButtonPlayPause/assets/icon-reculer-10.png" width="20"/> 
    </button>
    <button id="search-button"></button>
    <button id="avance-10">
        <img src="./assets/templates/ButtonPlayPause/assets/icon-avancer-10.png" width="20"/> 
    </button>

    <webaudio-switch midilearn="1" id="loop"
        src="assets/templates/ButtonPlayPause/assets/switch_toggle.png" height="56" width="56" tooltip="Loop">
    </webaudio-switch>

    <span class="span-volume">
        <webaudio-knob id="volume" tooltip="Volume:%s" src="assets/templates/ButtonPlayPause/assets/bouton2.png" 
        sprites="127" value=0.05 min="0" max="1" step=0.01>
        Volume</webaudio-knob>
    </span>
</div>`

const templatePause = document.createElement ("template");
const templatePlay = document.createElement ("template");
templatePlay.innerHTML = `<img src="./assets/templates/ButtonPlayPause/assets/icon-play.svg" width="80"/>`;
templatePause.innerHTML = `<img src="./assets/templates/ButtonPlayPause/assets/icon-pause.svg" width="80"/>`;


class ButtonPlayPause extends HTMLElement {
    constructor () {
        super();

        this.attachShadow({ mode: "open" });

        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.basePath = getBaseURL();
    }

    connectedCallback() {
        // set button play / pause
        let buttonPlayPause = this.shadowRoot.querySelector ("#search-button")
        buttonPlayPause.innerHTML = templatePlay.innerHTML
        let clic = false
        buttonPlayPause.onclick = () => this.clicButtonPlayPause (clic = !clic)

        // set button reculer de 10s
        this.shadowRoot.querySelector ("#back-10").onclick = () => this.clicButtonReculer ()

        // set button avancer de 10s
        this.shadowRoot.querySelector ("#avance-10").onclick = () => this.clicButtonAvancer ()

        // set button loop
        this.loop = false;
        this.shadowRoot.querySelector ("#loop").onclick = () => this.clicButtonLoop (this.loop = !this.loop)

        // set button reset
        this.shadowRoot.querySelector ("#reset").onclick = () => this.clicButtonReset ()

        // set range volume
        this.shadowRoot.querySelector ("#volume").oninput = () => this.switchVolume ()
        
        // set range speed
        this.shadowRoot.querySelector ("#speed").oninput = () => this.switchSpeed ()
    }

    init () {
        this.switchVolume ()
        this.switchVolume ()
    }

    setAudioController (audioComponent) {
        this.audioComponent = audioComponent
    }

    setloop (loop) {
        this.shadowRoot.querySelector ("#loop").value = loop;
        this.loop = loop
        this.clicButtonLoop (this.loop)
    }

    clicButtonPlayPause (clic) {
        let button = this.shadowRoot.querySelector ("#search-button")
        if (clic) {
            button.innerHTML = templatePause.innerHTML
        } else {
            button.innerHTML = templatePlay.innerHTML
        }
        this.audioComponent.play (clic)
    }

    clicButtonReculer () {
        this.audioComponent.avancer (-10)
    }

    clicButtonAvancer () {
        this.audioComponent.avancer (10)
    }

    clicButtonLoop (loop) {
        this.audioComponent.loop (loop)
    }

    clicButtonReset () {
        this.audioComponent.reset ()
    }

    switchVolume () { this.audioComponent.setVolume (this.shadowRoot.querySelector ("#volume").value) }

    switchSpeed () { this.audioComponent.setSpeed (this.shadowRoot.querySelector ("#speed").value) }
}

customElements.define("button-play-pause", ButtonPlayPause);