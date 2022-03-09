<template>
  <div>
    <router-link
      to="/"
      class="icon-link"
      style="margin-left: 1%; text-decoration: none"
      ><i class="fas fa-home"></i> Home</router-link
    >
    <div class="titleSearchResult">
      <h1>Recherche de : {{ searchName }}</h1>
    </div>

    <div class="grid-result">
      <div class="cards">
        <div
          class="card"
          v-for="(result, index) in searchResult"
          v-bind:key="index"
        >
          <img
            :src="result.img"
            referrerpolicy="no-referrer"
            :title="'de ' + result.mangakas"
            v-on:click="goToDownloadPage(result.name, result.displayName)"
            style="cursor: pointer"
          />
          <p style="margin-top: 0px">
            {{ result.displayName }}
            <br />
            <a
              :href="result.url"
              target="_blank"
              style="text-decoration: none"
              title="Voir sur JAPSCAN"
              >JAPSCAN</a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { URL_BACKEND, JAPSCAN_URL } from '../config.js'

export default {
  name: 'SearchResult',
  data () {
    return {
      searchName: '',
      searchResult: []
    }
  },
  methods: {
    goToDownloadPage (name, displayName) {
      this.$router.push('/download/' + name + '/' + displayName)
    }
  },
  created: async function () {
    this.searchName = this.$route.params.name
    let searchResult = await fetch(
      `${URL_BACKEND}/japscan/searchManga/${this.searchName}`
    )
    searchResult = await searchResult.text()
    searchResult = JSON.parse(searchResult)

    searchResult.forEach((e) => {
      const name = e.url.substring('/manga/'.length, e.url.length - 1)
      this.searchResult.push({
        displayName: e.name,
        name: name,
        url: `${JAPSCAN_URL}${e.url}`,
        img: `${JAPSCAN_URL}/imgs/mangas/${name}.jpg`,
        mangakas: e.mangakas
      })
    }) // img => 180x250
  }
}
</script>

<style>
.titleSearchResult {
  text-align: center;
}

.grid-result {
  text-align: center;
  vertical-align: middle;
}

.card {
  color: white;
  padding: 1rem;
  height: 300px;
}

.cards {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-gap: 1rem;
}

@media (min-width: 600px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 900px) {
  .cards {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
