<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { getBook } from "../api/bookapi";
	import { type Post } from "../api/postapi";
	import { getFavoriteBook, getFollowers, getUserPosts, type User, updateUser, user } from "../api/userapi.svelte";
	import BookIcon from "./icons/BookIcon.svelte";
	import ClockIcon from "./icons/ClockIcon.svelte";
	import LeftArrowIcon from "./icons/LeftArrowIcon.svelte";
	import SortIcon from "./icons/SortIcon.svelte";
	import StarIcon from "./icons/StarIcon.svelte";
	import Badges from "./Badges.svelte";
	import BookListing from "./book/BookListing.svelte";
	import ContextMenu from "./util/ContextMenu.svelte";
	import AnyPost from "./post/AnyPost.svelte";
	import RadioInput from "./util/RadioInput.svelte";
	import { cssVar } from "../api/themes.svelte";
	import { getFile } from "../api/storageapi";
	import Sidebar from "./Sidebar.svelte";
	import ClickableImage from "./util/ClickableImage.svelte";
	import PostBody from "./post/PostBody.svelte";
	import PageWithViews from "./layout/PageWithViews.svelte";
	import BellIcon from "./icons/BellIcon.svelte";
	import SlashedBellIcon from "./icons/SlashedBellIcon.svelte";

	let { sidebar, user: profileUser }: { sidebar: Sidebar, user: User } = $props();

	let view: "all" | "books" | "other" | "activity" | "list" = $state(new URLSearchParams(window.location.search).get("view") as any ?? "all");

	/** This user's highest rated book */
	let favoriteBook = getFavoriteBook(profileUser);

	let readingList = Promise.all(profileUser.readingList.map(isbn => getBook(isbn)));

	let followers = getFollowers(profileUser);

	/** This user's posts */
	let posts = getUserPosts(profileUser);

	/** Whether the profile being viewed is of the currently logged in user. */
	let isCurrentUser = $derived(user()?.id === profileUser.id);

	/** The title of the book that the user is currently reading (or null if they aren't) */
	let currentlyReading = profileUser.currentBook ? getBook(profileUser.currentBook) : Promise.resolve(null);

	/** The total number of books this user has read */
	let booksRead = posts.then(posts => posts.filter(post => post.type === "rating").length);

	let notificationsOn = $derived(user()?.notifyingPosters.includes(profileUser.id));

	let showFullReviews = $state(false);
	let ratingSortMenu: ContextMenu = $state(null!);

	let ratingSort: "best" | "recent" = $state("best");
	let ratingSortName = $derived({ best: "Highest Rated", recent: "Recently Finished" }[ratingSort]);
	let ratings = $derived.by(async () => {
		ratingSort;

		return posts.then(posts => {
			return posts
				.filter(post => post.type === "rating")
				.toSorted({
					best: (a: Post, b: Post) => b.rating - a.rating,
					recent: (a: Post, b: Post) => b.timestamp - a.timestamp,
				}[ratingSort]);
		});
	});

	function sortRatingsBy(sorter: "best" | "recent") {
		return () => {
			ratingSort = sorter;
			ratingSortMenu.close();
		};
	}

	/** Follows this user. */
	function follow() {
		updateUser({
			following: [...new Set([...user()!.following, profileUser.id])],
		});
	}

	/** Unfollows this user. */
	function unfollow() {
		updateUser({
			following: user()!.following.filter(id => id !== profileUser.id),
		});
	}

	function gotoView(viewName: string) {
		return function() {
			goto(`${window.location.origin}${window.location.pathname}?${new URLSearchParams({ view: viewName })}`);
			view = viewName as any;
		}
	}

	let ratingOptions: HTMLElement | null = $state(null);

	function hexToRgb(hex: string) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
		return {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		};
	}


	function lerp(start: string, stop: string, percent: number) {
		percent = Math.min(Math.max(percent, 0), 1)
		const rgbA = hexToRgb(start);
		const rgbB = hexToRgb(stop);
		const colorVal = (prop: "r" | "g" | "b") => Math.round(rgbA[prop] * (1 - percent) + rgbB[prop] * percent);
		return {
			r: colorVal('r'),
			g: colorVal('g'),
			b: colorVal('b'),
		}
	}

	let contentElement: HTMLElement | undefined = $state(undefined);
	let nameElement: HTMLElement | null = $state(null);
	let nameLeft = $state("-1.8rem");

	onMount(() => {
		document.addEventListener("scroll", () => {
			ratingSortMenu?.close();

			if (ratingOptions) {
				const top = ratingOptions.getBoundingClientRect().top - 150;
				const percent = top / 100;

				const { r, g, b } = lerp(cssVar("crust"), cssVar("base"), percent);
				ratingOptions.style.background = `rgb(${r}, ${g}, ${b})`
			}

			if ((nameElement?.getBoundingClientRect().top ?? 999) <= 24) {
				nameLeft = `${window.innerWidth / 2 - nameElement!.getBoundingClientRect().width / 2}px`;
			} else {
				nameLeft = "-1.8rem";
			}
		}, true); // me when true
	});

	let picture = $derived(getFile(profileUser.picture));

	async function toggleNotifications() {
		let notifyingPosters = user()!.notifyingPosters;
		if (notificationsOn) notifyingPosters = notifyingPosters.filter(poster => poster !== profileUser.id);
		else notifyingPosters.push(profileUser.id);

		await updateUser({ notifyingPosters: [...new Set(notifyingPosters)] })
	}
</script>

<section>
	{#await getFile(profileUser.banner) then bnr}
		<ClickableImage src={bnr!}>
			<div class="banner" style:background-image={`url("${bnr}")`}></div>
		</ClickableImage>
	{/await}
	<button class="back-arrow" onclick={() => sidebar.show()}>
		<LeftArrowIcon stroke="#FFFFFF" style="width: 1.5rem; height: 1.5rem;" />
	</button>
	<div class="profile">
		{#await picture then pfp}
			<ClickableImage
				class="profile-picture"
				src={pfp!}
				alt={`${profileUser.displayName} profile picture`}
			/>
		{/await}
		<div class="profile-line-1">
			<span class="name" bind:this={nameElement} style:margin-left={nameLeft}>
				{#await picture then pfp}
					<ClickableImage
						class="profile-picture-small"
						src={pfp!}
						alt={`${profileUser.displayName} profile picture`}
					/>
				{/await}

				<!-- Username -->
				<h1>{profileUser.displayName}</h1>
				<h2>@{profileUser.username}</h2>

				<!-- Badges -->
				<Badges forUser={profileUser} size={1} />

				{#if profileUser.pronouns && profileUser.showPronounsOnProfile}
					<div class="dot"></div>
					<h2 class="pronouns">{profileUser.pronouns}</h2>
				{/if}
			</span>

		</div>

		<div class="bio">
			<PostBody body={profileUser.bio} style="color: var(--overlay-1); margin-left: 1rem;" />
		</div>

		<!-- Edit profile button -->
		<div class="buttons">
			{#if !isCurrentUser}
				<button
					class="circle"
					onclick={toggleNotifications}
					style:border-color={notificationsOn ? "var(--green)" : "var(--red)"}
				>
					{#if notificationsOn}
						<BellIcon style="width: 1rem; height: 1rem;" stroke="var(--green)" />
					{:else}
						<SlashedBellIcon style="width: 1rem; height: 1rem;" stroke="var(--red)" />
					{/if}
				</button>
			{/if}

			{#if isCurrentUser}
				<button class="edit button" onclick={() => goto("/profile/edit")}>
					Edit Profile
				</button>
			{:else if user()}
				{#if user()!.following.includes(profileUser.id)}
					<button class="unfollow button" onclick={unfollow}>
						Unfollow
					</button>
				{:else}
					<button class="follow button" onclick={follow}>
						Follow
					</button>
				{/if}
			{/if}
		</div>

		<!-- Line 2: Profile stats -->
		<div class="profile-line-2">
			{#await booksRead then booksRead}
				{#if booksRead > 0}
					<span class="profile-books">
						<!-- Favorite Book -->
						{#await favoriteBook then favorite}
							{#if favorite}
								<a href={`/book/${favorite.isbn}`} title={`${profileUser.displayName}'s highest rated book is ${favorite.title}`}>
									<StarIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem; flex-shrink: 0;" />
									<span class="truncate">{favorite.title}</span>
								</a>
							{/if}
						{/await}

						<!-- Current book -->
						{#await currentlyReading then current}
							{#if current}
								<a href="/book/{current.isbn}" title={`${profileUser.displayName} is currently reading ${current.title}`}>
									<ClockIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem; flex-shrink: 0;" />
									<span class="truncate">{current.title}</span>
								</a>
							{/if}
						{/await}
					</span>
				{/if}

				<!-- Number of books read -->
				<a onclick={gotoView("books")} href="/profile/{profileUser.username}?view=books" title="{profileUser.displayName} has read {booksRead} book{booksRead === 1 ? '' : 's'}">
					<BookIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem;" />
					<span>{booksRead}</span>
				</a>
			{/await}
		</div>
		<a class="follows" href={`/profile/${profileUser.username}/follows`}>
			{#await followers then followers}
				<span>
					{followers.length} Followers
				</span>
			{/await}
			<span>
				{profileUser.following.length} Following
			</span>
		</a>

		<div>
			<PageWithViews
				bind:view
				views={["all", "books", "activity", "list", "other"]}
				top="2.7rem"
				bind:contentElement
			>
				{#await posts}
					<div class="loading">
						<h1>Loading posts...</h1>
						<p>We promise Wallflower will be faster soon.</p>
					</div>
				{:then posts}
					<!-- All -->
					<div>
						{#each posts as post}
							<AnyPost {post} />
						{/each}
					</div>

					<!-- Books -->
					<div>
						<div bind:this={ratingOptions} class="rating-options">
							<span style:color="var(--overlay-1)">
								<label for="show-full-reviews">Show full reviews</label>
								<RadioInput id="show-full-reviews" size={0.5} bind:value={showFullReviews} />
							</span>
							<span style:color="var(--overlay-1)">
								<label for="change-rating-sort">{ratingSortName}</label>
								<button onclick={event => ratingSortMenu.toggle(event)} id="change-rating-sort">
									<SortIcon stroke="var(--overlay-1)" style="width: 1.5rem; height: 1.5rem;" />
								</button>
							</span>
							<ContextMenu bind:this={ratingSortMenu}>
								<button onclick={sortRatingsBy("best")}>
									Highest Rated
								</button>
								<button onclick={sortRatingsBy("recent")}>
									Recently Finished
								</button>
							</ContextMenu>
						</div>
						{#await ratings then ratings}
							{#each ratings as post (post.id)}
								{#if showFullReviews}
									<AnyPost {post} />
								{:else}
									{#await getBook(post.books[0]) then book}
										<BookListing {book} rating={post.rating} user={profileUser} onclick={() => goto(`/post/${post.id}`)} />
									{/await}
								{/if}
							{/each}
						{/await}
					</div>

					<!-- Activity -->
					<div>
						{#each posts.filter(post => post.type === "update") as post}
							<AnyPost {post} />
						{/each}
					</div>

					<!-- List -->
					<div>
						{#await readingList then readingList}
							{#each readingList as book}
								<BookListing {book} user={profileUser} />
							{/each}
						{/await}
					</div>

					<!-- Discussion -->
					<div>
						{#each posts.filter(post => post.type === "general") as post}
							<AnyPost {post} />
						{/each}
					</div>
				{/await}
			</PageWithViews>
		</div>
	</div>
</section>

<style>
	.pronouns {
		display: flex;
		align-items: center;
		color: var(--surface-2);
	}

	.rating-options {
		background: var(--base);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem 0.5rem 1rem;
		border-bottom: 1px solid var(--surface-0);
		position: sticky;
		top: 5.0rem;
		z-index: 9999;

		label {
			font-size: 0.85rem;
		}

		> * {
			display: flex;
			align-items: center;
			gap: 1rem;

			button {
				height: 1.5rem;
			}
		}
	}

	:global(.profile-picture-small) {
		border-radius: 50%;
		width: 1.75rem;
		height: 1.75rem;
		margin-right: 0.5rem;
	}

	.bio {
		z-index: 1000;
	}

	.dot {
		width: 0.2rem;
		height: 0.2rem;
		border-radius: 50%;
		background-color: var(--surface-2);
	}

	.loading {
		padding-top: 2rem;
		gap: 0.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;

		h1 {
			font-size: 1.5rem;
			color: var(--subtext-1);
		}

		p {
			font-size: 0.85rem;
			color: var(--overlay-1);
		}
	}

	section {
		min-height: 100%;
		position: relative;
		background-color: var(--crust);
	}

	.follows {
		border-radius: 100vmax;
		font-size: 0.8rem;
		text-decoration: none;
		display: flex;
		padding-left: 1rem;
		gap: 1rem;
		color: var(--overlay-1);
	}

	.truncate {
		text-overflow: ellipsis;
		text-wrap: nowrap;
		display: inline-block;
		overflow-x: hidden;
		font-size: 0.85rem;
	}

	.back-arrow {
		width: 2rem;
		height: 2rem;
		position: absolute;
		background: rgba(0, 0, 0, 0.5);
		clip-path: circle();
		left: 1rem;
		top: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.banner {
		width: 100%;
		height: 7.5rem;
		position: absolute;
		background-size: cover;
		background-position: center;
	}

	.profile {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		:global(.profile-picture) {
			margin-left: 1rem;
			border-radius: 50%;
			width: 6rem;
			height: 6rem;
			margin-top: 4.7rem;
			z-index: 1002;
			border: 0.5rem solid var(--crust);
		}
	}

	.profile-line-2 {
		display: flex;
		align-items: center;
		gap: 1.0rem;
		margin-left: 1rem;

		> a {
			display: flex;
			gap: 0.5rem;
			align-items: center;
			margin-right: 1rem;
			color: var(--overlay-1);
			text-decoration: none;
		}
	}

	.profile-books {
		display: flex;
		overflow: hidden;
		gap: 1rem;

		> a {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			color: var(--overlay-1);
			text-decoration: none;
			max-width: 50%;
		}
	}

	.profile-line-1 {
		display: flex;
		padding: 1rem;
		padding-bottom: 0.5rem;
		padding-left: 0rem;
		margin-bottom: -1rem;
		position: sticky;
		top: 0px;
		z-index: 999;
		background-color: var(--crust);
		margin-top: -1.1rem;
		padding-top: 1.1rem;

		h1 {
			font-size: 1.25rem;
			color: var(--text);
		}

		h2 {
			font-size: 1rem;
			font-weight: normal;
			color: var(--surface-2);
		}

	}

	.buttons {
		position: absolute;
		right: 0px;
		top: 8.5rem;
		display: flex;
		gap: 0.75rem;

		.circle {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 2rem;
			height: 2rem;
			border-width: 1px;
			border-style: solid;
			border-radius: 50%;
			z-index: 999;
		}
	}

	.button {
		width: 7rem;
		height: 2rem;
		margin-right: 1rem;
		padding-left: 1rem;
		padding-right: 1rem;
		border-radius: 100vmax;
		font-weight: 500;
		color: var(--crust);
		transition: scale 0.2s;
		box-shadow: 0px 0px 0.5rem var(--box-shadow);
		z-index: 1002;

		&:hover {
			scale: 105%;
		}

		&.follow {
			background-image: linear-gradient(to bottom right, var(--lavender), var(--blue));
		}

		&.unfollow {
			background-image: linear-gradient(to bottom right, var(--peach), var(--red));
		}

		&.edit {
			background-image: linear-gradient(to bottom right, var(--teal), var(--green));
		}
	}

	.name {
		color: var(--subtext-1);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: -0.5rem;
		width: fit-content;
		transition: margin-left 0.2s;
		z-index: 1010;
		background-color: var(--crust);
	}
</style>
