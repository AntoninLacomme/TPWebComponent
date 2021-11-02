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
        border: outset 5px gray;
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

</style>

<div>
    <span class="span-speed">
        <label for="volume">Vitesse</label>
        <input type="range" id="speed" name="speed" min="0.25" max="4" step="0.25" value="1" list="tickmarks">
        <datalist id="tickmarks">
            <option value="0.25">
            <option value="0.5" label="0.5">
            <option value="0.75">
            <option value="1" label="1">
            <option value="1.5">
            <option value="2" label="2">
            <option value="2.5">
            <option value="3" label="3">
            <option value="3.5">
            <option value="4" label="4">
        </datalist> 
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

    <button id="loop">
        <img src="./assets/templates/ButtonPlayPause/assets/icon-loop.png" width="20"/> 
    </button>

    <span class="span-volume">
        <label for="volume">Volume</label>
        <input type="range" id="volume" name="volume" min="0" max="1" step="0.05" value="1">
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
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));

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

    setAudioController (audioComponent) {
        this.audioComponent = audioComponent;
    }

    setloop (loop) {
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
        this.shadowRoot.querySelector ("#loop").style.borderStyle = loop ? "inset" : "outset"
        this.audioComponent.loop (loop)
    }

    clicButtonReset () {
        this.audioComponent.reset ()
    }

    switchVolume () { this.audioComponent.setVolume (this.shadowRoot.querySelector ("#volume").value) }

    switchSpeed () { this.audioComponent.setSpeed (this.shadowRoot.querySelector ("#speed").value) }
}

customElements.define("button-play-pause", ButtonPlayPause);