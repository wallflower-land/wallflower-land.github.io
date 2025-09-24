import type { RouteParams } from "$app/types";
import { searchBookISBNs } from "../../../../api/bookapi";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler<RouteParams<"/api/search/book">> = async ({ url }) => {
	const term = url.searchParams.get("term")!;
	const limit = Number(url.searchParams.get("limit") ?? 10);
	const books = await searchBookISBNs(term, limit);
	return json({ results: books });
};
