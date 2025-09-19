import { doc, updateDoc, getDoc } from "firebase/firestore";
import firebase from "./firebase";
import type { ISBN } from "./bookapi";

export type Author = {
	name: string;
	birthday: string;
	key: string;
	books: ISBN[];
	picture: string;
	bio: string;
	id: string;
};

let { db } = firebase();

export async function searchAuthors(
	searchTerm: string,
	limit = 10,
	fetch_: typeof fetch = fetch,
): Promise<Promise<Author>[]> {
	const query = new URLSearchParams({ q: searchTerm, limit: limit as unknown as string });
	const response = await fetch_(`https://openlibrary.org/search/authors.json?${query}`);
	const data = await response.json();
	return data.docs.map((author: any) => getAuthor(author.key));
}

export async function getAuthor(key: string, fetch_: typeof fetch = fetch): Promise<Author> {
	if (key.startsWith("OL")) {
		const response = await fetch_(`https://getauthor-psqyhrtnra-uc.a.run.app?key=${key}`);
		const data = await response.json();
		return data as Author;
	}

	return (await getDoc(doc(db, "authors", key))).data() as Author;
}

export async function updateAuthor(author: Author, authorInfo: Partial<Author>) {
	await updateDoc(doc(db, "authors", author.id), authorInfo);
}
