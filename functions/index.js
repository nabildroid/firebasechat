
// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
// [END import]

// [USER DOCUMENT create after new account has been created]
exports.createUserDoc=functions.auth.user().onCreate(async user=>{
	admin.firestore().collection("users").doc(user.uid).set({
		name:"user"+(Math.random().toString().slice(2,4)),
		picture:"http://eng.uokerbala.edu.iq/stdform/student.png",
		status:"online",
		friendsNumber:6
	});
});


// [COUPON applay and check]
exports.applayCoupon = functions.https.onCall(async (req, context) => {
	const code=req.code;

	if(!context.auth||!context.auth.uid)
		return {status:"error","message":"require permission"};
	else if(context.auth.token.pro == true)
		return {status:"success","message":"already pro member"};
	else if(await checkCoupon(code)){

		await admin.auth().setCustomUserClaims(context.auth.uid,{pro:true});
		await admin.firestore().collection("users").doc(context.auth.uid).update({
			friendsNumber:admin.firestore.FieldValue.increment(14)
		})
		return {status:"success","message":"valid coupon code"};

	}
	else return {status:"error","message":"your code is invalid"};
});

async function  checkCoupon(code){
	if(typeof(code)=="number"&&code>1000&&code<9999){
		const ref=admin.firestore().collection("coupon").where("code" , "==" , code).limit(1);
		let coupon= await ref.get();
		if(coupon.size){
			coupon=coupon.docs[0];
			await coupon.ref.delete();
			return true;
		}
	}
	return false;
}







// [FRIENDSCOUNTER count userFriendNumber]
function addToFriendsNumber(userId,value){
	if(value != 0){
		if(typeof(value) == "number")
			value = admin.firestore.FieldValue.increment(value);

		return admin.firestore().collection("users").doc(userId).update({
			friendsNumber:value
		});
	}
}

exports.friendsCounterOnUpdate=functions.firestore.
	document("conversation/{parts}").
	onUpdate(async (snap,context)=>{
		const data=snap.after.data();
		const previous=snap.before.data();

		let incrementValue=0
		if("snippet" in previous && !("snippet" in data))
			incrementValue++;
		else if("snippet" in data && !("snippet" in previous))
			incrementValue--;

		await addToFriendsNumber(data.parts[0],incrementValue);
		await addToFriendsNumber(data.parts[1],incrementValue);
	})

exports.friendsCounterOnDelete=functions.firestore.
	document("conversation/{parts}").
	onDelete(async (snap,context)=>{
		const previous=snap.data();

		let incrementValue=0
		if("snippet" in previous)
			incrementValue++;

		await addToFriendsNumber(previous.parts[0],incrementValue);
		await addToFriendsNumber(previous.parts[1],incrementValue);

	});

exports.resetFriendsNumber=functions.https.onRequest((req,res)=>{
	const value=req.body.value;
	const promises=req.body.users.map(user=>{
		return addToFriendsNumber(user,value);
	})
	Promise.all(promises).then(()=>{
		console.log(req.body.users);
		res.send("success");
	}).catch(err=>res.send(err));
});



