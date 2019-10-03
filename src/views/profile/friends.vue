<template>
	<div id="friends">
		<header>
			<img :src="profile.picture">
			<b>{{profile.name}}</b>
		</header>
		<div id="addfriend">
			<div id="add">
				<span>add friend</span>
				<input type="text" v-model="search" @keydown="searchForUser" placeholder="enter friend name">
				<span @click="search=''">X</span>
			</div>
			<div id="list">
				<ul v-if="!search">
					<li v-for="request in requests">
						<a class="info">
							<img :src="request.picture">
							<b v-text="request.name"></b>
						</a>
						<div class="tool">
							<button class="add" @click="accept(request)">accept</button>
							<button class="remove" @click="remove(request)">remove</button>
						</div>
					</li>
					<li v-for="friend in friends">
						<a class="info">
							<img :src="friend.picture">
							<b v-text="friend.name"></b>
						</a>
						<div class="tool">
							<button class="remove" @click="remove(friend)">remove</button>
							<button class="block" @click="block(friend)">block</button>
						</div>
					</li>
				</ul>	
				<ul v-else>
					<span v-if="!users.length">loading</span>
					<li v-else v-for="user in users" :class="{withBio:user.bio}">
						<a class="info">
							<img :src="user.picture">
							<b v-text="user.name"></b>
							<p v-if="user.bio" v-text="user.bio"></p>
						</a>
						<div class="tool">
							<button class="add" @click="add(user)">add</button>
							<button class="block" @click="block(user)">block</button>
						</div>
					</li>
				</ul>			
				<div id="remain">
					<span v-for="i in (profile.pro?20:6)" :class="{full:i<=friends.length}"></span>
				</div>
			</div>
		</div>
		<div id="bottom-bar">
			<router-link to="profile" tag="button" id="addcontact">
				<i class="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Messages</span>
			</router-link>
			<router-link to="/profile/setting" tag="button" id="settings">
				<i class="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Settings</span>
			</router-link>
		</div>
	</div>
</template>

<script type="text/javascript">
	import firebase from "firebase";
	import toprofile from "../../bus/toprofile";
	export default{
		name:"friends",
		props:["profile","friends","requests"],
		data(){
			return {
				search:"",
				users:[]
			}
		},
		methods:{
			async searchForUser(){
				if(this.search.length>2){
					let refs=firebase.firestore().collection("users");
					refs = refs.where("name",">=",this.search.toLowerCase());
					refs = refs.where("name","<=",this.search.toLowerCase() + '\uf8ff');

					await refs.get().then(snapshot=>{
						this.users=[];
						console.log(snapshot.size+" of users Found");
						snapshot.docs.forEach(doc=>{
							const data=doc.data();
							data.id=doc.id;
							if(data.id!=this.profile.uid&&!this.friends.some(f=>f.id==data.id))
								this.users.push(data);
						})
					});
				}
			},
			add(user){
				if(1||this.friends.length<1 || this.profile.pro){
					this.users.splice(this.users.findIndex(u=>u.id==user.id),1);
					console.log(user);
					this.Conversation(user,"add",{
						partsnapshot:{
							0:{
								name:this.profile.name,
								picture:this.profile.picture,
								status:this.profile.status
							},
							1:{
								name:user.name,
								picture:user.picture,
								status:user.status
							}
						}
					});
				}else toprofile.$emit("openCoupon");
			},
			async accept(user){
				toprofile.$emit("removeFriend",user.id);
				this.Conversation(user,"update",{snippet:""});
			},
			async remove(user){
				toprofile.$emit("removeFriend",user.id);
				this.Conversation(user,"delete");
			},
			async block(user){
				if(this.profile.pro==true){
					if(this.friends.some(u=>u.id==user.id)){
						console.log("update conversation and make blockable");
						toprofile.$emit("removeFriend",user.id);
						this.Conversation(user,"update",{
							partsnapshot:firebase.firestore.FieldValue.delete(),
							snippet:firebase.firestore.FieldValue.delete()
						})
					}else{
						console.log("block user");
					 	this.users.splice(this.users.findIndex(u=>u.id==user.id),1);
						this.Conversation(user,"add");
					}
				}else toprofile.$emit("openCoupon");
			},
			async Conversation(user,method,data={}){
				const docName=this.profile.uid>user.id?user.id+this.profile.uid:this.profile.uid+user.id;
				console.log(data);
				const ref=firebase.firestore().collection("conversation").doc(docName);

				const promises=[];
				if(method == "add"){
					data.parts=[this.profile.uid,user.id]
					promises.push(ref.set(data));
				}
				else if(method == "update")
					promises.push(ref.update(data));
				else if(method == "delete")
					promises.push(ref.delete());

				Promise.all(promises).catch(err=>alert(err.message));

			}

		}
	}
</script>


<style type="text/css" >
	
		div#friends {
		    height: 100%;
		    background: #2c3e50;
		    color: #f5f5f5;
		    overflow: hidden;
		    position: relative;
		    padding: 20px 70px;
		}
		div#friends header {
		    width: 100%;
		    height: 64px;
		    overflow: hidden;
		    line-height: 50px;
		    border-bottom: 1px solid #425b73;
		    margin-bottom: 2em;
		}
		div#friends header img {
		    width: 48px;
		    margin: 1px;
		    border-radius: 50%;
		    vertical-align: middle;
		}
		div#friends header b {
		    margin-left: 15px;
		    font-size: 24px;
		    vertical-align: middle;
		}
		div#addfriend #add {
		    width: 100%;
		    margin-bottom: 1.5em;
		    background: #f5f5f5;
		    height: 40px;
		    overflow: hidden;
		    position: relative;
		    -webkit-box-shadow: 1px 1px 4px 0px #33333394;
		            box-shadow: 1px 1px 4px 0px #33333394;
		    border-radius: 2px;
		    line-height: 40px;
		}
		div#addfriend #add span:first-child {
		    display: inline-block;
		    width: 130px;
		    padding-left: 1em;
		    background: #243140;
		    height: 100%;
		    vertical-align: top;
		    font-weight: bold;
		}
		div#addfriend #add span:last-child {
		    position: absolute;
		    right: 0;
		    z-index: 99;
		    color: #243140;
		    font-weight: bold;
		    width: 2em;
		    text-align: center;
		    cursor: pointer;
		    transition: 0.3s;
		}

		div#addfriend #add span:last-child:hover {
		    color: #9f6e73;
		}
		div#addfriend #add input {
		    width: calc(100% - 130px);
		    padding-left: 1em;
		    padding-right: 2em;
		    line-height: 2;
		    background: transparent;
		    color: #1b2935;
		    font-size: 18px;
		    height: 100%;
		    border: none !important;
		    outline: none !important;
		}
		div#addfriend #list {
		    width: 100%;
		    padding: 0 15px;
		    overflow-y: scroll;
		    overflow-x: hidden;
		    height: calc(100% - 50px - 1.5em);
		    padding-right: 0;
		}
		div#addfriend {
		    height: calc(100% - 64px - 3.4em  );
		    overflow: hidden;
		}
		div#addfriend #list::-webkit-scrollbar {
		  width: 8px;
		  background: #2c3e50;
		}
		div#addfriend #list::-webkit-scrollbar-thumb {
		  background-color: #243140;
		}
		div#addfriend #list ul{
			width: 70%;
			float: left;
		}
		div#addfriend #list li {
		    background: #33475a;
		    margin: 1em 0;
		    height: 70px;
		    padding: 0 1em;
		    width: 100%;
		}
		div#addfriend #list li.withBio {
		    height: auto;
		    padding-bottom: 7px;
		}

		div#addfriend #list li.withBio p {
		    font-size: 14px;
		    line-height: 1.3;
		    color: #c7c7c7;
		    margin-top: 6px;
		}

		div#addfriend #list li.withBio b {
		    margin-top: 0;
		    height: auto;
		    line-height: 29px;
		    font-weight:bold;
		}
		div#addfriend #list li a {
		    width: 70%;
		    height: 100%;
		    display: inline-block;
		    vertical-align: top;
		    text-decoration: none;
		    -webkit-transition: 0.3s;
		    transition: 0.3s;
		    cursor: pointer;
		}
		div#addfriend #list li a  img {
		    width: 66px;
		    margin: -0.6em 0 0;
		    border-radius: 6px;
		    display: inline-block;
		    -webkit-transition: 0.3s;
		    transition: 0.5s cubic-bezier(0.49, -0.03, 0.32, 1.04);
		}
		div#addfriend #list li a b {
		    vertical-align: top;
		    font-size: 21px;
		    display: inline-block;
		    margin-top: 10px;
		    margin-left: 20px;
		    height: 46px;
		    position: relative;
		    line-height: 38px;
		}
		div#addfriend #list li .tool {
		    display: inline-block;
		    width: 30%;
		    overflow: hidden;
		    height: 40px;
		    margin-top: 1.6%;
		}
		div#addfriend #list li .tool button {
		    width: 48%;
		    height: 100%;
		    border: none;
		    font-size: 18px;
		    background: #374b5f;
		    color: #92a2b1;
		    margin-right: 2px;
		    position: relative;
		}
		div#addfriend #list li .tool button.remove {
		    color: #b77777;
		}
		div#addfriend #list li .tool button.add {
		    color: #59af62;
		}
		div#addfriend #list li .tool button.block {
		    color: #ce4444;
		}
		div#addfriend #list li:hover a img {
		    -webkit-box-shadow: 1px 1px 6px 1px #1c2631;
		            box-shadow: 1px 1px 6px 1px #1c2631;
		}
		div#addfriend #list li a b:after {
		    position: absolute;
		    content: "";
		    bottom: 0;
		    width: 0;
		    border-bottom: 3px solid #59af62;
		    left: -3px;
		    border-radius: 10px;
		    -webkit-transition: 0.5s;
		    transition: 0.5s cubic-bezier(0.49, -0.03, 0.32, 1.04);
		}
		div#addfriend #list li:hover a b:after {
		    width: 100%;
		}

	div#addfriend #list li .tool button:before {
	    position: absolute;
	    left: 0;
	    top: 0;
	    transform-origin: 50% 50%;
	    width: 100%;
	    height: 100%;
	    display: block;
	    background: #2431403d;
	    content: "";
	    transform: rotate(-90deg);
	    transition: 0.5s;
	    z-index: 0;
	    border-radius: 100%;
	    opacity: 0;
	}

	div#addfriend #list li .tool button:hover:before {
	    transform: rotate(00deg);
	    border-radius: 0;
	    opacity: 1;
	}

	div#addfriend #list #remain {
	    float: right;
	    width: 15%;
	    height: auto;
	    overflow: hidden;
	    margin-top: 1em;
	    margin-left: 0;
	}

	div#addfriend #list #remain span {
	    display: inline-block;
	    height: 18px;
	    width: 18px;
	    margin: 2.5px;
	    border-radius: 50%;
	    border: 2px solid #577088;
	}

	div#addfriend #list #remain span.full {
	    background: #212e3a;
	}

	#bottom-bar {
	  position: relative;
	  width: 209px;
	  bottom: 0;
	  overflow: hidden;
	}

	 #bottom-bar button {
	  float: left;
	  border: none;
	  width: 50%;
	  padding: 10px 0;
	  background: #32465a;
	  color: #f5f5f5;
	  cursor: pointer;
	  font-size: 0.85em;
	  font-family: "proxima-nova",  "Source Sans Pro", sans-serif;
	}
	 #bottom-bar button:focus {
	  outline: none;
	}
	 #bottom-bar button:nth-child(1) {
	  border-right: 1px solid #2c3e50;
	}

	 #bottom-bar button:hover {
	  background: #435f7a;
	}
	 #bottom-bar button i {
	  margin-right: 3px;
	  font-size: 1em;
	}
	@media screen and (max-width: 735px) {



		div#friends {
		    padding: 10px 10px;
		}

		div#friends header {
		    margin-bottom: 1em;
		}
		div#addfriend{
			height: calc(100% - 64px - 45px );
		}
		div#addfriend #add {
		    height: auto;
		    box-shadow: none;
		    background: none;
		}

		div#addfriend #add span:first-child {
		    display: block;
		    width: 100%;
		    text-align: center;
		    padding: 0;
		    background: none;
		    font-size: 21px;
		}

		div#addfriend #add input {
		    width: 100%;
		    background: #fff;
		    height: 33px;
		    border-radius: 4px;
		}

		div#addfriend #list ul {
		    width: 85%;
		}

		div#addfriend #list #remain {
		    width: 12%;
		}

		div#addfriend #list #remain span {
		    width: 15px;
		    margin: 6px 2px;
		    height: 15px;
		}

		div#addfriend #list li {
		    width: 100%;
		    height: auto;
		    margin-bottom: 2em;
		}

		div#addfriend #list li a {
		    display: block;
		    width: 100%;
		    text-align: center;
		}

		div#addfriend #list li a img {
		    display: inline-block;
		    width: 100px;
		    margin-top: -13px;
		}

		div#addfriend #list li a b {
		    display: block;
		    width: 100%;
		    vertical-align: unset;
		    margin: 0;
		}

		div#addfriend #list li .tool {
		    display: block;
		    width: 100%;
		    padding-bottom: 5px;
		}

		#bottom-bar {
		 width:100%
		}
		#bottom-bar button i {
		  font-size: 1.3em;
		}
	}
</style>