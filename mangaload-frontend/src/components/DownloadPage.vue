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
  <div class="download-bar">
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
        <span v-else-if="statut === 1">
          En cours...
        </span>
        <span v-else-if="statut === 2">
          Fini !
        </span>
      </span>
    </div>
    <div class="dl-bar-right column">
      <span class="dlbar-center">
        <a v-on:click="startDownload()"><i class="fas fa-play icon-link"></i></a>&nbsp;
      </span>
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
      statut: 0
    }
  },
  methods: {
    addQueue (ch) {
      this.queue.push(ch)
    },
    removeQueue (ch) {
      const index = this.queue.indexOf(ch)
      this.queue.splice(index, 1)
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
    startDownload () {
      console.log('need to download : ' + this.queue)
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
  color: inherit;
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
</style>
