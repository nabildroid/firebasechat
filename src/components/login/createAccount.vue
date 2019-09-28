<template>
	<div id="login">
		<h1>create account</h1>
		<div id="inputs">
			<div>
				<label>user name</label>
				<input type="text" v-model="userName" placeholder="user name">
			</div>
			<div>
				<label>email</label>
				<input type="email" v-model="email" placeholder="email">
			</div>
			<div>
				<label>password</label>
				<input type="password" v-model="password" placeholder="*****">
			</div>
			<div>
				<label>repeat password</label>
				<input type="password" v-model="password1" placeholder="*****">
			</div>
		</div>
		<div id="tools">
			<button @click="create" :disabled="!correctTyping">create</button>
			<a @click.prevent="$emit('section','enter')">login</a>
		</div>
	</div>
</template>


<script type="text/javascript">
	import firebase from "firebase";
	import toprofile from "../../bus/toprofile.js";
	export default{
		name:"sign-up",
		data(){
			return{
				userName:"",
				email:"",
				password:"11111111",
				password1:"11111111"
			}
		},
		computed:{
			correctTyping(){
				return this.userName&&this.email&&this.password==this.password1&&this.password!="";
			}
		},
		methods:{
			create(){
				firebase.auth().createUserWithEmailAndPassword(this.email,this.password).then(user=>{
					if(user.additionalUserInfo.isNewUser){
						const data={
							name:this.userName,
							picture:"http://eng.uokerbala.edu.iq/stdform/student.png",
							status:"online",
						};
						firebase.firestore().collection("users").doc(user.user.uid).set(data).catch(err=>{
							firebase.auth().currentUser.delete().then(()=>{
								alert("Dont't play with my firebase");
							});
						});
					}
				});
			}
		}
	}
</script>