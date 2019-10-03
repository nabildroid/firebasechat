<template>
	<div id="login">
		<h1>Login</h1>
		<div id="inputs">
			<div>
				<label>email</label>
				<input type="mail" v-model="email" placeholder="your email">
			</div>
			<div>
				<label>password</label>
				<input type="password" v-model="password" placeholder="*****">
			</div>
		</div>
		<div id="tools">
			<button @click.prevent="login" :disabled="!correctTyping">login</button>
			<a @click.prevent="$emit('section','create')">create account</a>
		</div>
	</div>
</template>


<script type="text/javascript">
	import firebase from "firebase";
	export default{
		name:"sign-up",
		data(){
			return {
				email:"contact@laknabil.me",
				password:"11111111"
			}
		},
		computed:{
			correctTyping(){
				return this.email!=""&&this.password!="";
			}
		},
		methods:{
			login(){
				if(this.correctTyping){
					firebase.auth().signInWithEmailAndPassword(this.email.trim(),this.password).catch(err=>{
						alert(err.message);
					})
				}else alert("error");
			}
		}
	}
</script>