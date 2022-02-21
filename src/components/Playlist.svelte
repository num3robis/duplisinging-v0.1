<script>
	import { initialValue, makePlaylistStore, removeDuplicatesCall } from '../stores/playlist.store';
	import { onDestroy, onMount } from 'svelte';

	let selectedPlaylists = [];
	let unsubscribe;
	let playlistsStore = makePlaylistStore(null);
	let playlists = initialValue();

	function updateUsers(data) {
		// trigger component reactivity
		playlists = data;
	}

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
			unsubscribe = null;
		}
	});

	function onMountFetch() {
		if (!unsubscribe) {
			unsubscribe = playlistsStore.subscribe(updateUsers);
		}
	}

	function removeDuplicates(playlist) {
		console.log(playlist);
		removeDuplicatesCall(playlist, 0);
		//return true;
	}

	onMount(onMountFetch);
</script>

{#if playlists.playlists.size != 0}
	<button> Remove all duplicates </button>
	<button> Like all songs </button>
	<button disabled={selectedPlaylists.length === 0}> Remove selected duplicates </button>
	<button disabled={selectedPlaylists.length === 0}> Like selected songs </button>
	<div class="items-container">
		{#each Object.values(playlists.playlists) as playlist, i}
			<div class="list-container">
				<div class="item-container">
					<label>
						<input
							type="checkbox"
							bind:group={selectedPlaylists}
							name="playlistName"
							value={playlist.name}
						/>
						{playlist.name}
					</label>
					<button
						class="removeDuplicates"
						on:click={() => removeDuplicates(playlist)}
						disabled={!selectedPlaylists.find((selected) => selected === playlist.name)}
					>
						Remove duplicates
					</button>
					<button
						class="likeSongs"
						on:click={() => console.log(selectedPlaylists)}
						disabled={!selectedPlaylists.find((selected) => selected === playlist.name)}
					>
						Like songs
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.likeSongs {
		float: right;
	}
	.removeDuplicates {
		float: right;
		margin-left: 1rem;
	}

	.expand-btn {
		width: clamp(20rem, 70%, 45rem);
		font-size: 2rem;
		font-weight: 500;
		margin: 3rem auto 0.25rem auto;
		border-style: solid;
	}

	.expand-btn-icon,
	.collapse-btn-icon,
	.placeholder {
		float: right;
		padding: 0.25rem;
		margin: auto 0;
		font-size: 1.5rem;
		font-weight: lighter;
		transform: scale(1.25);
	}
	.placeholder {
		float: left;
	}

	.expand-btn-icon::after {
		content: '\2228';
	}

	.collapse-btn-icon::after {
		content: '\2227';
	}

	.placeholder::after {
		content: '\2227';
		color: var(--dark-1);
	}
	button:hover .placeholder::after {
		color: var(--light-1);
	}
	.highlight .placeholder {
		color: var(--light-1);
	}

	.highlight .placeholder::after {
		color: var(--light-1);
	}
	.list-container {
		margin-left: auto;
		margin-right: auto;
		width: clamp(20rem, 70%, 40rem);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
	}

	.item-container {
		background: var(--dark-2);
		padding: 1rem;
		margin: 0.3rem;
		justify-content: space-between;
		align-items: center;
		height: clamp(8rem, auto, 10rem);
		border-style: solid;
		border-color: var(--light-2);
		border-radius: 2rem;
		border-width: 0.1rem;
	}

	.item-details {
		color: var(--light-2);
		text-align: left;
		width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		padding: 0 1rem;
		justify-content: space-evenly;
	}

	.item-name {
		margin: 0;
	}

	.item-info {
		font-size: 1.2rem;
		margin: 1.5rem 0;
	}

	.item-img {
		border-radius: 10px;
		width: clamp(1rem, 100%, 10rem);
		float: right;
		margin: 0 1rem;
		position: relative;
	}

	/* Phone media query */
	@media (max-width: 670px) {
		.expand-btn {
			width: clamp(20rem, 70%, 45rem);
			margin: 2rem auto 0.25rem auto;
		}
		.item-container {
			flex-direction: column;
			align-items: center;
		}
		.item-details {
			display: flex;
			width: 100%;
			height: 100%;
			text-align: center;
			margin: auto;
			padding: 0;
		}
		.item-img {
			margin: 0;
			float: none;
		}
		.item-info {
			font-size: 1.2rem;
			margin: 1rem 0 2rem 0;
		}
	}
</style>
