import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }: { params: { username: string } }) => {
	return params;
};

export const prerender = false;
