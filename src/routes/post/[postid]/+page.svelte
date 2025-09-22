<script lang="ts">
	import { getPostFromId, getReplies, post, type Post, type PostId } from "../../../api/postapi";
	import { getFile, type FileId } from "../../../api/storageapi";
	import AddImageIcon from "../../../components/icons/AddImageIcon.svelte";
	import SendIcon from "../../../components/icons/SendIcon.svelte";
	import { user } from "../../../api/userapi.svelte";
	import CharacterLimitMeter from "../../../components/util/CharacterLimitMeter.svelte";
	import ImageCarousel from "../../../components/util/ImageCarousel.svelte";
	import ImagePicker from "../../../components/util/ImagePicker.svelte";
	import Page from "../../../components/layout/Page.svelte";
	import AnyPost from "../../../components/post/AnyPost.svelte";

	let { data }: { data: { postid: PostId } } = $props();
	let postid = $derived(data.postid);
	let thePost = $derived(getPostFromId(postid)!);

	let reply: HTMLElement = $state(null!);

	let replyState: "contracted" | "expanded" = $state("contracted");

	let replies = $derived(thePost.then(post => getReplies(post!)));
	let newReplies: Post[] = $state([]);

	function expand() {
		replyState = "expanded";
		reply.style.borderRadius = "0.5rem";
	}

	function contract() {
		if (replyBody.trim().length === 0) {
			replyState = "contracted";
			setTimeout(() => {
				if (replyState === "contracted") {
					reply.style.borderRadius = "100vmax";
				}
			}, 200);
		}
	}

	let replyBody = $state("");
	let canReply = $derived(/\S/.test(replyBody));

	let images: FileId[] = $state([]);

	async function sendReply() {
		let body = replyBody;
		replyBody = "";
		let replyPost = await post({
			body,
			type: "reply",
			parent: (await thePost)!.id,
			pictures: images,
		});
		newReplies = [replyPost, ...newReplies];
	}

	let parentChain = $derived.by(async () => {
		let current = (await thePost)!;
		let chain: Post[] = [];
		while (true) {
			if (current.type !== "reply") return chain.toReversed();
			current = (await getPostFromId(current.parent))!;
			chain.push(current);
		}
	});

	function checkLength(event: Event) {
		if (replyBody.length >= 144) {
			event.preventDefault();
		}
	}

	let characterLimitStyle = $derived.by(() => (replyState === "expanded" ? "flex" : "none"));
	let mainPost: HTMLElement = $state(null!);
	let container: HTMLElement;

	let parents: HTMLElement[] = $state([]);
	let parentContainer: HTMLElement | null = $state(null);
	let height = $derived.by(() => `calc(100dvh + ${parentContainer?.getBoundingClientRect().height ?? 0}px)`);

	let replyLineHeight = $state(`0px`);
	let replyLine: HTMLElement | null = $state(null);
	setInterval(() => {
		if (!mainPost) return;
		replyLineHeight = `${mainPost.getBoundingClientRect().top - (replyLine?.getBoundingClientRect().top ?? 0)}px`;
	}, 100);
</script>

<Page type="search" class="post">
	<section bind:this={container} style:min-height={height}>
		{#await thePost then post}
			{#await parentChain then parentChain}
				<div class="parents" bind:this={parentContainer}>
					{#each parentChain as parent, index}
						<AnyPost bind:element={parents[index]} post={parent} noborder={index === parents.length - 1} />
					{/each}
				</div>

				{#if parentChain.length > 0}
					<div bind:this={replyLine} class="reply-line" style:height={replyLineHeight}></div>
				{/if}
			{/await}

			<AnyPost bind:element={mainPost} post={post!} postpage />

			{#if user()}
				<div class="reply">
					<a aria-label="Go to profile" href="/profile">
						{#await getFile(user()!.picture) then pfp}
							<img alt="Your profile" src={pfp} />
						{/await}
					</a>

					<div class="reply-body">
						<div
							class="textarea {replyState === 'expanded' ? 'expanded' : ''}"
							bind:this={reply}
							style="border-radius: 100vmax;"
						>
							<div title="Post" class="send">
								<label for="attach-image-reply">
									<AddImageIcon stroke="var(--overlay-1)" style="width: 1.25rem;" />
								</label>
								<ImagePicker
									allowEdit={false}
									id="attach-image-reply"
									onupload={async imageId => images.push(imageId)}
								/>

								<button disabled={!canReply} onmousedown={sendReply}>
									<SendIcon
										stroke={canReply ? "var(--overlay-1)" : "var(--surface-0)"}
										style="width: 1.25rem;"
									/>
								</button>
							</div>
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								onblur={contract}
								onfocus={expand}
								bind:textContent={replyBody}
								contenteditable
								class="content"
								onkeypress={checkLength}
							></div>
						</div>

						<ImageCarousel bind:images editable />

						<CharacterLimitMeter display={characterLimitStyle} limit={144} bind:text={replyBody} />
					</div>
				</div>
			{/if}

			{#await replies then replies}
				{#each newReplies as newReply}
					<AnyPost post={newReply} />
				{/each}
				<div class="replies">
					{#each replies as reply}
						<AnyPost post={reply} />
					{/each}
				</div>
			{/await}

			<div class="padder"></div>
		{/await}
	</section>
</Page>

<style>
	section {
		overflow-y: auto;
		height: 100%;
		width: 100%;
		position: relative;
	}

	.reply-line {
		outline: 0.5rem solid var(--base);
		width: 2px;
		background: var(--surface-2);
		height: 8rem;
		left: 2.5rem;
		top: 2.5rem;
		position: absolute;
		z-index: 2;

		&::before {
			content: "";
			position: absolute;
			display: block;
			width: 100%;
			height: 1rem;
			top: 100%;
			left: -0.5rem;
			background: var(--crust);
			padding-left: 0.5rem;
			padding-right: 0.5rem;
		}

		&::after {
			content: "";
			position: absolute;
			display: block;
			width: 100%;
			height: 1rem;
			top: 100%;
			left: 0px;
			background: inherit;
		}
	}

	label {
		cursor: pointer;
	}

	:global(.post) {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: calc(100% - 4rem);
	}

	.textarea {
		resize: none;
		font-size: 0.85rem;
		width: 100%;
		transition: height 0.2s;
		margin-top: 0.4rem;
		filter: brightness(90%);
		background: var(--mantle);
		color: var(--subtext-1);
		word-break: break-all;
		overflow: hidden;
		height: 2.3rem;
		border-radius: 0.5rem;

		&.expanded {
			height: 8rem;
		}

		.content {
			padding: 0.5rem;

			&:empty::before {
				content: "Leave a reply...";
				margin-left: 0.5rem;
				color: var(--overlay-1);
				pointer-events: none;
			}
		}
	}

	.replies {
		width: 100%;
	}

	.reply-body {
		width: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.reply {
		display: flex;
		width: 100%;
		padding: 1rem;
		gap: 1rem;
		border-bottom: 1px solid var(--surface-0);

		a {
			border-radius: 50%;
			width: 3rem;
			height: 3rem;

			img {
				width: 3rem;
				height: 3rem;
				border-radius: 50%;
			}
		}
	}

	.send {
		display: flex;
		gap: 0.5rem;
		height: 1lh;
		border-radius: 0.5rem;
		float: right;
		margin-top: 0.5rem;
		margin-right: 0.5rem;
		margin-left: 0.5rem;

		> * {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
</style>
