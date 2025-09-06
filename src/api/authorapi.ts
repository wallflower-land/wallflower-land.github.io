import { getBook } from "./bookapi.ts";

export type Author = {
	name: string;
	birthday: string;
	id: string;
	books: string[];
	picture: string;
	bio: string;
};

export async function searchAuthors(searchTerm: string, limit = 10): Promise<Promise<Author>[]> {
	const query = new URLSearchParams({ q: searchTerm, limit });
	const response = await fetch(`https://openlibrary.org/search/authors.json?${query}`);
	const data = await response.json();
	return data.docs.map((author: any) => getAuthor(author.key));
}

export async function getAuthor(key: string) {
	const item = globalThis.localStorage ? globalThis.localStorage.getItem(`author-${key}`) : null;
	if (item) return JSON.parse(item);

	const response = await fetch(`https://openlibrary.org/authors/${key}.json`);
	const authorData = await response.json();

	const worksResponse = await fetch(
		`https://openlibrary.org/authors/${key}/works.json?limit=100`,
	);
	const worksData = await worksResponse.json();

	const books = (
		await Promise.all(
			worksData.entries.map(async (work: any) => {
				const workResponse = await fetch(
					`https://openlibrary.org${work.key}/editions.json`,
				);
				const workData = await workResponse.json();

				const language = workData.entries?.[0]?.languages?.[0].key ?? null;
				if (language !== "/languages/eng") {
					return null;
				}

				const isbn = workData.entries?.[0]?.isbn_13?.[0] ?? null;
				return isbn;
			}),
		)
	).filter(isbn => isbn);

	const author: Author = {
		id: key,
		name: authorData.name,
		birthday: authorData.birth_date,
		bio: authorData.bio?.value ?? "",
		picture:
			authorData.photos && authorData.photos.length
				? `https://covers.openlibrary.org/a/id/${authorData.photos[0]}-L.jpg`
				: "",
		books,
	};

	if (globalThis.localStorage) {
		globalThis.localStorage.setItem(`author-${key}`, JSON.stringify(author));
		console.log(`Updated author "${author.name}" in localStorage`);
	}

	return author;
}
