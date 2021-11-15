import "../ButtonPlayPause/ButtonPlayPause.js"
import "../PlayList/PlayList.js"
import "../MenuAvancee/MenuAvancee.js"

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

    #choiceVisualisation {
        position: absolute;
        top: 0px;
        left: 0px;
        color: ivory;
    }

    #fantaisie {
        position: absolute;
        top: 0px;
        left: 0px;
        background-color: rgb(60,60,60);
    }

    #show-hide-menu-avance {
        position: absolute;
        right: 1em;
    }

    #time {
        color: ivory;
        position: absolute;
        left: 1em;
        top: 1em;
    }

    .option-slider-visualisation {
        cursor: pointer;
    }
</style>

<div>
    <audio id="myPlayer" crossorigin="anonymous">Your browser does not support the <code>audio</code></audio>
    <canvas id="fantaisie"></canvas>
    <div id="choiceVisualisation">
        <table>
            <tbody>
                <tr>
                    <td rowspan="3">
                        <webaudio-slider id="slider-visualisation" tracking="abs" min="0" max="2" value="2" width="24" height="64"></webaudio-slider>
                    </td>
                    <td class="option-slider-visualisation">Star</td>
                </tr>
                <tr><td class="option-slider-visualisation">Line</td></tr>
                <tr><td class="option-slider-visualisation">All</td></tr>
            </tbody>
        </table>
    </div>
    <div id="container-playlist">
        <play-list></play-list>
    <div>
       
    <div id="name-piste"></div>
    <canvas id="canvas-music-progress-bar"></canvas>
        <div id="font-progress-bar">
            <div id="progress-bar"></div>
        </div>
        
        <div id="bandeau-play-pause">
            <span id="time"></span>
            <button-play-pause id="play-pause"></button-play-pause>
            <menu-avance></menu-avance>
            <webaudio-switch id="show-hide-menu-avance" width="60" height="60">+</webaudio-switch>
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

        this.barWidth = 0
        this.heightScale = 0
    }

    fixRelativeURLs () {
        this.shadowRoot.querySelectorAll ("webaudio-knob, webaudio-slider, webaudio-switch, img").forEach ((elem) => {
            const path = e.src;
            e.src = getBaseURL () + path
        })
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.shadowRoot.querySelector ("#show-hide-menu-avance").onclick = () => this.shadowRoot.querySelector ("menu-avance").hide ()

        this.shadowRoot.querySelectorAll ("button-play-pause, play-list, menu-avance").forEach ((elem) => {
            elem.setAudioController (this)
        })

        this.shadowRoot.querySelectorAll (".option-slider-visualisation").forEach ((option, index) => {
            option.addEventListener ("click", () => {
                this.shadowRoot.querySelector ("#slider-visualisation").value = 2-index;
            })
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
            this.shadowRoot.querySelector ("#time").innerHTML = this.convertMillisecondeToMinute (this.audio.currentTime) + " / " + this.convertMillisecondeToMinute (this.audio.duration)
        })

        this.setEventsFontProgressBar (this.shadowRoot.querySelector ("#font-progress-bar"))


        this.setFantaisie ()

        this.setCanvas ()
        this.ctx = this.canvas.getContext ("2d")
        this.ctxFantaisie = this.canvasFantaisie.getContext ("2d")
        this.mediaElementSource = this.audioCtx.createMediaElementSource (this.audio)

        this.shadowRoot.querySelector ("button-play-pause").init ()
        this.shadowRoot.querySelector ("menu-avance").init ()

        this.buildAudioGraph ()
        this.buildAudioFantaisie ()
        this.animationLoop ()
    }

    convertMillisecondeToMinute (millisecondes) {
        let secondes = millisecondes % 1000;
        let minutes = (secondes / 60) | 0;
        secondes = (secondes - minutes * 60) | 0;

        minutes = (minutes <10) ? "0" + minutes : minutes
        secondes = (secondes <10) ? "0" + secondes : secondes
        return minutes + ":" + secondes
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
        this.canvasFantaisie.width = window.innerWidth
        this.canvasFantaisie.height = window.innerHeight - this.shadowRoot.querySelector ("#font-progress-bar").clientHeight
        this.heightScale = this.canvasFantaisie.height / 128
        this.heightStereo = this.canvasFantaisie.height / 255

        window.addEventListener ("resize", () => {
            this.canvasFantaisie.width = window.innerWidth;
            this.canvasFantaisie.height = window.innerHeight - this.shadowRoot.querySelector ("#font-progress-bar").clientHeight
            this.barWidth = this.canvasFantaisie.width / this.bufferLengthFantaisie;
            this.heightScale = this.canvasFantaisie.height / 128
            this.heightStereo = this.canvasFantaisie.height / 255
            this.sliceWidth = this.canvasFantaisie.width / this.bufferLengthStereo;
        })
    }

    buildAudioGraph () {
        // Create an analyser node
        this.analyserNode = this.audioCtx.createAnalyser ();
        this.analyserNodeStereo = this.audioCtx.createAnalyser ();

        // Try changing for lower values: 512, 256, 128, 64...
        this.analyserNode.fftSize = 128;
        this.analyserNodeStereo.fftSize = 1024;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.bufferLengthStereo = this.analyserNodeStereo.frequencyBinCount;
        
        this.dataArray = new Uint8Array (this.bufferLength);
        this.dataArrayStereo = new Uint8Array (this.bufferLengthStereo);
        this.lastDataArrayStereo = null;
        this.sliceWidth = this.canvasFantaisie.width / this.bufferLengthStereo;

        // lecteur audio -> analyser -> haut parleurs
        this.mediaElementSource.connect(this.analyserNode);
        this.mediaElementSource.connect(this.analyserNodeStereo)
        //this.analyserNode.connect(this.audioCtx.destination);
    }

    buildAudioFantaisie () {
        // Create an analyser node
        this.analyserNodeFantaisie = this.audioCtx.createAnalyser();

        // Try changing for lower values: 512, 256, 128, 64...
        this.analyserNodeFantaisie.fftSize = 512;
        this.bufferLengthFantaisie = this.analyserNodeFantaisie.frequencyBinCount;        
        this.angleIConst = 2 * Math.PI / this.bufferLengthFantaisie;
        this.barWidth = this.canvasFantaisie.width / this.bufferLengthFantaisie;
        
        this.dataArrayFantaisie = new Uint8Array(this.bufferLengthFantaisie);

        // lecteur audio -> analyser -> haut parleurs
        this.mediaElementSource.connect(this.analyserNodeFantaisie);
        //this.analyserNode.connect(this.audioCtx.destination);
    }

    
    animationLoop() {
        this.drawCanvas ()
        this.ctxFantaisie.clearRect (0, 0, this.canvasFantaisie.width, this.canvasFantaisie.height)
        switch (this.shadowRoot.querySelector ("#slider-visualisation").value) {
            case 2:
                this.drawFantaisie ()
                this.angleAlpha += 0.001;
                break;
            case 1:  
                this.drawStereo ()
                this.lastDataArrayStereo = JSON.parse(JSON.stringify(this.dataArrayStereo));
                break;
            case 0:
                this.drawFantaisie ()
                this.drawStereo ()
                this.lastDataArrayStereo = JSON.parse(JSON.stringify(this.dataArrayStereo));
                this.angleAlpha += 0.001;

                if (this.angleAlpha == 360) { this.angleAlpha = 0 }
        }
        
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

    // pfiou dur dur à opti cette fonction
    // mais elle ne fait plus bruler le pc comme lors des premiers essais, et ça c'est bien
    // mais bon elle reste gourmande :(
    drawFantaisie () {
        this.analyserNodeFantaisie.getByteFrequencyData(this.dataArrayFantaisie);
        this.ctxFantaisie.save ()
        this.ctxFantaisie.translate (this.canvasFantaisie.width / 2, this.canvasFantaisie.height / 2)
        this.ctxFantaisie.rotate (this.angleAlpha)
        
        // un calcul effectué plusieurs fois dans une boucle est un calcul inutile, pk recalculer plusieurs fois la demi hauteur d'une barre ???
        let angleI = 0, height = 0, demiBarWidth = -this.barWidth / 2, demiHeight = 0;

        // pour chaque fréquences
        for (let i = 0; i < this.bufferLengthFantaisie; i++) {
            angleI = i * this.angleIConst
            height = this.dataArray[i] * this.heightScale
            demiHeight = -height / 2
            this.ctxFantaisie.fillStyle = 'rgb(' + 50 + ',' + 
                                                50 + ',' + 
                                                (this.dataArray[i] + 120) + ')';
            // k permet une symétrie en dessinant à gauche et à droite (k=-1 et k=1)
            for (let k=-1; k<2; k=k+2) {
                this.ctxFantaisie.save ()
                this.ctxFantaisie.rotate (k*angleI)
                // et enfin on veut dessiner une étoile à nbBranches branches
                // pas besoin de passer n fois dans la boucle, on passe n/2 fois, et on dessine le symétrique à la barre courante au passage
                for (let j=0; j<this.nbBranches / 2; j++) {
                    this.ctxFantaisie.rotate (this.angleJ)
                    this.ctxFantaisie.fillRect(demiBarWidth, demiHeight, 
                                                this.barWidth, height);
                }
                this.ctxFantaisie.restore ()
            }
        }
        this.ctxFantaisie.restore ()
    }

    drawStereo () {
        if (this.lastDataArrayStereo == null)
            this.lastDataArrayStereo = this.dataArrayStereo
        this.ctxFantaisie.save();
        this.analyserNodeStereo.getByteTimeDomainData(this.dataArrayStereo);
        for(var i = 0; i < this.bufferLengthStereo; i++) {
            this.ctxFantaisie.translate (this.sliceWidth, 0)
            this.ctxFantaisie.fillStyle = "hsl( " + Math.round((i*360)/this.bufferLengthStereo) + ", 100%, 50%)";
       
            this.ctxFantaisie.fillRect (0, this.dataArrayStereo[i] * this.heightStereo,
                                        this.sliceWidth, (this.lastDataArrayStereo[i] - this.dataArrayStereo[i]) * this.heightStereo)
        }   
        this.ctxFantaisie.restore();
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
        this.shadowRoot.querySelector ("button-play-pause").setPlayPause (this.playingMusic)
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
    playPause () { this.play (this.playingMusic = !this.playingMusic) }

    clicAvancer () { this.avancer (10) }
    clicReculer () { this.avancer (-10) }
    setLoop () { this.shadowRoot.querySelector ("button-play-pause").setloop (!this.getPlayer ().loop) }
    addVolume (vol) {
        let volume = this.getPlayer ().volume + vol
        if (volume < 0) volume = 0
        if (volume > 1) volume = 1
        this.getPlayer ().volume = volume
        this.shadowRoot.querySelector ("button-play-pause").setVolume (this.getPlayer ().volume)
    }
    avancerPlaylist () { this.shadowRoot.querySelector ("play-list").avancer (1) }
    reculerPlaylist () { this.shadowRoot.querySelector ("play-list").avancer (-1) }
    setPercentCurrentTime (percent) {
        this.audio.currentTime = this.audio.duration * percent / 100
    }
}

customElements.define("my-audioplayer", MyAudioComponent);
