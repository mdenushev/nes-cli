<template>
  <div id="app" class="container">
    <b-row>
      <b-form-input v-model="host" type="url" placeholder="Host" class="col-6" :state="hostState"></b-form-input>
      <b-form-checkbox v-model="auth" class="col-2">Authorization</b-form-checkbox>
      <b-button class="col-4" variant="primary">Connect</b-button>
    </b-row>

    <b-row>
      <p>Status: <span :class="isConnected ? 'text-success' : 'text-danger'">{{isConnected ? 'Connected' : 'Disconnected'}}</span></p>
    </b-row>
  </div>
</template>

<script>
  import {Client} from '@hapi/nes/lib/client';
export default {
  name: 'app',
  components: {

  },
  data() {
    return{
      host: '',
      auth: false,
      authSettings: {},
      isConnected: false,
      history: [],
      nes: null
    }
  },
  computed: {
    hostState: () => {return this.host.match(/^ws(s)?:\/\/[\w\d.]*(:[\d]{1,5})?(\/.*)*$/)}
  },
  methods: {
    nesConnect: () => {
      this.data.nes = new Client(this.data.host);

    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
