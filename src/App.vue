<template>
  <div id="app">
    <router-view :user="user" /> 
  </div>
</template>

<script>  
import firebase from "firebase";

export default {
  name: "app",
  data(){
    return {
      user:null,
    }
  },
  watch:{'$route'(){this.checkRouter()}},
  methods:{
    checkRouter(){
      if(this.$route.path.indexOf("profile")!=-1&&!this.user)
        this.$router.push("/login");
      else if(this.$route.path.indexOf("login")!=-1&&this.user){
        this.$router.push("/profile");  
      }
    },
    async userClaims(name){
      if(this.user){
        const idToken=await firebase.auth().currentUser.getIdTokenResult();
        console.log(idToken);
        return idToken.claims[name];
      }
    }
  }, 
  created(){
    firebase.auth().onAuthStateChanged(async(user)=>{
      this.user=user;
      this.checkRouter();
    });
  }

};
</script>

<style>
#app {
  width: 95%;
  min-width: 360px;
  max-width: 1000px;
  height: 92vh;
  min-height: 300px;
  max-height: 720px;
  background: linear-gradient(120deg, #ececec, #c8e2cb);
  box-shadow: 1px 1px 7px 2px #33333375;
  border-radius: 2px;
  position: relative;
}
@media screen and (max-width: 360px) {
  #app {
    width: 100%;
    height: 100vh;
  }
}
#template{
  all:unset;
}

</style>
