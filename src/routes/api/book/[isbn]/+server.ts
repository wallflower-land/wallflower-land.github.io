import type { RouteParams } from "$app/types";
import { getBook, type ISBN } from "../../../../api/bookapi";
import { json } from "@sveltejs/kit";

export async function GET({ params }: { params: RouteParams<"/api/book/[isbn]"> }) {
	const { isbn } = params;
	const book = await getBook(isbn as ISBN);
	return json(book);
}
