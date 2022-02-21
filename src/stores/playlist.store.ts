import type { SpotifyPlaylistTrackType, SpotifyPlaylistType } from 'src/interfaces/spotifyAPI.interface';
import { identity } from 'svelte/internal';
import { readable } from 'svelte/store';
import { accessToken, timeRange, token } from './token.store';

let playlistToStore: Array<SpotifyPlaylistType> = [];
let tracksPlaylisted: Array<SpotifyPlaylistTrackType> = [];

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


export async function removeDuplicatesCall(playlist, offset) {
	try {
		const urlPlaylistTracks = await new URL(playlist.tracks.href + "?");

		// @ts-ignore
		const params = new URLSearchParams({
			time_range: timeRange,
			limit: 50,
			offset: offset
		});
		// @ts-ignore
		const responsePLaylistTracks = await fetch(urlPlaylistTracks + params, {
			headers: {
				Authorization: 'Bearer ' + accessToken
			}
		});

		if (responsePLaylistTracks.ok) {
			const tracks = await responsePLaylistTracks.json();
			if (tracks.items != null && tracks.items.length != 0) {
				await offset === 0
					? tracksPlaylisted = tracks.items
					: tracksPlaylisted = [...tracksPlaylisted, ...tracks.items];

				if (tracksPlaylisted == null) {
					tracksPlaylisted = [];
				}
				while (tracksPlaylisted.length !== tracks.total) {
					await removeDuplicatesCall(playlist, offset + 50);
				}
			}

			if (tracksPlaylisted.length === tracks.total && tracksPlaylisted.length != 0) {
				// Get one id for each duplicate
				const duplicatesIds = tracksPlaylisted.map(e => e['track']['id'])
					.map((e, i, final) => final.indexOf(e) !== i && i)
					.filter(obj => tracksPlaylisted[obj])
					.map(e => tracksPlaylisted[e]['track']["id"])
				let firstDuplicate = []
				// Get all duplicate elements except first one
				const duplicatesFound = tracksPlaylisted.filter((track, index) => {
					let first = true;
					if (duplicatesIds.includes(track.track.id)) {
						track.index = index
						if (!firstDuplicate.includes(track.track.id)) {
							first = false;
						}
						firstDuplicate.push(track.track.id)
					}
					return first ? duplicatesIds.includes(track.track.id) : false;
				});
				if (duplicatesFound != null && duplicatesFound.length != 0) {
					do {
						const chunk = duplicatesFound.splice(0, 50);
						const body = {
							tracks: chunk.map(track => {
								return { uri: track.track.uri, positions: [track.index] }
							})
						};
						await fetch(`https://api.spotify.com/v1/users/${encodeURIComponent(playlist.owner.id)}/playlists/${playlist.id}/tracks`, {
							method: 'DELETE',
							headers: {
								Authorization: 'Bearer ' + accessToken
							},
							body: JSON.stringify(body)
						});
					} while (duplicatesFound.length > 0);
				}
			}
		}
	} catch (error) {
		console.error("error", error)
	}
}
