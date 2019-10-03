<template>
	<div id="section">
		<div id="inputs">
			<div id="picture">
				<img :src="profile.picture" ref="image">
				<input type="file" @change="fileChanged" accept="image/x-png,image/bmp,image/jpeg">
				<span>{{uploadFlag?'Uploading':'change'}}</span>
			</div>
			<div>
				<!--<h1>info</h1>-->
				<div>
					<label>name</label>
					<input type="text" v-model="name">
					<label>Bio</label>
					<input type="text" v-model="bio">
				</div>
				<!--<h1>social links</h1>-->
				<div>
					<label>facebook</label>
					<input type="text" v-model="facebook" placeholder="your facebook link">
					<label>twitter</label>
					<input type="text" v-model="twitter" placeholder="your twitter link">
					<label>instagram</label>
					<input type="text" v-model="instagram" placeholder="your instagram link">
				</div>
			</div>
		</div>
		<div id="tool">
			<button :disabled="!currectTyping" @click="update">update</button>
		</div>
	</div>
</template>

<script type="text/javascript">
	import firebase from "firebase";
	import toprofile from "../../bus/toprofile.js";
	export default{
		name:"info",
		props:["profile"],
		data(){
			return{
				name:this.profile.name,
				bio:this.profile.bio,
				facebook:this.getLink("facebook"),
				twitter:this.getLink("twitter"),
				instagram:this.getLink("instagram"),
				fileSource:null,
				uploadFlag:false
			}
		},
		computed:{
			currectTyping(){
				return this.name.trim();
			}
		},
		watch:{
			bio(nv,old){
				if(!this.profile.pro){
					toprofile.$emit("openCoupon");
					this.bio="";
				}
			}
		},
		methods:{
			getLink(name){
				return this.profile.links?this.profile.links[name]:"";
			},
			update(){
				const change={};
				if(this.name!=this.profile.name)
					change.name=this.name;
				if(this.bio!=this.profile.bio)
					change.bio=this.bio;

				if(this.facebook!=this.getLink("facebook")||
					this.twitter!=this.getLink("twitter")||
					this.instagram!=this.getLink("instagram")){
					change.links={
						facebook : this.facebook,
						twitter : this.twitter,
						instagram : this.instagram
					}
				}
				//update basic info
				if(Object.keys(change).length)
					toprofile.$emit("update",change);

				//upload picture
				if(this.fileSource){
					this.uploadFlag=true;
					let fileName=this.profile.uid;
					fileName+="."+this.fileSource.type.slice(6);

					const fileRef=firebase.storage().ref().child("profile/"+fileName);
					const fileMetaData={customMetadata:{
						name:this.profile.name+" firechat picture",
						uid:this.profile.uid,
						source: window.location.origin
					}};
					const uploadTask=fileRef.put(this.fileSource,fileMetaData);

					uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, {
						complete:snapshot=>{
							this.uploadFlag=false;
							uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
						    toprofile.$emit("update",{picture:downloadURL});
							}).then(()=>this.fileSource=null);
						}
					});

				}
			},
			fileChanged(e){
				this.fileSource=e.target.files[0];
				this.$refs.image.src=URL.createObjectURL(this.fileSource);
			}
		}


	}
</script>
