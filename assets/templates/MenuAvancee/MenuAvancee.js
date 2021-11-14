const template = document.createElement ("template")
template.innerHTML = 
`<style>
div#main {
    position: absolute;
    bottom: 110px;
    right: 0px;
    display: flex;
    align-items: flex-end;
}

.controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
}

.controls > label {
    font-weight: bold;
    padding: 0.4em;
}

.controls:hover > label {
    color: gray;
}

td {
    cursor: pointer;
}


</style>
<div id="main">
    <div class="controls">
        <label>Balance</label>
        <webaudio-knob
            id="balanceGaucheDroite"
            src="assets/templates/MenuAvancee/assets/imgs/WOK_vintage_AbbeyRoad_PAN_Knob.png"
            min="-1" max="1" step="0.1"
            sprites="127" diameter="64"
            width="70" height="80"
        ></webaudio-knob>
        <webaudio-param id="param-balanceGaucheDroite" min="-1" max="1"></webaudio-param>
    </div>
    <div class="controls">
        <label>Gain</label>
        <webaudio-knob
            id="balanceGain"
            src="assets/templates/MenuAvancee/assets/imgs/LittlePhatty.png"
            min="0" max="1" step="0.01" value="1" sprites="100"
        ></webaudio-knob>
        <webaudio-param id="param-balanceGain" min="0" max="1"></webaudio-param>
    </div>
    <div class="controls">
        <label>60Hz</label>
        <webaudio-knob class="gain" value="0" step="1" min="-30" max="30" sprites="100" diameter="64"
            src="assets/templates/MenuAvancee/assets/imgs/simplegray.png"></webaudio-knob>
        <webaudio-param id="gain0" link="slider0"></webaudio-param>
    </div>
    <div class="controls">
        <label>170Hz</label>
        <webaudio-knob class="gain" value="0" step="1" min="-30" max="30" sprites="100" diameter="64" 
            src="assets/templates/MenuAvancee/assets/imgs/simplegray.png"></webaudio-knob>
        <webaudio-param id="gain1">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>350Hz</label>
        <webaudio-knob class="gain" value="0" step="1" min="-30" max="30" sprites="100" diameter="64" 
            src="assets/templates/MenuAvancee/assets/imgs/simplegray.png"></webaudio-knob>
        <webaudio-param id="gain2">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>1000Hz</label>
        <webaudio-knob class="gain" value="0" step="1" min="-30" max="30" sprites="100" diameter="64" 
            src="assets/templates/MenuAvancee/assets/imgs/simplegray.png"></webaudio-knob>
        <webaudio-param id="gain3">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>3500Hz</label>
        <webaudio-knob class="gain" value="0" step="1" min="-30" max="30" sprites="100" diameter="64" 
            src="assets/templates/MenuAvancee/assets/imgs/simplegray.png"></webaudio-knob>
        <webaudio-param id="gain4">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <label>10000Hz</label>
        <webaudio-knob class="gain" value="0" step="1" min="-30" max="30" sprites="100" diameter="64" 
            src="assets/templates/MenuAvancee/assets/imgs/simplegray.png"></webaudio-knob>
        <webaudio-param id="gain5">0 dB</webaudio-param>
    </div>
    <div class="controls">
        <table>
            <tbody>
                <tr>
                    <td rowspan="9">
                        <webaudio-slider id="biquadFilterTypeSelector" tracking="abs" min="0" max="8" value="6" width="24" height="250"></webaudio-slider>
                    </td>
                    <td class="option-slider-visualisation"><option value="allpass">allpass</option></td>
                </tr>
                <tr><td class="option-slider-visualisation"><option value="notch">notch</option></td></tr>
                <tr><td class="option-slider-visualisation"><option value="peaking" selected>peaking</option></td></tr>
                <tr><td class="option-slider-visualisation"><option value="notch">notch</option></td></tr>
                <tr><td class="option-slider-visualisation"><option value="highshelf">highshelf</option></td></tr>
                <tr><td class="option-slider-visualisation"><option value="lowshelf">lowshelf</option></td></tr>
                <tr><td class="option-slider-visualisation"><option value="bandpass">bandpass</option></td></tr>
                <tr><td class="option-slider-visualisation"><option value="highpass">highpass</option></td></tr>
                <tr><td class="option-slider-visualisation"><option value="lowpass">lowpass</option></td></tr>
            </tbody>
        </table>
    </div>
</div>`


class MenuAvancee extends HTMLElement {
    constructor () {
        super ()
        this.attachShadow({ mode: "open" });

        this.hidden = true
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
            eq.type = this.shadowRoot.querySelectorAll(".option-slider-visualisation > option")[8-this.shadowRoot.querySelector("#biquadFilterTypeSelector").value].value;
            eq.gain.value = 0;
            filters.push(eq);
        });

        this.shadowRoot.querySelectorAll(".option-slider-visualisation").forEach ((elem, index) => {
            elem.addEventListener ("click", () => {
                this.shadowRoot.querySelector("#biquadFilterTypeSelector").value = 8-index
                
                filters.forEach ((filtre) => {
                    filtre.type = elem.children[0].value
                })
            })
        })

        this.shadowRoot.querySelector("#biquadFilterTypeSelector").onchange = (ev) => {
            filters.forEach ((filtre) => {
                this.shadowRoot.querySelectorAll(".option-slider-visualisation > option").forEach ((elem, index) => {
                    if (8-index == ev.target.value) {
                        filtre.type = elem.value
                    }
                })
            })
        }

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

    hide () { this.hidden = !this.hidden }
}

customElements.define("menu-avance", MenuAvancee);