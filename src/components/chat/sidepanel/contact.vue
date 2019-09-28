<template>
	<div id="contacts" :class="{expanded:dropdown}">
	  <ul>
	  	<li v-for="friend in sortFriends"  @click="select(friend.id)"
	  		:class="['contact',{active:friend.id==selected}]">

	  	  <div class="wrap">
	  	    <span :class="['contact-status' ,friend.status]"></span>
	  	    <img :src="friend.picture" alt="" />
	  	    <div class="meta">
	  	      <p class="name" v-text="friend.name"></p>
	  	      <p class="preview" v-text="friend.snippet"></p>
	  	    </div>
	  	  </div>
	  	</li>
	  </ul>
	</div>
</template>



<script type="text/javascript">
	export default{
		name:"contact",
		props:["dropdown","friends","selected","search"],
		computed:{
			sortFriends(){
				let friends= this.friends.map(friend=>{
					let sum=this.selected==friend.id?100:0;
					sum+=friend.name.indexOf(this.search)!=-1?4:0;
					sum+=friend.snippet.indexOf(this.search)!=-1?2:0;
					sum+=4-this.$parent.status.indexOf(friend.status);
					sum+=Math.floor(friend.updated/100000000000);
					const temp={};
					Object.assign(temp,friend)
					temp.scoor=sum;
					return temp;
				});
				friends=friends.sort((a,b)=>-a.scoor+b.scoor);

				return friends;
			}
		},
		methods:{
			select(val){
				this.$emit("select",val);
			}
		}
	}
</script>