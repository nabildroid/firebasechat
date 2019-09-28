<template>
	<div id="template">
		<keep-alive include="chat,coupon">
			<router-view v-if="profile" v-bind="sectionProps"/>
		</keep-alive>
		<coupon v-if="showCoupon==true" @hide="showCoupon=false"/>
	</div>
</template>


<script type="text/javascript">
	import toprofile from "../bus/toprofile.js";
	import firebase from "firebase";

	import coupon from "../components/coupon";

	export default{
		name:"profile",
		components:{coupon},
		props:["user"],
		data(){
			return {
				userRef:null,
				profile:null,
				requests:[], // friend requests
				friends:[],
				stopFirendsListener:null,
				showCoupon:false
			}
		},
		computed:{
			sectionProps(){
				let p={profile:this.profile};
				if(this.$route.name != "setting")
					p.friends=this.friends;
				if(this.$route.name == "friends")
					p.requests=this.requests;

				return p;
			}
		},
		watch:{
			async user(nv,old){
				if(!this.userRef)
					await this.initialize(nv);
			}
		},
		methods:{
			async initialize(user){
				console.log("initialize profile");
				this.userRef=await firebase.firestore().collection("users").doc(user.uid);
				this.profile=await this.userRef.get();
				this.profile=this.profile.data();
				this.profile.uid=user.uid;

				//check is this user pro member
				this.$set(this.profile,"pro",await this.$parent.userClaims("pro"));
				
				if(!this.friends.length)
					await this.initializeFriends();
			},

			async initializeFriends(){
				console.log("fetching Friends...");

				let  ref=firebase.firestore().collection("conversation");
				ref = ref.where("parts","array-contains",this.profile.uid).where("partsnapshot.0.name",">=","");
				this.stopFirendsListener = await ref.onSnapshot( snapshot=>{
					console.log(snapshot.size);
					snapshot.docChanges().forEach(change=>{
							console.log(change);
							const data=change.doc.data();
							const whichPart=data.parts.indexOf(this.profile.uid);

							const friend=data.partsnapshot[(whichPart+1)%2];
							friend.id=data.parts[(whichPart+1)%2];
							friend.doc=change.doc;

							//friend Request
							if(data.snippet==undefined){
								//recieved friend request
								if(data.parts[1]==this.profile.uid){
									if(change.type=="added")
										this.requests.push(friend);
									else if(change.type=="removed");
										this.$delete(this.requests,this.requests.findIndex(r=>r.id==data.id));
								}
								return;
							}
							if(!snapshot.metadata.hasPendingWrites)
								friend.snippet=data.snippet;
							else friend.snippet="";

							//add some payload to sort friend based on last message
							friend.updated=new Date().getTime();
							friend.updated*=friend.snippet?2:1;

							if(change.type == "added")
								this.friends.push(friend);
							else if(change.type == "modified") {
								const modifiedFriend=this.friends.findIndex(f=>f.id==friend.id);
								if(modifiedFriend!=-1)
									this.$set(this.friends,modifiedFriend,friend);
								else this.friends.push(friend);
							}else if(change.type == "removed"){
								const modifiedFriend=this.friends.findIndex(f=>f.id==friend.id);
								if(modifiedFriend!=-1)
									this.$delete(this.friends,modifiedFriend);
							}
					});
				});
				//update my profile status to online whenever it's offline
				if(this.profile.status=="offline")
					this.update({status:"online"});
			},

			async update(value){
				//update local variable
				Object.entries(value).forEach(v=>{
					this.$set(this.profile,...v);
				});

				//only local updates
				if("pro" in value)
					return;

				//global update
				//update user info
				await this.userRef.update(value);


				//update conversations
				await this.friends.forEach(async friend=>{
					console.log("tell my friend that i changed my info");

					const newInfo={};
					const partIndex=friend.doc.data().parts.indexOf(this.profile.uid);

					if(value.name)
						newInfo[`partsnapshot.${partIndex}.name`]=value.name;
					if(value.picture)
						newInfo[`partsnapshot.${partIndex}.picture`]=value.picture;
					if(value.status)	
						newInfo[`partsnapshot.${partIndex}.status`]=value.status;

					if(Object.keys(newInfo).length){
						await friend.doc.ref.update(newInfo);
					}	
				})
				if(value.status=="offline")
					this.signOut();
			},
			removeFriend(friendId){
				console.log("removed by it id"+friendId);
				//remove it either from friends or requests
				const index=this.friends.findIndex(f=>f.id==friendId);
				console.log(index);
				if(index!=-1)
					this.$delete(this.friends,index);
				else this.$delete(this.requests,this.requests.findIndex(r=>r.id==friendId));
			},
			openCoupon(){
				this.showCoupon=true;
			},
			changePassword(pass){
				this.user.updatePassword(pass);
			},
			signOut(){
				this.stopFirendsListener();
				firebase.auth().signOut();
			}
		},
		created(){
			toprofile.$off();

			toprofile.$on("update",this.update);
			toprofile.$on("changePassword",this.changePassword);
			toprofile.$on("openCoupon",this.openCoupon);
			toprofile.$on("removeFriend",this.removeFriend);

			if(this.user&&!this.profile)
				this.initialize(this.user);
		},
		destroyed(){
			toprofile.$off();
			if(this.stopFirendsListener)
				this.stopFirendsListener();
		}

	}
</script>