import type { RouteParams } from "$app/types";
import { getBook, type ISBN } from "../../../../api/bookapi";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler<RouteParams<"/api/book/[isbn]">> = async ({ params }) => {
	const { isbn } = params;
	const book = await getBook(isbn as ISBN);
	return json(book);
};
