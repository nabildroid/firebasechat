<template>
	<div id="login">
		<h1>create account</h1>
		<div id="inputs">
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
				email:"",
				password:"",
				password1:""
			}
		},
		computed:{
			correctTyping(){
				return this.email&&this.password==this.password1&&this.password!="";
			}
		},
		methods:{
			create(){
				firebase.auth().createUserWithEmailAndPassword(this.email,this.password)
				.then(user=>{
					if(user.additionalUserInfo.isNewUser)
						this.$router.push("profile/setting");
				});
			}
		}
	}
</script>
