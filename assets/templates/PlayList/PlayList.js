const template = document.createElement ("template")
template.innerHTML = `
<style>
#list {
    color: ivory;
    position: absolute;
    right: 0px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.option {
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    min-width: 220px;    
    justify-content: flex-end;
}

.option:hover {
    padding: 10px;
    font-size: 20px;
    transition: 0.3s;
}
</style>

<div id="list"></div>`
const templateImgPlay = document.createElement ("template")
templateImgPlay.innerHTML = `
<img src="./assets/templates/PlayList/assets/icon-play.svg" width="20" height="20"/>`

class PlayList extends HTMLElement {
    constructor () {
        super ()

        this.attachShadow({ mode: "open" });
        this.playlist = [];
        this.indexPlaylist = 0;
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

    setAudioController (audioController) {
        this.audioController = audioController
    }

    setPlaylist (playlist) {
        playlist.forEach ((piste) => this.addPiste (piste))
    }

    addPiste (piste) {
        this.playlist.push (piste)

        let option = document.createElement ("div")
        option.className = "option"
        let nameFile = piste.split ("/").at(-1)
        option.innerHTML = nameFile.substring (0, nameFile.lastIndexOf ('.'))

        if (this.indexPlaylist == this.playlist.indexOf (piste)) {
            option.prepend (templateImgPlay.content.cloneNode(true))
        }
        
        let index = this.playlist.length -1
        option.onclick = () => {
            if (index != this.indexPlaylist) {
                try {
                    this.shadowRoot.querySelectorAll ("img").forEach ((img) => img.remove ())
                } catch (e) {}
                this.indexPlaylist = index;
                this.audioController.setMusic (this.playlist[this.indexPlaylist], this.audioController.playingMusic)

                option.prepend (templateImgPlay.content.cloneNode(true))
            }
        }

        this.shadowRoot.querySelector ("#list").appendChild (option)
    }

    nextPiste () {
        this.indexPlaylist = (this.indexPlaylist >= this.playlist.length) ? 0 : this.indexPlaylist + 1
        this.audioController.setMusic (this.playlist[this.indexPlaylist], this.audioController.playingMusic)
        try {
            this.shadowRoot.querySelectorAll ("img").forEach ((img) => img.remove ())
        } catch (e) {}
        this.shadowRoot.querySelectorAll (".option")[this.indexPlaylist].prepend (templateImgPlay.content.cloneNode(true))
    }
}

customElements.define("play-list", PlayList);
