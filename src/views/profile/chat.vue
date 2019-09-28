<template>
  <div id="template">
    <Sidepanel :profile="profile" :friends="friends" :selected="selectedFriend" @select="selectedFriend=$event" />
    <keep-alive v-if="selectedFriend">
	    <Messaging v-if="selectedFriend" :key="selectedFriend" :friend="selectedFriendInfo" :picture="profile.picture" :isPro="profile.pro"/>
	  </keep-alive>
  </div>
</template>

<script>
  import Sidepanel from "../../components/chat/sidepanel";
  import Messaging from "../../components/chat/messaging";
export default {
  name: "chat",
  components:{Sidepanel,Messaging},
  props:["profile","friends"],
  data(){
  	return {
  		selectedFriend:null
  	}
  },
  computed:{
    selectedFriendInfo(){
      return this.friends.find(f=>f.id==this.selectedFriend);
    }
  },
  watch:{
    friends(nv){
      console.log("Friends list has been changed");
      const selectedStillExist=nv.some(f=>f.id==this.selectedFriend);
      console.log(selectedStillExist);
      if(!selectedStillExist)
        this.selectedFriend=null;
    }
  }
}
</script>