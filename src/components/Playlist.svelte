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
		removeDuplicatesCall(playlist, 0);
	}

	function removeSelectedDuplicates() {
		let selectedPlaylistsComplete = Object.values(playlists.playlists).filter((playlist) =>
			selectedPlaylists.includes(playlist.id)
		);
		selectedPlaylistsComplete.forEach((selectedPlaylist) => {
			removeDuplicatesCall(selectedPlaylist, 0);
		});
	}

	function removeAllDuplicates() {
		let isExecuted = confirm('Are you sure you want to modify all your playlists?');
		if (isExecuted) {
			console.log('goooooooooooooooooooo');
			/* Object.values(playlists.playlists).forEach((playlist) => {
				removeDuplicatesCall(playlist, 0);
			}); */
		}
	}

	onMount(onMountFetch);
</script>

{#if playlists.playlists.size != 0}
	<button on:click={() => removeAllDuplicates()}> Remove all duplicates </button>
	<button> Like all songs </button>
	<button on:click={() => removeSelectedDuplicates()} disabled={selectedPlaylists.length === 0}>
		Remove selected duplicates
	</button>
	<button disabled={selectedPlaylists.length === 0}> Like selected songs </button>
	<div class="items-container">
		{#each Object.values(playlists.playlists) as playlist, i}
			<div class="list-container">
				<div class="item-container">
					<label class="playlist-label">
						<input
							type="checkbox"
							bind:group={selectedPlaylists}
							name="playlistName"
							value={playlist.id}
						/>
						{playlist.name}
					</label>
					<button
						class="removeDuplicates"
						on:click={() => removeDuplicates(playlist)}
						disabled={!selectedPlaylists.find((selected) => selected === playlist.id)}
					>
						Remove duplicates
					</button>
					<button
						class="likeSongs"
						on:click={() => console.log(selectedPlaylists)}
						disabled={!selectedPlaylists.find((selected) => selected === playlist.id)}
					>
						Like songs
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.playlist-label {
		margin: 0;
		position: absolute;
		top: 50%;
		-ms-transform: translateY(-50%);
		transform: translateY(-50%);
		float: left;
	}

	.likeSongs {
		float: right;
	}
	.removeDuplicates {
		float: right;
		margin-left: 1rem;
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
		
		position: relative;
		background: var(--dark-2);
		padding: 1rem;
		margin: 0.3rem;
		justify-content: space-between;
		align-items: left;
		height: clamp(8rem, auto, 10rem);
		border-style: solid;
		border-color: var(--light-2);
		border-radius: 2rem;
		border-width: 0.1rem;
	}
</style>
