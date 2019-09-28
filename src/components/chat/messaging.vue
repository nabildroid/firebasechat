<template>
	<div class="content">
	  <div class="contact-profile">
	    <img :src="friend.picture"/>
	    <p>{{friend.name}}</p>

	    <div class="social-media">
	      <a v-if="getSocialLink('facebook')" :href="'//facebook.com/'+getSocialLink('facebook')">
	      	<i class="fa fa-facebook" aria-hidden="true"></i>
	      </a>
	      <a v-if="getSocialLink('twitter')" :href="'//twitter.com/'+getSocialLink('twitter')">
	      	<i class="fa fa-twitter" aria-hidden="true"></i>
	      </a>
	      <a v-if="getSocialLink('instagram')" :href="'//instagram.com/'+getSocialLink('instagram')">
	      	<i class="fa fa-instagram" aria-hidden="true"></i>
	      </a>
	    </div>

	  </div>
	  <div class="messages" ref="wall">
	    <ul>
	      <li v-scroll v-for="(msg,i) in msgs" :key="i" :class="msg.sender">
	        <img :src="msg.picture"/>
	        <p v-text="msg.content"></p>
	        <img v-if="msg.image" :src="msg.image">
	      </li>

	      
	    </ul>
	  </div>a
	  <div class="message-input">
	    <div class="wrap">
	    <textarea v-model="currentMessage" @keyup.enter.prevent="send" placeholder="Write your message..." />
	    <i class="fa fa-paperclip attachment" aria-hidden="true" @click="sendImage"></i>
			<input type="file" @change="sendImage" accept="image/x-png,image/bmp,image/jpeg" ref="file" hidden>
	    <button class="submit" :disabled="!currentMessage.length" @click="send"><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
	    </div>
	  </div>
	</div>
</template>


<script type="text/javascript">
	import firebase from "firebase";
	import toprofile from "../../bus/toprofile";
	export default{
		name:"messaging",
		props:["friend","picture","isPro"],
		data(){
			return {
				ref:null,
				messages:[],
				stopMessagesListener:null,
				currentMessage:""
			}
		},
		computed:{
			msgs(){
				return this.messages.map(msg=>{
					const temp={};
					temp.content=msg.content;
					temp.image=msg.image;
					temp.sender=msg.receiver!=this.friend.id?"sent":"replies";
					temp.picture=msg.receiver!=this.friend.id?this.friend.picture:this.picture;
					return temp;
				})
			}
		},
		watch:{
			friend(nv){
				if(!nv)this.stopMessagesListener();
			}
		},
		methods:{
			getSocialLink(name){
				if(this.friend.links&&this.friend.links[name])
					return this.friend.links[name].trim();
			},
			send(){
				if(event.ctrlKey)this.currentMessage+="\n";
				else if(this.currentMessage.replace("\n","").trim().length){
					this.ref.add({
						receiver:this.friend.id,
						content:this.currentMessage,
						time:firebase.firestore.Timestamp.now()
					});
					this.friend.doc.ref.update({
						snippet:this.currentMessage.slice(0,25)
					});
					this.currentMessage="";
				}
			},
			sendImage(event){
				if(this.isPro){
					if(!event.target.files)
						this.$refs.file.click();
					else{
						const file=event.target.files[0];
						const fileName=this.friend.id+Math.random().toString().slice(2,10)+new Date().getTime();
						const fileExtention="."+file.type.slice(6);
						const fileRef=firebase.storage().ref().child("messages/"+fileName+fileExtention);

						const uploadTask=fileRef.put(file);
						uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,{
							complete:()=>{
								/**
								 uploadTask contain information about such file that it was uploaded
								 one of those info is `snapshot` which contain must important info like status and 
								 new ref
								 to download it or reteive it URL use such ref that where in snapshot
								*/
								uploadTask.snapshot.ref.getDownloadURL().then(url=>{
									this.ref.add({
										receiver:this.friend.id,
										image:url,
										time:firebase.firestore.Timestamp.now()
									})
								})
							}
						})
					}
				}else toprofile.$emit("openCoupon");
			}
		},
		created(){
			this.ref=this.friend.doc.ref.collection("messages");
			const ref=this.ref.where("time","<",firebase.firestore.Timestamp.now()).orderBy("time","desc").limit(10);
			ref.get().then(snapshot=>{
				snapshot.docs.reverse().forEach(doc=>{
					this.messages.push(doc.data());
				});
			})
		},	
		activated(){
			console.log("messaging activated");
			const ref=this.ref.where("time" ,">=", firebase.firestore.Timestamp.now());
			this.stopMessagesListener=ref.onSnapshot(snapshot=>{
					console.log("observed"+new Date().getTime());
					snapshot.docChanges().forEach(change=>{
						if(change.type=="added")
							this.messages.push(change.doc.data());
					});
				},
				error=>{
					alert("you not longer have permission to contact such user");
				}
			);
		},
		deactivated(){
			console.log("messaging deactivated");
			this.stopMessagesListener();
		},
		destroyed(){
			console.log("chat removed");
			this.stopMessagesListener();
		},
		directives:{
			scroll:{
				inserted(el){
					el.scrollIntoView();
				}
			}
		}
	}
</script>

<style type="text/css" scoped="">
	.content {
	  float: right;
	  width: 60%;
	  height: 100%;
	  overflow: hidden;
	  position: relative;
	}
	@media screen and (max-width: 735px) {
	  .content {
	    width: calc(100% - 58px);
	    min-width: 300px !important;
	  }
	}
	@media screen and (min-width: 900px) {
	  .content {
	    width: calc(100% - 340px);
	  }
	}
	.content .contact-profile {
	  width: 100%;
	  height: 60px;
	  line-height: 60px;
	  background: #f5f5f5;
	}
	.content .contact-profile img:first-child {
	  width: 40px;
	  border-radius: 50%;
	  float: left;
	  margin: 9px 12px 0 9px;
	}
	.content .contact-profile p {
	  float: left;
	}
	.content .contact-profile .social-media {
	  float: right;
	}
	.content .contact-profile .social-media i {
	  margin-left: 14px;
	  cursor: pointer;
	}
	.content .contact-profile .social-media i:nth-last-child(1) {
	  margin-right: 20px;
	}
	.content .contact-profile .social-media i:hover {
	  color: #435f7a;
	}
	.content .messages {
	  height: auto;
	  min-height: calc(100% - 93px);
	  max-height: calc(100% - 93px);
	  overflow-y: scroll;
	  overflow-x: hidden;
	}
	@media screen and (max-width: 735px) {
	  .content .messages {
	    max-height: calc(100% - 105px);
	  }
	}
	.content .messages::-webkit-scrollbar {
	  width: 8px;
	  background: transparent;
	}
	.content .messages::-webkit-scrollbar-thumb {
	  background-color: rgba(0, 0, 0, 0.3);
	}
	.content .messages ul li {
	  display: inline-block;
	  clear: both;
	  float: left;
	  margin: 15px 15px 5px 15px;
	  width: calc(100% - 25px);
	  font-size: 0.9em;
	}
	.content .messages ul li:nth-last-child(1) {
	  margin-bottom: 20px;
	}
	.content .messages ul li.sent img:first-child {
	  margin: 6px 8px 0 0;
	}
	.content .messages ul li.sent p {
	  background: #435f7a;
	  color: #f5f5f5;
	}
	.content .messages ul li.replies img:first-child {
	  float: right;
	  margin: 6px 0 0 8px;
	}
	.content .messages ul li.replies p {
	  background: #f5f5f5;
	  float: right;
	}
	.content .messages ul li img:first-child {
	  width: 22px;
	  border-radius: 50%;
	  float: left;
	}
	.content .messages ul li p {
	  display: inline-block;
	  padding: 10px 15px;
	  border-radius: 20px;
	  max-width: 205px;
	  line-height: 130%;
	  word-break: break-word;
	  white-space: pre-wrap;

	}
	@media screen and (min-width: 735px) {
	  .content .messages ul li p {
	    max-width: 300px;
	  }
	}
	.content .message-input {
	  position: absolute;
	  bottom: 0;
	  width: 100%;
	  z-index: 99;
	}
	.content .message-input .wrap {
	  position: relative;
	  height: 49px;
	  background: #e6eaea;
	}
	.content .message-input .wrap textarea {
	  font-family: "proxima-nova",  "Source Sans Pro", sans-serif;
	  float: left;
	  border: none;
	  width: calc(100% - 90px);
	  padding: 11px 32px 10px 8px;
	  font-size: 0.8em;
	  color: #32465a;
	}
	@media screen and (max-width: 735px) {
	  .content .message-input .wrap textarea {
	    padding: 15px 32px 16px 8px;
	  }
	}
	.content .message-input .wrap textarea:focus {
	  outline: none;
	}
	.content .message-input .wrap .attachment {
	  position: absolute;
	  right: 60px;
	  z-index: 4;
	  margin-top: 10px;
	  font-size: 1.1em;
	  color: #435f7a;
	  opacity: .5;
	  cursor: pointer;
	}
	@media screen and (max-width: 735px) {
	  .content .message-input .wrap .attachment {
	    margin-top: 17px;
	    right: 65px;
	  }
	}
	.content .message-input .wrap .attachment:hover {
	  opacity: 1;
	}
	.content .message-input .wrap button {
	  float: right;
	  border: none;
	  width: 50px;
	  padding: 12px 0;
	  cursor: pointer;
	  background: #32465a;
	  color: #f5f5f5;
	}
	@media screen and (max-width: 735px) {
	  .content .message-input .wrap button {
	    padding: 16px 0;
	  }
	}
	.content .message-input .wrap button:hover {
	  background: #435f7a;
	}
	.content .message-input .wrap button:focus {
	  outline: none;
	}
</style>