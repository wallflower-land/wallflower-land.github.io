import { getBook } from "../../../../api/bookapi";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	return { book: await getBook(params.isbn) };
};
