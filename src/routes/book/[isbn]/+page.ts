import { getBook, type ISBN } from "../../../api/bookapi";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
	return { book: await getBook(params.isbn as ISBN, fetch) };
};
