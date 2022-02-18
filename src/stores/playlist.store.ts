import { identity } from 'svelte/internal';
import { derived, readable } from 'svelte/store';
import { accessToken, timeRange } from './token.store';

let playlistToStore = [];

export function initialValue() {
	return {
		playlists: new Map(),
	}
}

export function makePlaylistStore(args) {
	// 1. Build the store and initialize it as empty and error free
	let initial = initialValue();
	let store = readable(initial, makeSubscribe(initial, args));
	return store;
}
function unsubscribe() {
	// Nothing to do in this case
}

function makeSubscribe(data, _args) {
	// 2. Create a closure with access to the 
	// initial data and initialization arguments
	return set => {
		console.log('init set', set)
		// 3. This won't get executed until the store has 
		// its first subscriber. Kick off retrieval.
		fetchPlaylistData(data, set, 0);

		// 4. We're not waiting for the response.
		// Return the unsubscribe function which doesn't do
		// do anything here (but is part of the stores protocol).
		return unsubscribe;
	};
}

async function fetchPlaylistData(data, set, offset) {
	try {
		// 5. Dispatch the request for the users
		const urlPlaylist = await new URL(`https://api.spotify.com/v1/me/playlists?`);

		// @ts-ignore
		const params = new URLSearchParams({
			time_range: timeRange,
			limit: 50,
			offset: offset
		});
		// @ts-ignore
		const responsePLaylists = await fetch(urlPlaylist + params, {
			headers: {
				Authorization: 'Bearer ' + accessToken
			}
		});

		if (responsePLaylists.ok) {
			const playlists = await responsePLaylists.json();

			if (playlists.items != null) {
				await offset === 0
					? playlistToStore = playlists.items
					: playlistToStore = [...playlistToStore, ...playlists.items];

				if (playlistToStore == null) {
					playlistToStore = [];
				}
				while (playlistToStore.length !== playlists.total) {
					await fetchPlaylistData(data, set, offset + 50);
				}
			}

			if (playlistToStore.length === playlists.total) {
				let playlistToSet = {
					playlists: playlistToStore.reduce((map, obj) => {
						map[obj.id] = obj;
						return map;
					}, {})
				}
				set(playlistToSet);
			}

		} else {
			const text = responsePLaylists.text();
			throw new Error(await text);
		}

	} catch (error) {
		// 6b. if there is a fetch error - deal with it
		// and let observers know
		data.error = error;
		set(data);
	}
}
