<template>
  <div id="app" class="container">
    <b-row align-v="center">
      <b-form-input class="col-6" v-model="host" type="url" placeholder="Host" :state="hostState">Host</b-form-input>
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
      </span></p>
    </b-row>
    <b-row>
      <b-col cols="6">
        <b-input-group>
          <b-input-group-prepend>
            <b-form-select v-model="method" :options="methods"/>
          </b-input-group-prepend>
          <b-form-input placeholder="Url" v-model="url">URL</b-form-input>
        </b-input-group>

      </b-col>
      <b-col cols="3">
        <b-button block variant="primary" @click="nesSend">Send</b-button>
      </b-col>
      <b-col cols="3">
        <b-button block variant="primary" @click="nesSubscribe">Subscribe</b-button>
      </b-col>
    </b-row>

    <b-row class="mt-2">
      <!--Subscriptions-->
      <b-col cols="2">
        <b-list-group>
          <b-list-group-item v-for="subscription in Object.values(subscriptions)" :key="subscription.path"
                             class="d-flex justify-content-between align-items-center">
            {{subscription.path}}
            <b-badge variant="primary" pill>{{subscriptionCountMessages(subscription.path)}}</b-badge>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <!--Input-->
      <b-col cols="3"><VJsoneditor v-model="input"/></b-col>
      <!--Output-->
      <b-col cols="4"><VJsoneditor v-model="output"/></b-col>
      <!--History-->
      <b-col cols="3" class=" mh-100">
        <b-list-group>
          <b-list-group-item
            v-for="(record, i) in history"
            :key="i"
            class="d-flex justify-content-between align-items-center"

            :variant="record.type === 'subscription' ? 'warning' : 'secondary'"
          >
            <span>{{record.path}}</span>
            <span class="text">{{getDateString(record.date)}}</span>
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
    import VJsoneditor from 'v-jsoneditor/src/index'
    import {Client} from '@hapi/nes/lib/client';

    export default {
        name: 'app',
        components: {
            VJsoneditor
        },
        data() {
            return {
                host: 'ws://localhost:8081',
                auth: false,
                authSettings: {},
                isConnected: false,
                history: [],
                subscriptions: {},
                nes: null,
                url: '/items',
                input: null,
                output: null,
                method: 'GET',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                connectionError: null
            }
        },
        computed: {
            hostState: function () {
                return this.host.match(/^ws(s)?:\/\/[\w\d.]*(:[\d]{1,5})?(\/.*)*$/) !== null
            },

        },
        methods: {
            getDateString: function (date) {
                return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
            },
            subscriptionCountMessages: function (path) {
                return this.history.filter(rec => rec.type === 'subscription' && rec.path === path).length
            },
            handleSubscription: function (update, flags, path) {
                this.history.unshift({
                    type: 'subscription',
                    data: update ? update.payload : null,
                    raw: {update, flags},
                    path,
                    date: new Date()
                })
            },
            nesConnect: function () {
                this.nes = new Client(this.host);
                let self = this;

                this.nes.connect().then(() => {
                    self.isConnected = true;
                    self.connectionError = null;
                }).catch(err => {
                    self.connectionError = err.message;
                    self.isConnected = false
                });
                return true
            },
            nesSend: function (){
                let self = this;
                this.nes.request({
                    path: this.url,
                    method: this.method,
                    payload: this.input
                }).then((res) => {
                    // eslint-disable-next-line no-console
                    console.log(res);
                    self.$set(self, 'output', res.payload);
                    self.history.unshift({
                        type: 'request',
                        method: self.method,
                        input: self.input,
                        path: self.url,
                        output: res.payload,
                        status: res.statusCode,
                        date: new Date()
                    })
                })
            },
            nesSubscribe: async function () {
                await this.nes.subscribe(this.url, (update, flags) => {
                    // eslint-disable-next-line no-console
                    console.log(update);
                    this.handleSubscription(update, flags, this.url)
                }).then(() => {
                    // eslint-disable-next-line no-console
                    this.$set(this.subscriptions, this.url, {path: this.url})
                })
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
