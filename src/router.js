import Vue from "vue";
import Router from "vue-router";
import firebase from "firebase";

import Profile from "./views/profile";
import Chat from "./views/profile/chat";
import Friends from "./views/profile/friends";
import Setting from "./views/profile/setting";

import Walcome from "./views/walcome";
import Login from "./views/login";

Vue.use(Router);

const router=new Router({
	mode:"hash",
	base:"./",
	routes:[
		{
			path:"/profile",
			component:Profile,
			children:[
				{
					path:"friends",
					name:"friends",
					component:Friends
				},
				{
					path:"setting",
					name:"setting",
					component:Setting
				},
				{
					path:"/",
					name:"chat",
					component:Chat
				},
				{
					path:"*",
					redirect:"/profile/"
				}
			]
		},
		{
			path:"/login",
			name:"login",
			component:Login
		},
		{
			path:"/",
			name:"walcome",
			component:Walcome
		},
		{
			path:"*",
			redirect:"/"
		}
	]
});


export default router;
