import type { RouteParams } from "$app/types";
import { getAuthor } from "../../../../api/authorapi";
import { json } from "@sveltejs/kit";

export async function GET({ params }: { params: RouteParams<"/api/author/[key]"> }) {
	const { key } = params;
	const author = await getAuthor(key);
	return json(author);
}
