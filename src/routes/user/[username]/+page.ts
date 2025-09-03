import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
	parent,
}: {
	parent: () => Promise<{ username: string }>;
}) => {
	return await parent();
};
