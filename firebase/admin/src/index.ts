import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json";

initializeApp({
	credential: cert(serviceAccount as any),
});
const db = getFirestore();

async function init() {
	console.log("Updating posts");
	const posts = await db.collection("posts").get();
	console.log(`Fetched posts: ${posts}`);
	posts.forEach(doc => {
		console.log(`Updating doc ${doc.data().id}`);
		doc.ref.update({ deletionStatus: "none" });
	});
}

init();
