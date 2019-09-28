<template>
	<div id="section">
		<div id="inputs">
			<div>
				<h1>new password</h1>
				<div>
					<input type="password" v-model="password" placeholder="******">
					<label>rewrite</label>
					<input type="password" v-model="rewrite" placeholder="******">
				</div>
			</div>
		</div>
		<div id="tool">
			<button :disabled="!currectTyping" @click="update">update</button>
		</div>
	</div>
</template>

<script type="text/javascript">
	import toprofile from "../../bus/toprofile";
	export default{
		name:"password",
		data(){
			return {
				password:"",
				rewrite:""
			}
		},
		computed:{
			currectTyping(){
				return this.password.trim().length>6&&this.password==this.rewrite;
			}
		},
		methods:{
			update(){
				toprofile.$emit("changePassword",this.password);
			}
		}
	}
</script>
