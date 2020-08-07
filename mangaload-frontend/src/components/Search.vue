<template>
  <div style="height: 100%;">
    <div class="cntr">
      <div class="cntr-innr">
        <p>Bienvenue sur MANGALOAD !</p>
        <br>
        <label class="search" id="label_search" for="inpt_search">
          <input id="inpt_search" type="text" v-model="name" v-on:keyup.enter="searchEnter()" />
        </label>
        <p>TROUVER UN MANGA</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Search',
  data () {
    return {
      name: ''
    }
  },
  methods: {
    searchEnter () {
      if (this.name !== '') {
        this.$router.push('/search/' + this.name)
      }
    }
  },
  watch: {
    name: function (val) {
      const label = document.getElementById('label_search')
      if (val === '' && label.classList.contains('active')) {
        label.classList.remove('active')
      } else if (val !== '' && !label.classList.contains('active')) {
        label.classList.add('active')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
p {
  margin-top: 30px;
  color: #ffffff;
}
.cntr {
  display: table;
  width: 100%;
  height: 100%;
}
.cntr .cntr-innr {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
/*** STYLES ***/
.search {
  display: inline-block;
  position: relative;
  height: 35px;
  width: 35px;
  box-sizing: border-box;
  margin: 0px 8px 7px 0px;
  padding: 7px 9px 0px 9px;
  border: 3px solid #ffffff;
  border-radius: 25px;
  -webkit-transition: all 200ms ease;
  transition: all 200ms ease;
  cursor: text;
}
.search:after {
  content: "";
  position: absolute;
  width: 3px;
  height: 20px;
  right: -5px;
  top: 21px;
  background: #ffffff;
  border-radius: 3px;
  -webkit-transform: rotate(-45deg);
          transform: rotate(-45deg);
  -webkit-transition: all 200ms ease;
  transition: all 200ms ease;
}
.search.active,
.search:hover {
  width: 200px;
  margin-right: 0px;
}
.search.active:after,
.search:hover:after {
  height: 0px;
}
.search input {
  width: 100%;
  border: none;
  box-sizing: border-box;
  font-family: Helvetica;
  font-size: 18px;
  color: #ffffff;
  caret-color: transparent;
  background: transparent;
  outline-width: 0px;
  text-align: center;
}
</style>
