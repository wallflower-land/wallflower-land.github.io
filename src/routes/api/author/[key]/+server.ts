import type { RouteParams } from "$app/types";
import { getAuthor } from "../../../../api/authorapi";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler<RouteParams<"/api/author/[key]">> = async ({ params }) => {
	const { key } = params;
	const author = await getAuthor(key);
	return json(author);
};
