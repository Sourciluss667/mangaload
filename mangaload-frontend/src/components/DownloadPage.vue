<template>
<div>
  <router-link to="/" class="icon-link" style="margin-left: 1%;text-decoration: none;"><i class="fas fa-home"></i> Home</router-link>
  <div style="text-align: center;">
    <h1>Liste des chapitres</h1>
    <h2>{{ displayName }}</h2>

    <div class="chapters-list">
      <div v-for="(chapter, index) in chapters" v-bind:key="index">
        <p v-if="!queue.includes(chapter.ch)">
          {{ chapter.title }}
          <a :href="chapter.link" target="_blank" class="icon-link" title="Voir sur JAPSCAN"><i class="fas fa-share-square"></i></a>
          <a class="icon-link" title="Ajouter aux téléchargements !" v-on:click="addQueue(chapter.ch)"><i class="fas fa-file-download"></i></a>
        </p>

        <p v-else class="added">
          {{ chapter.title }}
          <a :href="chapter.link" target="_blank" class="icon-link" title="Voir sur JAPSCAN"><i class="fas fa-share-square"></i></a>
          <a class="icon-link" title="Retirer des téléchargements !" v-on:click="removeQueue(chapter.ch)"><i class="fas fa-trash-alt"></i></a>
        </p>
      </div>
      <div style="height: 60px;"></div>
    </div>
  </div>
  <!-- POPUP queue -->
  <div id="popup-queue" class="popup-inactive">
    <div v-for="(ch, index) in queue" v-bind:key="index">
      Chapitre {{ ch }}
    </div>
  </div>
  <!-- Barre de téléchargements -->
  <div class="download-bar" id="download-bar">
    <div class="dl-bar-left column">
      <span class="dlbar-center">
        &nbsp;<a v-on:click="popupQueueSwitch()"><i class="fas fa-stream icon-link"></i></a>
      </span>
    </div>
    <div class="dl-bar-mid column">
      <span class="dlbar-center">
        <span v-if="statut === 0">
          En attente...
        </span>
        <span v-else-if="statut === 1" style="color: #87CEEB;">
          En cours... <a v-on:click="showDownloadingDetails()"><i class="fas fa-angle-double-up icon-link" id="showDetailsIcon"></i></a>
        </span>
        <span v-else-if="statut === 2" style="color: green;">
          Fini !
        </span>
        <span v-else-if="statut === -1" style="color: red;">
          Error !
        </span>
      </span>
    </div>
    <div class="dl-bar-right column">
      <span class="dlbar-center">
        <a v-on:click="startDownload()" v-if="statut === 0"><i class="fas fa-play icon-link"></i></a>
        <a v-else-if="statut === 1"><i class="fas fa-spinner icon-link loading-icon"></i></a>
        &nbsp;
      </span>
    </div>
    <!-- Download details -->
    <div class="ft-dl-details dl-details-inactive" id="footer-download-details">
      <br><br>
      <div v-for="(el, index) in downloadState" v-bind:key="index" style="margin-bottom: 10px;"> <!-- chapter: chapter, pageCount: pageCount, lastPageDownloaded: 0 -->
        Chapitre {{ el.chapter }} <div class="progress"><div class="progress-value" :id="'progress-' + el.chapter"></div></div> {{ el.lastPageDownloaded }} / {{ el.pageCount }}
      </div>
      <br><br>
    </div>
  </div>
</div>
</template>

<script>
import { URL_BACKEND } from '../config.js'

export default {
  name: 'DownloadPage',
  data () {
    return {
      name: '',
      displayName: '',
      chapters: [],
      queue: [],
      statut: 0,
      intervalID: undefined,
      downloadState: []
    }
  },
  methods: {
    addQueue (ch) {
      if (this.statut === 0) {
        this.queue.push(ch)
      }
    },
    removeQueue (ch) {
      if (this.statut === 0) {
        const index = this.queue.indexOf(ch)
        this.queue.splice(index, 1)
      }
    },
    popupQueueSwitch () {
      const e = document.getElementById('popup-queue')
      if (e.classList.contains('popup-inactive')) {
        e.classList.remove('popup-inactive')
        e.classList.add('popup-active')
      } else {
        e.classList.remove('popup-active')
        e.classList.add('popup-inactive')
      }
    },
    async startDownload () {
      this.statut = 1

      const info = {name: this.name, chapters: this.queue}

      const response = await fetch(`${URL_BACKEND}/japscan/startDownload`, {
        method: 'POST',
        body: JSON.stringify(info),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        this.statut = 1
      } else {
        this.statut = -1
      }
    },
    showDownloadingDetails () {
      const footer = document.getElementById('download-bar')
      const details = document.getElementById('footer-download-details')
      const icon = document.getElementById('showDetailsIcon')
      if (details.classList.contains('dl-details-inactive')) {
        footer.style.height = 'auto'
        details.classList.remove('dl-details-inactive')
        details.classList.add('dl-details-active')
        icon.classList.remove('fa-angle-double-up')
        icon.classList.add('fa-angle-double-down')
      } else {
        footer.style.height = '50px'
        details.classList.remove('dl-details-active')
        details.classList.add('dl-details-inactive')
        icon.classList.remove('fa-angle-double-down')
        icon.classList.add('fa-angle-double-up')
      }
    }
  },
  watch: {
    statut: function (s) {
      if (s === 1) {
        // Check le dl ici
        this.intervalID = setInterval(async function () {
          console.log('name: ' + this.name)
          const response = await fetch(`${URL_BACKEND}/japscan/downloadStatus/${this.name}`)
          const info = await response.json()
          if (info.chapters.length === 0) {
            this.statut = 2
          }
          this.downloadState = info.status
        }.bind(this), 3000)
      } else if (s === 2) {
        // stoppé le check
        clearInterval(this.intervalID)
      }
    },
    downloadState: function (dlState) {
      dlState.forEach(e => {
        const progressBar = document.getElementById('progress-' + e.chapter)
        const percent = (100 * e.lastPageDownloaded) / e.pageCount
        if (`${percent}%` !== progressBar.style.width) {
          progressBar.animate({
            width: [progressBar.style.width, `${percent}%`]
          }, {duration: 3000, iterations: 1})
          progressBar.style.width = `${percent}%`
        }
      })
    }
  },
  created: async function () {
    this.name = this.$route.params.name
    this.displayName = this.$route.params.displayName

    let chapters = await fetch(`${URL_BACKEND}/japscan/getChapters/${this.name}`)
    chapters = await chapters.json()

    this.chapters = chapters
  }
}
</script>

<style>
.icon-link {
  color: #ffffff;
  cursor: pointer;
}
.icon-link:hover {
  color: #87CEEB;
}
.added {
  color: #32CD32;
}

#popup-queue {
  position: fixed;
  bottom: 52px;
  left: 2px;
  background-color: rgb(44, 44, 44);
}
.popup-inactive {
  animation: fadeOut ease 1s;
  opacity: 0;
}
.popup-active {
  animation: fadeIn ease 1s;
  opacity: 1;
}

@keyframes fadeIn {
0% {opacity:0;}
100% {opacity:1;}
}

@keyframes fadeOut {
0% {opacity:1;}
100% {opacity:0;}
}

.download-bar {
  position: fixed;
  height: 50px;
  width: 100%;
  background-color: #000000;
  bottom: 0;
}

.download-bar:after {
  content: "";
  display: table;
  clear: both;
}
.dl-bar-left {
  text-align: left;
}
.dl-bar-mid {
  text-align: center;
}
.dl-bar-right {
  text-align: right;
}
.column {
  height: 100%;
  width: 33.3%;
  float: left;
}
.dlbar-center {
  position: relative;
  top: 25%;
}

.loading-icon {
  animation:spin 4s linear infinite;
}

@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

.ft-dl-details {
  width: 100%;
  text-align: center;
}
.dl-details-inactive {
  display: none;
}
.dl-details-active {
  display: block;
}

.progress {
  background: rgb(54, 54, 54);
  justify-content: flex-start;
  border-radius: 100px;
  align-items: center;
  padding: 0 5px;
  display: inline-flex;
  height: 20px;
  width: 500px;
}

.progress-value {
  box-shadow: 0 10px 40px -10px #fff;
  border-radius: 100px;
  background: #fff;
  height: 12px;
  width: 0;
}
</style>
