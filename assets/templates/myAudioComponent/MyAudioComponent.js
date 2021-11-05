import "../ButtonPlayPause/ButtonPlayPause.js"
import "../PlayList/PlayList.js"

const getBaseURL = () => { return new URL (".", import.meta.url)}

const template = document.createElement("template");
template.innerHTML = /*html*/`
<style>
    #bandeau-play-pause {
        position: absolute;
        bottom: 50px;
        background-color: black;
        display: flex;
        justify-content: center;
        height: 60px;
        width: 100%;
        z-index: 20;
        opacity: 0.8;
    }

    #font-progress-bar {
        position: absolute;
        bottom: 0px;
        height: 160px;
        width: 100%;
        z-index: 10;
    }
    #progress-bar {
        position: absolute;
        bottom: 0px;
        height: 160px;
        background-color: navy;
        z-index: 2;
        opacity: 0.8;
    }

    #canvas-music-progress-bar {
        position: absolute;
        bottom: 0px;
        backgroun-color: green;
        z-index: 1;
    }
    
    #name-piste {
        position: absolute;
        bottom: 160px;
        color: ivory;
        padding: 3px;
        text-decoration: underline;
        font-style: italic;
    }
</style>

<div>
    <audio id="myPlayer" crossorigin="anonymous">Your browser does not support the <code>audio</code></audio>
    <div id="container-playlist">
        <play-list></play-list>
    <div>

    <webaudio-slider midilearn="1" midicc="1.23" id="balance-gauche-droite"
        src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
        knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" 
        value="0.5" min="0" max="1" step="0.1" basewidth="24" baseheight="128" knobwidth="24" 
        knobheight="24" ditchlength="100" tooltip="Slider-L"></webaudio-slider>
    
    
    <div id="name-piste"></div>
    <canvas id="canvas-music-progress-bar"></canvas>
        <div id="font-progress-bar">
            <div id="progress-bar"></div>
        </div>
        <div id="bandeau-play-pause">
            <button-play-pause id="play-pause"></button-play-pause>
        </div>
    </div>
</div>
`;

class MyAudioComponent extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.fixRelativeURLs ()
    }

    fixRelativeURLs () {
        this.shadowRoot.querySelectorAll ("webaudio-knob, webaudio-slider, webaudio-switch, img").forEach ((elem) => {
            const path = e.src;
            e.src = getBaseURL () + path
        })
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.shadowRoot.querySelectorAll ("button-play-pause, play-list").forEach ((elem) => {
            elem.setAudioController (this)
        })

        this.audio = this.shadowRoot.querySelector ("#myPlayer")
        this.playlist = [];

        if (this.getAttribute ("src") != null) {
            this.playlist.push (this.getAttribute("src"))
        }
        let _playlist = this.getAttribute ("playlist");
        if (_playlist != null) {
            _playlist.split(",").forEach ((e) => {
                this.playlist.push (e.trim ())
            })
        }
        let _loop = this.getAttribute ("loop")
        if (_loop != null) {
            if (_loop.toUpperCase () == "TRUE") {
                this.shadowRoot.querySelector ("button-play-pause").setloop (true)
            } else if (_loop.toUpperCase () == "FALSE") {
                this.shadowRoot.querySelector ("button-play-pause").setloop (false)
            }
        }
        
        this.audioCtx = new AudioContext();
        this.indexPlaylist = 0;
        this.setMusic (this.playlist[this.indexPlaylist], false)

        this.playlist.forEach ((piste, index) => {
            if (piste.trim () != "")
                this.shadowRoot.querySelector ("play-list").addPiste (piste)
        })
        
        this.audio.onended = (ev) => {
            this.shadowRoot.querySelector ("play-list").nextPiste ()
        }

        this.audio.addEventListener('timeupdate', (ev) => {
            this.shadowRoot.querySelector ("#progress-bar").style.width = (this.audio.currentTime / this.audio.duration) * 100 + "%"
        })

        this.setEventsFontProgressBar (this.shadowRoot.querySelector ("#font-progress-bar"))

        this.setCanvas ()
        this.ctx = this.canvas.getContext ("2d")

        this.buildAudioGraph ()
        this.animationLoop ()

        this.shadowRoot.querySelector ("button-play-pause").init ()

        // set range gauche-droite
        console.log ("*********************************")
        // https://jsbin.com/jarimu/edit?html,js,output
        var source = this.audioCtx.createMediaElementSource (this.shadowRoot.querySelector ("#balance-gauche-droite"))
        var pannernode = this.audioCtx.createStereoPanner ()

        source.connect (pannernode)
        pannernode.connect (this.audioCtx.destination)
        console.log ("*********************************")
    }

    getPlayer () { return this.audio }

    setEventsFontProgressBar (container) {
        let mousedown = false;
        container.onmousemove = (ev) => {
            if (mousedown) { this.getPlayer ().currentTime = (ev.clientX / window.innerWidth) * this.audio.duration }
        }
        container.onmousedown = (ev) => {
            mousedown = true;
            this.getPlayer ().currentTime = (ev.clientX / window.innerWidth) * this.audio.duration
        }
        container.onmouseup = (ev) => {
            mousedown = false;
        }
        container.onmouseleave = (ev) => {
            mousedown = false;
        }
    }

    setCanvas () {
        this.canvas = this.shadowRoot.querySelector ("canvas#canvas-music-progress-bar")
        this.canvas.width = window.innerWidth;
        this.canvas.height = this.shadowRoot.querySelector ("#font-progress-bar").clientHeight;

        window.onresize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = this.shadowRoot.querySelector ("#font-progress-bar").clientHeight;
        }
    }

    buildAudioGraph () {
        let audioContext = this.audioCtx;

        let playerNode = audioContext.createMediaElementSource(this.audio);

        // Create an analyser node
        this.analyserNode = audioContext.createAnalyser();

        // Try changing for lower values: 512, 256, 128, 64...
        this.analyserNode.fftSize = 256;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // lecteur audio -> analyser -> haut parleurs
        playerNode.connect(this.analyserNode);
        this.analyserNode.connect(audioContext.destination);
    }

    
    animationLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.analyserNode.getByteFrequencyData(this.dataArray);

        let barWidth = this.canvas.width / this.bufferLength;
        let barHeight;
        let x = 0;

        // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
        // before drawing. This is the scale factor
        let heightScale = this.canvas.height / 128;

        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = this.dataArray[i];

            this.ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            barHeight *= heightScale;
            this.ctx.fillRect(x, this.canvas.height - barHeight / 2, barWidth, barHeight / 2);

            // 2 is the number of pixels between bars
            x += barWidth + 1;
        }
        // 3 on deplace les objets

        // 4 On demande au navigateur de recommencer l'animation
        requestAnimationFrame(() => {
            this.animationLoop();
        });
    }

    setMusic (src, play=false) {
        document.title = src.split("/").at(-1).toUpperCase ()
        this.play (false)
        this.reset ()
        this.audio.src = src
        this.play (play)
        this.shadowRoot.querySelector ("#name-piste").innerHTML = src
    }

    play (play) {
        if (play) {
            this.audio.play ()
            this.audioCtx.resume()
        } else {
            this.getPlayer ().pause () 
        }
    }
    avancer (time) { this.getPlayer ().currentTime += time }
    loop (loop) { this.getPlayer ().loop = loop; console.log (this.getPlayer ().loop)}
    reset () { this.getPlayer ().currentTime = 0 }
    setVolume (volume) { if (this.getPlayer () != undefined) this.getPlayer ().volume = volume }
    setSpeed (speed) { if (this.getPlayer () != undefined) this.getPlayer ().playbackRate = speed }
}

customElements.define("my-audioplayer", MyAudioComponent);
