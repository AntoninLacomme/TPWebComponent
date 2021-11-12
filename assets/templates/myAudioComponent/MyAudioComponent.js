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
        left: 0px;
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

    #fantaisie {
        position: absolute;
        top: 0px;
        left: 0px;
        background-color: rgb(60,60,60);
    }
</style>

<div>
    <audio id="myPlayer" crossorigin="anonymous">Your browser does not support the <code>audio</code></audio>
    <canvas id="fantaisie"></canvas>
    <div id="container-playlist">
        <play-list></play-list>
    <div>
       
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

        this.playingMusic = false;
        //this.fixRelativeURLs ()

        this.nbBranches = 6;
        this.ecart = 1;
        
        this.angleIConst = 0;
        this.angleJ = 2 * this.ecart * Math.PI / (this.nbBranches);

        this.angleAlpha = 0;
    }

    fixRelativeURLs () {
        this.shadowRoot.querySelectorAll ("webaudio-knob, webaudio-slider, webaudio-switch, img").forEach ((elem) => {
            const path = e.src;
            e.src = getBaseURL () + path
        })
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.shadowRoot.querySelectorAll ("button-play-pause, play-list, menu-avance").forEach ((elem) => {
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
        
        let ctx = window.AudioContext || window.webkitAudioContext
        this.audioCtx = new ctx();
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


        this.setFantaisie ()

        this.setCanvas ()
        this.ctx = this.canvas.getContext ("2d")
        this.ctxFantaisie = this.canvasFantaisie.getContext ("2d")
        this.mediaElementSource = this.audioCtx.createMediaElementSource (this.audio)

        this.shadowRoot.querySelector ("button-play-pause").init ()

        this.buildAudioGraph ()
        this.buildAudioFantaisie ()
        this.animationLoop ()
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

        window.addEventListener ("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = this.shadowRoot.querySelector ("#font-progress-bar").clientHeight;
        })
    }

    setFantaisie () {
        this.canvasFantaisie = this.shadowRoot.querySelector ("canvas#fantaisie")
        this.canvasFantaisie.width = window.innerWidth;
        this.canvasFantaisie.height = window.innerHeight - this.shadowRoot.querySelector ("#font-progress-bar").clientHeight;

        window.addEventListener ("resize", () => {
            this.canvasFantaisie.width = window.innerWidth;
            this.canvasFantaisie.height = window.innerHeight - this.shadowRoot.querySelector ("#font-progress-bar").clientHeight;
        })
    }

    buildAudioGraph () {
        // Create an analyser node
        this.analyserNode = this.audioCtx.createAnalyser();

        // Try changing for lower values: 512, 256, 128, 64...
        this.analyserNode.fftSize = 128;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        
        this.dataArray = new Uint8Array(this.bufferLength);

        // lecteur audio -> analyser -> haut parleurs
        this.mediaElementSource.connect(this.analyserNode);
        //this.analyserNode.connect(this.audioCtx.destination);
    }

    buildAudioFantaisie () {
        // Create an analyser node
        this.analyserNodeFantaisie = this.audioCtx.createAnalyser();

        // Try changing for lower values: 512, 256, 128, 64...
        this.analyserNodeFantaisie.fftSize = 512;
        this.bufferLengthFantaisie = this.analyserNodeFantaisie.frequencyBinCount;        
        this.angleIConst = 2 * Math.PI / this.bufferLengthFantaisie;
        
        this.dataArrayFantaisie = new Uint8Array(this.bufferLengthFantaisie);

        // lecteur audio -> analyser -> haut parleurs
        this.mediaElementSource.connect(this.analyserNodeFantaisie);
        //this.analyserNode.connect(this.audioCtx.destination);
    }

    
    animationLoop() {
        this.drawCanvas ()
        this.drawFantaisie ()
        this.angleAlpha += 0.001;

        requestAnimationFrame(() => {
            this.animationLoop();
        });
    }

    drawCanvas () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.analyserNode.getByteFrequencyData(this.dataArray);

        let barWidth = this.canvas.width / this.bufferLength;
        let barHeight;
        let heightScale = this.canvas.height / 128;

        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = this.dataArray[i];

            this.ctx.fillStyle = 'rgb(' + (barHeight + 120) + ',50,50)';
            barHeight *= heightScale;
            this.ctx.fillRect((barWidth+1) * i, this.canvas.height - barHeight / 2, barWidth, barHeight / 2);
        }
    }

    drawFantaisie () {
        this.ctxFantaisie.clearRect (0, 0, this.canvasFantaisie.width, this.canvasFantaisie.height)

        this.analyserNodeFantaisie.getByteFrequencyData(this.dataArrayFantaisie);
        let barWidth = this.canvasFantaisie.width / this.bufferLengthFantaisie;
        let barHeight;
        let heightScale = this.canvasFantaisie.height / 128;

        this.ctxFantaisie.save ()
        this.ctxFantaisie.translate (this.canvasFantaisie.width / 2, this.canvasFantaisie.height / 2)
        this.ctxFantaisie.rotate (this.angleAlpha)
        
        let angleI = 0;

        for (let i = 0; i < this.bufferLengthFantaisie; i++) {
            angleI = i * this.angleIConst
            for (let k=-1; k<2; k=k+2) {
                this.ctxFantaisie.save ()
                this.ctxFantaisie.rotate (k*angleI)

                for (let j=0; j<this.nbBranches; j++) {
                    for (let t=0; t<2; t++) {
                        this.ctxFantaisie.save ()
                        this.ctxFantaisie.rotate (j* this.angleJ)
                        barHeight = this.dataArray[i];

                        this.ctxFantaisie.fillStyle = 'rgb(' + 50 + ',' + 
                                                                50 + ',' + 
                                                                (barHeight + 120) + ')';
                        this.ctxFantaisie.fillRect(0, 0, barWidth, barHeight * heightScale/ 2);
                        this.ctxFantaisie.restore ()
                    }
                }
                this.ctxFantaisie.restore ()
            }
        }
        this.ctxFantaisie.restore ()
    }

    setMusic (src, playing=false) {
        document.title = src.split("/").at(-1).toUpperCase ()
        this.play (false)
        this.reset ()
        this.audio.src = src
        this.play (playing)
        this.shadowRoot.querySelector ("#name-piste").innerHTML = src
    }

    play (playing) {
        this.playingMusic = playing;
        if (playing) {
            this.audio.play ()
            this.audioCtx.resume()
        } else {
            this.getPlayer ().pause () 
        }
    }
    avancer (time) { this.getPlayer ().currentTime += time }
    loop (loop) { this.getPlayer ().loop = loop }
    reset () { this.getPlayer ().currentTime = 0 }
    setVolume (volume) { if (this.getPlayer () != undefined) this.getPlayer ().volume = volume }
    setSpeed (speed) { if (this.getPlayer () != undefined) this.getPlayer ().playbackRate = speed }
}

customElements.define("my-audioplayer", MyAudioComponent);
