<template>
  <div id="app" class="container">
    <b-row align-v="center">
      <b-form-input v-model="host" type="url" placeholder="Host" class="col-6" :state="hostState">Host</b-form-input>
      <b-form-checkbox v-model="auth" class="col-2">Authorization</b-form-checkbox>
      <b-button class="col-4" variant="primary" @click="nesConnect">Connect</b-button>
    </b-row>

    <b-row>
      <p>Status: <span :class="isConnected ? 'text-success' : 'text-danger'">{{
              isConnected ?
              'Connected' :
              connectionError ?
                connectionError :
                'Disconnected'}}
            </span>
      </p>
    </b-row>
    <b-row>
<!--      History-->
      <b-col cols="2" ></b-col>
    </b-row>
  </div>
</template>

<script>
    import {Client} from '@hapi/nes/lib/client';

    export default {
        name: 'app',
        components: {},
        data() {
            return {
                host: 'ws://localhost:8081',
                auth: false,
                authSettings: {},
                isConnected: false,
                history: [],
                nes: null,
                connectionError: null
            }
        },
        computed: {
            hostState: function () {
                return this.host.match(/^ws(s)?:\/\/[\w\d.]*(:[\d]{1,5})?(\/.*)*$/) !== null
            }
        },
        methods: {
            nesConnect: async function () {
                this.nes = new Client(this.host);
                let self = this;

                await this.nes.connect().then(() => {
                    self.isConnected = true;
                    self.connectionError = null;
                }).catch(err => {
                    self.connectionError = err.message;
                    self.isConnected = false
                });
                return true
            },
            nesSend() {

            },
            nesSubscribe() {

            },
            nesSubscriptionHandler() {

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
