import {
	collection,
	getDocs,
	orderBy,
	query,
	where,
	getCountFromServer,
	doc,
	setDoc,
} from "firebase/firestore";
import initializeFirebase from "../backend/backend";
import { internalPostToPost, type InternalPost, type Post } from "./postapi";
import { awaitUser } from "./userapi";

export type ISBN = string;

export type Book = {
	backupCover: string;
	isbn: ISBN;
	title: string;
	genres: string[];
	pageCount: number;
	cover: string;
	description: string;
	publishers: string[];
	publishDate: string;
	characters: string[];
	authorKey: string;
};

let { db } = initializeFirebase();

export async function getBookDiscussions(isbn: ISBN): Promise<InternalPost[]> {
	let posts = (
		await getDocs(
			query(
				collection(db, "posts"),
				where("books", "array-contains", isbn),
				orderBy("timestamp", "desc"),
			),
		)
	).docs.map(doc => doc.data()) as InternalPost[];

	return posts;
}

export async function getBookRating(isbn: ISBN): Promise<{ rating: number; count: number }> {
	let posts = (
		await getDocs(
			query(
				collection(db, "posts"),
				where("books", "array-contains", isbn),
				where("type", "==", "rating"),
			),
		)
	).docs.map(doc => doc.data().rating);

	return {
		rating:
			posts.reduce((accumulator, current) => accumulator + current, 0) / (posts.length || 1),
		count: posts.length,
	};
}

export async function getBook(isbn: ISBN): Promise<Book> {
	const response = await fetch(`https://getbook-psqyhrtnra-uc.a.run.app?isbn=${isbn}`);
	const book = await response.json();
	return book;
}

export async function searchBooks(searchTerm: string, max = 10): Promise<Promise<Book>[]> {
	if (/^\d{3}\-?\d{10}$/.test(searchTerm)) getBook(searchTerm).then(book => [book]);

	const query = new URLSearchParams({ q: searchTerm });
	let response = await fetch(`https://openlibrary.org/search.json?${query}&fields=isbn,editions`);
	const data = await response.json();
	let books: { isbn: string[] }[] = data.docs.filter((book: Book) => book.isbn).slice(0, max);
	return books.map(book => getBook(book.isbn.find(isbn => /^\d{13}$/.test(isbn))!));
}

export async function searchBookISBNs(searchTerm: string, max = 10): Promise<string[]> {
	if (/^\d{3}\-?\d{10}$/.test(searchTerm)) getBook(searchTerm).then(book => [book]);
	const query = new URLSearchParams({ q: searchTerm });
	let response = await fetch(`https://openlibrary.org/search.json?${query}&fields=isbn,editions`);
	const data = await response.json();
	let books: { isbn: string[] }[] = data.docs.filter((book: any) => book.isbn).slice(0, max);
	return books.map(book => book.isbn.find(isbn => /^\d{13}$/.test(isbn))!);
}
