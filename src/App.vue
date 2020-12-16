<template>
    <div id="app" class="container">
        <b-row align-v="center">
            <b-form-input class="col-6" v-model="host" type="url" placeholder="Host" :state="hostState">Host
            </b-form-input>
            <b-form-checkbox v-model="auth" class="col-2" :disabled="isConnected">Authorization</b-form-checkbox>
            <b-button class="col-4" variant="primary" @click="connectButtonOnClick">{{!isConnected ? 'Connect' : 'Disconnect'}}</b-button>
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
        <b-row v-if="auth && !isConnected">
            <span>Authorization information</span>
            <VJsoneditor v-model="authSettings" height="250px" :options="{mode: 'code'}"/>
        </b-row>
        <b-row v-if="isConnected">
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

        <b-row class="mt-2" v-if="isConnected">
            <!--Input-->
            <b-col cols="4">
                <span>Payload</span>
                <VJsoneditor v-model="input" height="500px" :options="{mode: 'code'}"/>
            </b-col>
            <!--Output-->
            <b-col cols="5">
                <span>Result</span>
                <VJsoneditor v-model="output" height="500px" :options="{mode: 'code', onEditable: () => false}"/>
            </b-col>
            <!--History-->
            <b-col cols="3">
                <span>History</span>

                <b-list-group class="history">
                    <b-list-group-item v-if="history.length === 0">No records.</b-list-group-item>
                    <b-list-group-item
                            v-for="(record, i) in history"
                            @click="changeCurrentRecord(i)"
                            :key="i"
                            class="d-flex justify-content-between align-items-center"
                            :variant="
             i === currentRecord
              ? 'success'
              : record.type === 'subscription'
                ? 'warning'
                : 'secondary'
            "
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
        host: 'wss://example.com/api',
        auth: false,
        authSettings: {
          "headers": {
            "Authorization": "jwt"
          }
        },
        isConnected: false,
        history: [],
        subscriptions: {},
        nes: null,
        url: '/items',
        input: null,
        output: null,
        method: 'GET',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        connectionError: null,
        currentRecord: 0
      }
    },
    watch: {
      currentRecord: function (val) {
        if (this.history[val].type === 'request') {
          this.$set(this, 'input', this.history[val].input);
          this.$set(this, 'output', this.history[val].output);
        } else if (this.history[val].type === 'subscription') {
          this.$set(this, 'input', {});
          this.$set(this, 'output', this.history[val].data);
        }

      }
    },
    computed: {
      hostState: function () {
        return this.host.match(/^ws(s)?:\/\/[\w\d.-]*(:[\d]{1,5})?(\/.*)*$/) !== null
      }
    },
    methods: {
      connectButtonOnClick: function() {
        if(! this.isConnected){
          this.nesConnect();
        } else {
          this.nesDisconnect();
        }
      },
      getDateString: function (date) {
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
      },
      subscriptionCountMessages: function (path) {
        return this.history.filter(rec => rec.type === 'subscription' && rec.path === path).length
      },
      changeCurrentRecord: function (i) {
        this.$set(this, 'currentRecord', i);
      },
      handleSubscription: function (update, flags, path) {
        // eslint-disable-next-line no-console
        console.log(path);
        this.$set(this,'currentRecord', this.currentRecord + 1);
        this.history.unshift({
          type: 'subscription',
          data: update ? update : {},
          raw: {update, flags},
          path,
          date: new Date()
        })
      },
      nesConnect: function () {
        this.nes = new Client(this.host);
        let self = this;

        this.nes.connect({auth: this.authSettings}).then(() => {
          self.$set(self, 'isConnected', true);
          self.$set(self, 'connectionError', null);
          self.showToast('light', 'Connected successfully', '')
        }).catch(err => {
          self.$set(self, 'connectionError', err.message);
          self.$set(self, 'isConnected', false);
          self.showToast('danger', err, 'Connection error')
        });
        return true
      },
      nesDisconnect: function() {
        let self = this;
        // eslint-disable-next-line no-console
        console.log('disconnect');
        this.nes.disconnect().then(() => {
          self.$set(self, 'isConnected', false);
          self.$set(self, 'connectionError', null);
          self.showToast('light', 'Disconnected successfully', '')
        }).catch(e => {
          self.showToast('danger', e, 'Disconnection error')
        })
      },
      nesSend: function () {
        let self = this;
        this.$set(this, 'output', null);
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
            input: self.input !== null ? self.input : {},
            path: self.url,
            output: res.payload !== null ? res.payload : {},
            status: res.statusCode,
            date: new Date()
          });
          self.$set(self, 'currentRecord', 0);
        }).catch(err => {
          // eslint-disable-next-line no-console
          this.showToast('danger', err.message, 'Error')
        })
      },
      nesSubscribe: function () {
        let path = this.url;
        this.nes.subscribe(this.url, (update, flags) => {
          this.handleSubscription(update, flags, path)
        })
          .then(() => {
            // eslint-disable-next-line no-console
            this.$set(this.subscriptions, this.url, {path: this.url});
            this.showToast('success', `Subscribed on path ${this.url}`, 'Subscribed successfully')
          }).catch(err => {
          this.showToast('danger', 'Error: ' + err.message, 'Subscription failed');
        })
      },
      showToast: function (variant, msg, title) {
        this.$bvToast.toast(msg, {
          title: title,
          variant: variant,
          solid: true,
          appendToast: true,
          toaster: 'b-toaster-bottom-right'
        })
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
    .history {
      max-height: 500px;
      overflow-y: scroll;
    }
</style>
