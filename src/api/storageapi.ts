import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { collection, doc } from "firebase/firestore";
import firebase from "./firebase";
import type { Nominal } from "./util";

const { db, storage } = firebase();

export type FileId = Nominal<string, "file">;

export async function uploadFile(data: File | Blob): Promise<FileId> {
	let id = doc(collection(db, "__temp__")).id;
	await uploadBytes(ref(storage, id), data);
	return id as FileId;
}

export async function getFile(id: FileId): Promise<string | null> {
	try {
		return await getDownloadURL(ref(storage, id));
	} catch (error) {
		console.error(error);
		return null;
	}
}
