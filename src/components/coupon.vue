<template>
	<div id="coupon">
		<div id="content">
			<span @click="hide">X</span>
			<h2>Enter your coupon</h2>
			<div id="inputs">
				<input type="number" v-model="code">
				<button @click="check">check</button>
			</div>
		</div>
	</div>
</template>

<script>
import firebase from "firebase";
import toprofile from "../bus/toprofile";
export default{
	name:"coupon",
	data(){
		return {
			code:"",
			checkCode:null
		}
	},
	methods:{
		async check(){
			if(this.code&&!isNaN(this.code)&&this.code>=1000&&this.code<=9999){
				this.checkCode({code:Math.floor(this.code)}).then(async res=>{
					if(res.data.status=="success"){
						await firebase.auth().currentUser.getIdToken(true);
						toprofile.$emit("update",{pro:true})
						this.hide();
					}else alert(res.data.message);
				});
			}
			this.code="";
		},
		hide(){
			this.$emit("hide");
		}
	},
	created(){
		this.checkCode=firebase.functions().httpsCallable("applayCoupon");
	}

}
</script>



<style type="text/css">
	div#coupon {
	    position: absolute;
	    width: 100%;
	    height: 100%;
	    background: #59af6378;
	    top: 0;
	    left:0;
	    z-index: 9999;
	}

	div#coupon #content {
	    background: #435f7a;
	    width: 400px;
	    max-width: 92vw;
	    padding: 1em;
	    margin: 0 auto;
	    margin-top: calc( 50vh - 250px);
	    color: #fff;
	    text-align: center;
	    position: relative;
	    border-radius: 1px;
	}

	div#content span {
	    position: absolute;
	    z-index: 1;
	    right: 1em;
	    top: 1em;
	    font-weight: bold;
	    font-size: 13px;
	    cursor: pointer;
	    transition: 0.2s;
	}

	div#content h2 {
	    font-size: 25px;
	    margin: 1em auto;
	    margin-bottom: 2em;
	}

	div#content #inputs input {
	    display: block;
	    width: 80%;
	    margin: auto;
	    margin-bottom: 1em;
	    font-size: 25px;
	    padding: 6px 14px;
	    overflow: hidden;
	    background: #54789a;
	    color: #fafafa;
	    border: none;
	    border-radius: 2px;
	    outline: none;
	    transition: 0.3s;
	}

	div#content #inputs button {
	    margin-bottom: 1em;
	    font-size: 23px;
	    background: #59af62;
	    border: none;
	    color: #fff;
	    padding: 4px 14px;
	    border-radius: 2px;
	    cursor: pointer;
	}

	div#content #inputs input:focus {
	    background: #548c9a;
	}

	div#content span:hover {
	    color: #e28790;
	}
</style>