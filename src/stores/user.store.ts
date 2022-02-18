import { readable } from 'svelte/store';

import { token, timeRange } from './token.store';

let userToStore = [];

async function getMyUser() {
	const accessToken = token;

	const url = new URL(`https://api.spotify.com/v1/me?`);
	// @ts-ignore
	const params = new URLSearchParams({
		time_range: timeRange,
		limit: 10,
		offset: 0
	});
	// @ts-ignore
	userToStore.push(await fetch(url + params, {
		headers: {
			Authorization: 'Bearer ' + accessToken
		}
	}));
}

getMyUser();
export const userStore = readable(userToStore);

