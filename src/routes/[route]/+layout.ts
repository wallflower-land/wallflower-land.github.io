import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }: { params: { route: string } }) => {
	let username = params.route.match(/^@(\w+)/)?.[1] ?? null;
	if (!username) {
		error(404, "Not found");
	}
	return params;
};

export const prerender = false;
