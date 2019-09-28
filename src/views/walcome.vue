<template>
	<div>
		<h1>Walcome</h1>
		<router-link tag="a" :to="path">{{path}}</router-link>
	</div>
</template>

<script type="text/javascript">
	export  default{
		name:"Walcome",
		computed:{
			path(){
				if(this.$parent.user)
					return "profile";
				else return "login";
			}
		}
	}
</script>
<style type="text/css" scoped="">
	div {
	    height: 100%;
	    background: #2c3e50;
	    color: #f5f5f5;
	    overflow: hidden;
	    position: relative;
	    padding: 20px 70px;
	    text-align: center;
	}
	h1{
		font-size:50px;
		margin-bottom: 2em;
	}
	a {
	    text-decoration: none !important;
	    font-size: 22px;
	    color: #58ac61;
	    border: 1px solid;
	    display: inline-block;
	    padding: 5px 10px;
	    border-radius: 3px;
	    cursor: pointer;
	    margin: 1em;
	    transition: 0.3s;
	}

	a:hover {
	    background: #58ac61;
	    color: #2c3e4f;
	}

</style>