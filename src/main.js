import Vue from "vue";
import router from "./router.js"
// import store from "./store.js";

import firebase from "firebase";
import {firebaseConfig} from "./firebase.config.js";

import App from "./App.vue";



// Initialize Firebase


firebase.initializeApp(firebaseConfig);

Vue.config.productionTip = false;



new Vue({
  render: h => h(App),
  router,
  // store
}).$mount("#app");	

