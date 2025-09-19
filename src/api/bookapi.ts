import {
	collection,
	getDocs,
	orderBy,
	query,
	where,
	doc,
	getAggregateFromServer,
	average,
	count,
	updateDoc,
} from "firebase/firestore";
import { type Post } from "./postapi";
import firebase from "./firebase";
import type { Nominal } from "./util";

export type ISBN = Nominal<string, "ISBN">;

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
	id: string;
};

let { db } = firebase();

export async function getBookDiscussions(isbn: ISBN): Promise<Post[]> {
	let posts = (
		await getDocs(
			query(
				collection(db, "posts"),
				where("books", "array-contains", isbn),
				orderBy("timestamp", "desc"),
			),
		)
	).docs.map(doc => doc.data()) as Post[];

	return posts;
}

export async function updateBook(book: Book, bookInfo: Partial<Book>) {
	await updateDoc(doc(db, "books", book.id), bookInfo);
}

/**
 * Returns the average rating across all users on the website for
 * a given book.
 */
export async function getBookRating(isbn: ISBN): Promise<{ rating: number; count: number }> {
	const data = (
		await getAggregateFromServer(
			query(
				collection(db, "posts"),
				where("books", "array-contains", isbn),
				where("type", "==", "rating"),
			),
			{
				averageRating: average("rating"),
				ratingCount: count(),
			},
		)
	).data();

	return { rating: data.averageRating ?? 0, count: data.ratingCount };
}

/**
 * Gets the information about a book from its ISBN.
 *
 * Unlike most resources in this API, this makes a call to the server using
 * a Firebase cloud function. This is because if a book isn't in the database,
 * we want to get its info from external sources (e.g. openlibrary) and then
 * add it to the database. However, I can't allow arbitrary users to add
 * books to the database, or else people could in theory just add whatever
 * books they want, even if they don't exist. To avoid this security
 * vulnerability, the `books` collection in the database can only be written
 * to from the server (or if the user is a moderator).
 *
 * @param isbn The ISBN of the book to get the information about
 *
 * @returns The book data
 */
export async function getBook(isbn: ISBN, fetch_: typeof fetch = fetch): Promise<Book> {
	const response = await fetch_(`https://getbook-psqyhrtnra-uc.a.run.app?isbn=${isbn}`);
	const data = await response.json();
	return data as Book;
}

export async function searchBooks(searchTerm: string, max = 10): Promise<Promise<Book>[]> {
	if (/^\d{3}\-?\d{10}$/.test(searchTerm)) getBook(searchTerm as ISBN).then(book => [book]);

	const query = new URLSearchParams({ q: searchTerm });
	let response = await fetch(`https://openlibrary.org/search.json?${query}&fields=isbn,editions`);
	const data = await response.json();
	let books: { isbn: string[] }[] = data.docs.filter((book: Book) => book.isbn).slice(0, max);
	return books.map(book => getBook(book.isbn.find(isbn => /^\d{13}$/.test(isbn))! as ISBN));
}

export async function searchBookISBNs(searchTerm: string, max = 10): Promise<string[]> {
	if (/^\d{3}\-?\d{10}$/.test(searchTerm)) getBook(searchTerm as ISBN).then(book => [book]);
	const query = new URLSearchParams({ q: searchTerm });
	let response = await fetch(`https://openlibrary.org/search.json?${query}&fields=isbn,editions`);
	const data = await response.json();
	let books: { isbn: string[] }[] = data.docs.filter((book: any) => book.isbn).slice(0, max);
	return books.map(book => book.isbn.find(isbn => /^\d{13}$/.test(isbn))!);
}
