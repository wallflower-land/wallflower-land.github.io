import { searchBookISBNs } from "../../../../api/bookapi";
import { json } from "@sveltejs/kit";

export async function GET({ url }: { url: URL }) {
	const term = url.searchParams.get("term")!;
	const limit = Number(url.searchParams.get("limit") ?? 10);
	const books = await searchBookISBNs(term, limit);
	return json({ results: books });
}
