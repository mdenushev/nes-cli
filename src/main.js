import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VJsoneditor from 'v-jsoneditor'

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(VJsoneditor);

new Vue({
  render: h => h(App),
}).$mount('#app');
