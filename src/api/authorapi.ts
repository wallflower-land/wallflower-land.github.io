import { getBook } from "./bookapi.ts";

export type Author = {
	name: string;
	birthday: string;
	key: string;
	books: string[];
	picture: string;
	bio: string;
	id: string;
};

export async function searchAuthors(searchTerm: string, limit = 10): Promise<Promise<Author>[]> {
	const query = new URLSearchParams({ q: searchTerm, limit });
	const response = await fetch(`https://openlibrary.org/search/authors.json?${query}`);
	const data = await response.json();
	return data.docs.map((author: any) => getAuthor(author.key));
}

export async function getAuthor(key: string) {
	const response = await fetch(`https://getauthor-psqyhrtnra-uc.a.run.app?key=${key}`);
	const data = await response.json();
	return data as Author;
}
