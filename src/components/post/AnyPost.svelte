<script lang="ts">
	import { goto } from "$app/navigation";
	import { getBook } from "../../api/bookapi";
	import {
		deletePost,
		didComment,
		didLike,
		getLikes,
		getPostFromId,
		getPostViews,
		getReplies,
		likePost,
		sharePost,
		unlikePost,
		type Post,
	} from "../../api/postapi";
	import { getFile } from "../../api/storageapi";
	import { getUserFromId, updateUser, user } from "../../api/userapi.svelte";
	import CommentIcon from "../icons/CommentIcon.svelte";
	import DotMenuIcon from "../icons/DotMenuIcon.svelte";
	import EyeIcon from "../icons/EyeIcon.svelte";
	import HeartIcon from "../icons/HeartIcon.svelte";
	import Badges from "../Badges.svelte";
	import ContextMenu from "../util/ContextMenu.svelte";
	import ImageCarousel from "../util/ImageCarousel.svelte";
	import Link from "../util/Link.svelte";
	import Notification from "../util/Notification.svelte";
	import BookUpdate from "./BookUpdate.svelte";
	import Discussion from "./Discussion.svelte";
	import Rating from "./Rating.svelte";
	import Reply from "./Reply.svelte";

	let {
		post,
		postpage,
		noborder = false,
		element = $bindable()
	}: { 
		post: Post;
		postpage?: boolean;
		noborder?: boolean;
		element?: HTMLElement
	} = $props();

	/**
	 * The context menu that appears when clicking the post actions button, which
	 * allows things like deleting the post (if you're the poster), reporting the
	 * post, etc.
	 */
	let actionsMenu: ContextMenu;

	/**
	 * The amount of seconds that have elapsed since the post was posted.
	 */
	let elapsedSeconds = (Date.now() - post.timestamp) / 1000;

	/**
	 * The timestamp on the post as a string. This will either be a relative
	 * timestamp (such as `3h ago`) or an absolute timestamp (such as
	 * `1/30/2025 @ 10:25AM`); The specific format is determined by `timeFormat`
	 * and toggled with `toggleTimeFormat()` below.
	 */
	let elapsedTime = $state("");

	/**
	 * The format of the posting time shown on the post, either:
	 *
	 * - `"relative"`: Such as "3h ago"
	 * - `"absolute"`: Such as `1/30/2025 @ 10:22AM`
	 *
	 * The time format is switched in `toggleTimeFormat()` when the post's timestamp is
	 * clicked. The default is `"relative"`, but the timestamp UI element starts empty, (see
	 * `elapsedTime` above), so we set this to `"absolute"` and call `toggleTimeFormat()` once
	 * to get the initial relative text.
	 */
	let timeFormat: "relative" | "absolute" = $state("absolute");

	/**
	 * Switches the timestamp on the post between relative time (like "3h ago") and
	 * absolute time (like "1/29/2025 @ 5:00PM"). The result is stored in `elapsedTime`
	 * and the UI is automatically refreshed to show the new time display.
	 */
	function toggleTimeFormat() {
		// Switch from relative to absolute
		if (timeFormat == "relative") {
			let date = new Date(post.timestamp);
			elapsedTime = `&lrm;${date.toLocaleDateString()} &lrm;@ ${date.toLocaleTimeString().replace(/(.*)\D\d+/, "$1")}`;
			timeFormat = "absolute";
		}

		// Switch from absolute to relative
		else {
			if (elapsedSeconds < 60) {
				elapsedTime = `${Math.floor(elapsedSeconds)}s ago`;
			} else if (elapsedSeconds < 60 * 60) {
				elapsedTime = `${Math.floor(elapsedSeconds / 60)}m ago`;
			} else if (elapsedSeconds < 60 * 60 * 24) {
				elapsedTime = `${Math.floor(elapsedSeconds / 60 / 60)}h ago`;
			} else if (elapsedSeconds < 60 * 60 * 24 * 7) {
				elapsedTime = `${Math.floor(elapsedSeconds / 60 / 60 / 24)}d ago`;
			} else if (elapsedSeconds < 60 * 60 * 24 * 30) {
				elapsedTime = `${Math.floor(elapsedSeconds / 60 / 60 / 24 / 7)}w ago`;
			} else if (elapsedSeconds < 60 * 60 * 24 * 365) {
				elapsedTime = `${Math.floor(elapsedSeconds / 60 / 60 / 24 / 30)}mo ago`;
			} else {
				elapsedTime = `${Math.floor(elapsedSeconds / 60 / 60 / 24 / 365)}y ago`;
			}
			timeFormat = "relative";
		}
	}

	// Set the initial time to relative
	toggleTimeFormat();

	/** Whether this post was posted by the current user. */
	let isCurrentUser = $derived(user()?.id === post.poster);

	/**
	 * The "parent" of this post. If this post is a reply, this is the post being replied to.
	 * If this post isn't a reply, it's `null`.
	 */
	let parent = post.type === "reply" ? getPostFromId(post.parent) : Promise.resolve(null);

	/**
	 * Called when the post is clicked. If an interactible part of the post is clicked,
	 * such as a link or button, this will do nothing and let the link/button handle the
	 * interaction. If a non-interactible part of the post was clicked, such as plain text
	 * or empty space, this will open the post's page.
	 *
	 * @param event The click event fired from clicking the post.
	 *
	 * @returns A promise that resolves when the post page opens, if going to the post page.
	 */
	async function clickPost(event: MouseEvent) {
		if ((event.target as HTMLElement).closest("button") || (event.target as HTMLElement).closest("a")) {
			return;
		}

		await goToPost();
	}

	/**
	 * Called when the post is clicked on. This will open the post, or if it's a reply,
	 * open the parent post.
	 */
	async function goToPost() {
		await goto(`/post/${post.id}`);
	}

	/** The number of views on the post */
	let views = getPostViews(post);
	/** The number of likes on the post */
	let likes = $state(getLikes(post).then(likes => likes.length));
	/** The number of replies on the post */
	let comments = $state(getReplies(post).then(replies => replies.length));

	/** Whether the current user liked the post. */
	let liked = $state(didLike(post));
	/** Whether the current user replied to the post. */
	let commented = $state(didComment(post));
	let saved = $derived(user() ? user()!.saved.includes(post.id) : false);

	/**
	 * Toggles whether the user has liked this post. This is called when the user
	 * presses the like button on a post. The UI will be updated to reflect whether
	 * they have liked the post, and the database will be updated to reflect that.
	 *
	 * @returns A promise that resolves when the database is finished updating.
	 */
	async function toggleLike() {
		if (!user()) return;

		liked = !liked;

		// Liking the post
		if (liked) {
			likes = likes.then(likes => likes + 1);
			await likePost(post);
		}

		// Unliking the post
		else {
			likes = likes.then(likes => likes - 1);
			await unlikePost(post);
		}
	}

	/**
	 * Whether or not this post has been deleted. This is used to hide the post
	 * in the UI when it's deleted, since deleting it in the database won't immediately
	 * update the UI.
	 */
	let isDeleted = $state(false);

	/**
	 * Deletes this post. This deletes it internally in the database and
	 * updates the UI to hide the post.
	 */
	async function deleteAndUpdate() {
		isDeleted = true;
		await deletePost(post);
	}

	let shareNotification: Notification = $state(null!);
	let saveNotification: Notification = $state(null!);
	let unsaveNotification: Notification = $state(null!);

	/**
	 * Called when the share button on a post is clicked.
	 *
	 * This does four things:
	 * - Copies the post link to the user's clipboard
	 * - Shows the share notification
	 * - Stores in the database that this user shared this post
	 * - Updates the UI to reflect the shared post
	 *
	 * @returns A promise that resolves when the database has been updated to
	 * reflect the shared post. The This needn't be awaited to update the UI.
	 */
	async function share() {
		actionsMenu.close();
		if (navigator.share) {
			navigator.share({
				url: `https://wallflower.land/post/${post.id}`
			});
		} else {
			navigator.clipboard.writeText(`https://wallflower.land/post/${post.id}`);
			shareNotification.show();
		}

		if (!user()) {
			let shared = localStorage.getItem("shared-posts");
			if (!shared) shared = "[]";
			let sharedPosts: string[] = JSON.parse(shared);
			sharedPosts = Array.from(new Set([...sharedPosts, post.id]));
			localStorage.setItem("shared-posts", JSON.stringify(sharedPosts));
		}

		await sharePost(post);
	}

	async function save() {
		actionsMenu.close();
		saveNotification.show();
		await updateUser({ saved: [...user()!.saved, post.id] });
	}

	async function unsave() {
		actionsMenu.close();
		unsaveNotification.show();
		await updateUser({ saved: user()!.saved.filter(id => id !== post.id) });
	}

	const poster = getUserFromId(post.poster);
	const books = post.books.map(isbn => getBook(isbn));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<section
	style:background={postpage ? "var(--crust)" : "var(--base)"}
	style:display={isDeleted ? "none" : "flex"}
	tabindex="0"
	role="link"
	onclick={clickPost}
	style:border-bottom={(postpage || noborder) ? "none" : `1px solid var(--surface-0)`}
	bind:this={element}
>
	<!-- Poster's profile picture -->
	<div class="profile">
		{#await poster}
			<div class="no-picture"></div>
		{:then poster}
			{#await getFile(poster.picture)}
				<div class="no-picture"></div>
			{:then pfp}
				<a
					style:outline="0.75rem solid {postpage ? "var(--crust)" : "var(--base)"}"
					aria-label="Go to poster's profile"
					style:background-image={`url("${pfp}")`}
					href={`/profile/${poster.username}`}>
				</a>
			{/await}
		{/await}
	</div>

	<div class="content-outer">
		<!-- User info: Display Name & Username -->
		{#await poster}
			<span class="user">
				<span class="missing-username"></span>
				<button class="timestamp" onclick={toggleTimeFormat}>
					{@html elapsedTime}
				</button>
			</span>
		{:then poster}
			<span class="user">
				<div class="name">
					<a href="/@{poster.username}" class="display-name {timeFormat === "absolute" ? "absolute-timestamp" : ""}">{poster.displayName}</a>
					<a href="/@{poster.username}" class="username">{`@${poster.username}`}</a>
				</div>

				<Badges forUser={poster} size={0.7} />

				{#if poster.pronouns && poster.showPronounsOnProfile}
					<div class="pronouns">
						<div class="dot"></div>
						<h2 class="pronouns">{poster.pronouns}</h2>
					</div>
				{/if}

				<button class="timestamp" onclick={toggleTimeFormat}>
					{@html elapsedTime}
				</button>
			</span>
		{/await}

		<!-- Reply: Show "replying to @user" text -->
		{#if post.type === "reply"}
			<span class="replying-to">
				Replying to
				{#await parent then parent}
					{#await getUserFromId(parent!.poster)}
						<div class="loading-replying"></div>
					{:then parentPoster}
						<Link href="/profile/{parentPoster.username}">@{parentPoster.username}</Link>
					{/await}
				{/await}
			</span>
		{/if}

		<!-- The post content itself -->
		{#if post.type === "rating"}
			{#await books[0] then book}
				{#await poster then poster}
					<Rating isbn={book.isbn} rating={post.rating} review={post.body} user={poster} />
				{/await}
			{/await}
		{:else if post.type === "general"}
			<Discussion isbns={post.books} body={post.body} images={post.pictures} />
		{:else if post.type === "reply"}
			<Reply body={post.body} />
		{:else if post.type === "update"}
			{#await books[0] then book}
				{#await poster then poster}
					<BookUpdate updateType={post.updateType} body={post.body} isbn={book.isbn} user={poster} />
				{/await}
			{/await}
		{/if}

		{#if post.pictures.length > 0}
			<ImageCarousel clickable={postpage} images={post.pictures} />
		{/if}

		<!-- Post stats (views, likes, replies, etc.) -->
		<div class="stats">
			<!-- Views Button -->
			<span style:color="var(--teal)">
				<EyeIcon stroke="var(--teal)" style="width: 1rem;" />
				{#await views}
					0
				{:then views}
					{views}
				{/await}
			</span>

			<!-- Like Button -->
			<button onclick={toggleLike} style:color={liked ? "var(--pink)" : "var(--surface-2)"}>
				<HeartIcon fill={liked ? "var(--pink)" : "none"} stroke={liked ? "var(--pink)" : "var(--surface-2)"} style="width: 1rem;" />
				{#await likes}
					0
				{:then likes}
					{likes}
				{/await}
			</button>

			<!-- Reply Button -->
			{#await commented}
				<button onclick={goToPost} style:color="var(--overlay-1)">
					<CommentIcon stroke="var(--overlay-1)" style="width: 1rem;" />
					0
				</button>
			{:then commented}
				<button onclick={goToPost} style:color={commented ? "var(--blue)" : "var(--surface-2)"}>
					<CommentIcon stroke={commented ? "var(--blue)" : "var(--surface-2)"} style="width: 1rem;" />
					{#await comments}
						0
					{:then comments}
						{comments}
					{/await}
				</button>
			{/await}

			<Notification message="Saved" bind:this={saveNotification} />
			<Notification message="Unsaved" bind:this={unsaveNotification} />
			<Notification message="Link copied!" bind:this={shareNotification} />

			<!-- Post Actions Button -->
			<button onclick={event => actionsMenu.open(event)}>
				<DotMenuIcon stroke="var(--overlay-1)" style="width: 1.25rem;" />
			</button>

			<ContextMenu bind:this={actionsMenu}>
				{#if user()}
					{#if saved}
						<button onclick={unsave}>Unsave</button>
					{:else}
						<button onclick={save}>Save</button>
					{/if}
				{/if}
				<button onclick={share}>Share</button>
				{#if isCurrentUser}
					<button onclick={deleteAndUpdate}>
						Delete Post
					</button>
				{:else}
					<button>Report</button>
				{/if}
			</ContextMenu>
		</div>
	</div>
</section>

<style>
	.stats {
		display: flex;
		justify-content: space-between;
		padding-top: 1rem;
		padding-right: 1rem;
		align-items: center;

		> * {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-size: 0.85rem;
			text-decoration: none;
		}
	}

	.replying-to {
		font-size: 0.85rem;
		display: flex;
		gap: 0.25rem;
		align-items: center;
		color: var(--surface-2);

		.loading-replying {
			height: 0.70rem;
			width: 4rem;
			border-radius: 100vmax;
			background-color: var(--surface-0);
		}
	}

	section {
		position: relative;
		padding-top: 1rem;
		padding-right: 1rem;
		padding-bottom: 0.5rem;
		display: flex;
		cursor: pointer;
		width: 100%;
		top: 0px;
	}

	.content-outer {
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
	}

	.profile {
		display: flex;
		flex-direction: column;
		align-items: center;

		.no-picture {
			background-color: var(--surface-2);
		}

		a, .no-picture {
			z-index: 99;
			width: 3rem;
			height: 3rem;
			border-radius: 50%;
			margin-right: 1rem;
			margin-left: 1rem;
			background-size: cover;
		}
	}

	.user {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		margin-bottom: 0.25rem;
		overflow: hidden;

		a {
			text-decoration: none;
		}

		.display-name {
			font-size: 1rem;
			color: var(--text);
			font-size: 0.85rem;

			&.absolute-timestamp {
				flex-shrink: 1;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.name {
			display: flex;
			gap: 0.5rem;
			flex-shrink: 1;
			overflow: hidden;
		}

		.username {
			color: var(--surface-2);
			font-size: 0.85rem;
			text-overflow: ellipsis;
			overflow: hidden;
			flex-shrink: 2;
		}

		button {
			font-weight: normal;
			font-size: 1rem;
		}

		.missing-username {
			height: 1.35rem;
			border-radius: 100vmax;
			width: 8rem;
			background-color: var(--surface-0);
		}

		.timestamp {
			font-size: 0.85rem;
			top: 1rem;
			right: 1rem;
			cursor: pointer;
			color: var(--surface-2);
			white-space: nowrap;
			flex-grow: 1;
			text-align: right;
			padding-left: 1rem;
		}
	}

	.pronouns {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		max-width: 25%;

		.dot {
			width: 0.2rem;
			height: 0.2rem;
			border-radius: 50%;
			background-color: var(--surface-2);
		}

		h2 {
			color: var(--surface-2);
			font-size: 0.85rem;
			font-weight: normal;
			white-space: nowrap;
		}
	}
</style>
