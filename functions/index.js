

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
// [END import]



exports.applayCoupon = functions.https.onCall(async (req, context) => {
	const code=req.code;

	if(!context.auth||!context.auth.uid)
		return {status:"error","message":"require permission"};
	else if(context.auth.token.pro == true)
		return {status:"success","message":"already pro member"};
	else if(await checkCoupon(code)){

		admin.auth().setCustomUserClaims(context.auth.uid,{pro:true});
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















