import { error } from "@sveltejs/kit";
import { getBook, isISBN } from "../../../../api/bookapi";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
	if (isISBN(params.isbn)) {
		return { book: await getBook(params.isbn, fetch) };
	}

	error(404, "Malformatted ISBN");
};
