import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json";

initializeApp({
	credential: cert(serviceAccount as any),
});
const db = getFirestore();

async function init() {
	const posts = await db.collection("posts").where("type", "==", "rating").get();
	posts.forEach(doc => {
		doc.ref.update({ completionStatus: "finished" });
	});
}

init();
