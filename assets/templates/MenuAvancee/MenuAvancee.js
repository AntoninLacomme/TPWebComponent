const template = document.createElement ("template")
template.innerHTML = 
`<style>
div#main {
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 400px;
    height: 400px;
}

</style>
<div id="main">
    <div class="sliders-sep">
        <label>Balance Gauche Droite</label>
        <webaudio-slider
            id="balanceGaucheDroite"
            direction="horz"
            src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
            knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" 
            min="-1" max="1" step="0.1"
            width="100" height="20"
        ></webaudio-slider>
        <webaudio-param id="param-balanceGaucheDroite" min="-1" max="1" disabled="true"></webaudio-param>
    </div>
    <div class="sliders-sep">
        <label>Gain</label>
        <webaudio-slider
            id="balanceGain"
            direction="horz"
            src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
            knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" 
            min="0" max="1" step="0.1" value="1"
            width="100" height="20"
        ></webaudio-slider>
        <webaudio-param id="param-balanceGain" min="0" max="1" disabled="true"></webaudio-param>
    </div>
    <div class="controls">
        <label>60Hz</label>
        <webaudio-slider class="gain" direction="horz" value="0" step="1" min="-30" max="30"
            width="100" height="20"
            src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
            knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" ></webaudio-slider>
        <webaudio-param id="gain0">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>170Hz</label>
        <webaudio-slider class="gain" direction="horz" value="0" step="1" min="-30" max="30"
            width="100" height="20"
            src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
            knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" ></webaudio-slider>
        <webaudio-param id="gain1">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>350Hz</label>
        <webaudio-slider class="gain" direction="horz" value="0" step="1" min="-30" max="30"
            width="100" height="20"
            src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
            knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" ></webaudio-slider>
    <webaudio-param id="gain2">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>1000Hz</label>
        <webaudio-slider class="gain" direction="horz" value="0" step="1" min="-30" max="30"
            width="100" height="20"
            src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
            knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" ></webaudio-slider>
        <webaudio-param id="gain3">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>3500Hz</label>
        <webaudio-slider class="gain" direction="horz" value="0" step="1" min="-30" max="30"
            width="100" height="20"
            src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
            knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" ></webaudio-slider>
        <webaudio-param id="gain4">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>10000Hz</label>
        <webaudio-slider class="gain" direction="horz" value="0" step="1" min="-30" max="30"
            width="100" height="20"
            src="assets/templates/myAudioComponent/assets/imgs/vsliderbody.png" 
            knobsrc="assets/templates/myAudioComponent/assets/imgs/vsliderknob.png" ></webaudio-slider>
        <webaudio-param id="gain5">0 dB</webaudio-param>
  </div>
</div>`


class MenuAvancee extends HTMLElement {
    constructor () {
        super ()
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        
        this.shadowRoot.querySelector ("#param-balanceGaucheDroite").oninput = (e) => {
            let value = parseInt(this.shadowRoot.querySelector ("#param-balanceGaucheDroite > input").value)
            this.shadowRoot.querySelector ("#balanceGaucheDroite").value = value == NaN ? value : 0;
        }

        this.shadowRoot.querySelector ("#param-balanceGain").oninput = (e) => {
            let value = parseInt(this.shadowRoot.querySelector ("#param-balanceGain > input").value)
            this.shadowRoot.querySelector ("#balanceGain").value = value == NaN ? value : 0;
        }

        this.shadowRoot.querySelector ("#param-balanceDetune").oninput = (e) => {
            let value = parseInt(this.shadowRoot.querySelector ("#param-balanceDetune > input").value)
            this.shadowRoot.querySelector ("#balanceDetune").value = value == NaN ? value : 0;
        }

        this.shadowRoot.querySelector ("#param-balanceQ").oninput = (e) => {
            let value = parseInt(this.shadowRoot.querySelector ("#param-balanceQ > input").value)
            this.shadowRoot.querySelector ("#balanceQ").value = value == NaN ? value : 0;
        }


        this.shadowRoot.querySelectorAll (".webaudioctrl-tooltip").forEach ((elem) => elem.remove ())
    }

    setAudioController (audioController) {
        this.audioController = audioController
        
    }

    setBalanceGaucheDroite () {
        let balance = this.audioController.audioCtx.createStereoPanner();
        this.shadowRoot.querySelector ("#param-balanceGaucheDroite").value = Math.round(this.shadowRoot.querySelector ("#balanceGaucheDroite").value*100)/100
        this.shadowRoot.querySelector ("#balanceGaucheDroite").oninput = (e) => {
            balance.pan.value = e.target.value
            this.shadowRoot.querySelector ("#param-balanceGaucheDroite").value = Math.round(e.target.value*10)/10
        }
        return balance
    }

    setBalanceGain () {
        let masterGain = this.audioController.audioCtx.createGain ()
        this.shadowRoot.querySelector ("#param-balanceGain").value = Math.round(this.shadowRoot.querySelector ("#balanceGain").value*100)/100
        this.shadowRoot.querySelector ("#balanceGain").oninput = (e) => {
            masterGain.gain.value = e.target.value
            this.shadowRoot.querySelector ("#param-balanceGain").value = Math.round(e.target.value*10)/10
        }
        return masterGain
    }

    setDetune () {
        let filterNode = this.audioController.audioCtx.createBiquadFilter ()
        this.shadowRoot.querySelector ("#param-balanceDetune").value = Math.round(this.shadowRoot.querySelector ("#balanceDetune").value*100)/100
        this.shadowRoot.querySelector ("#balanceDetune").oninput = (e) => {
            filterNode.detune.value = e.target.value
            this.shadowRoot.querySelector ("#param-balanceDetune").value = Math.round(e.target.value*10)/10
        }
        return filterNode
    }

    setQ () {
        let filterNode = this.audioController.audioCtx.createBiquadFilter ()
        this.shadowRoot.querySelector ("#param-balanceQ").value = Math.round(this.shadowRoot.querySelector ("#balanceQ").value*100)/100
        this.shadowRoot.querySelector ("#balanceQ").oninput = (e) => {
            filterNode.Q.value = e.target.value
            this.shadowRoot.querySelector ("#param-balanceQ").value = Math.round(e.target.value*10)/10
        }
        return filterNode;
    }

    init () {
        // https://jsbin.com/tuvaxar/edit?html,js,output
        // https://jsbin.com/fekorej/edit?html,js,output
        var filters = [];

        // Set filters
        [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
            var eq = this.audioController.audioCtx.createBiquadFilter ()
            eq.frequency.value = freq;
            eq.type = "peaking";
            eq.gain.value = 0;
            filters.push(eq);
        });

        // filters.push (this.setQ ())
        // filters.push (this.setDetune ())
        filters.push (this.setBalanceGain ())
        filters.push (this.setBalanceGaucheDroite ())

        // Connect filters in serie
        this.audioController.mediaElementSource.connect(filters[0]);
        for(var i = 0; i < filters.length - 1; i++) {
            filters[i].connect(filters[i+1]);
            }

        // connect the last filter to the speakers
        filters[filters.length-1].connect(this.audioController.audioCtx.destination);
        

        this.shadowRoot.querySelectorAll (".gain").forEach ((elem, index) => {
            elem.addEventListener ("input", (ev) => {
                this.changeGain (filters, elem.value, index)
            })
        })        
    }

    changeGain (filters, sliderVal, nbFilter) {
        var value = parseFloat(sliderVal);
        filters[nbFilter].gain.value = value;
        
        // update output labels
        var output = this.shadowRoot.querySelector("#gain"+nbFilter);
        output.value = value + " dB";
    }
}

customElements.define("menu-avance", MenuAvancee);