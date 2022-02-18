import { readable, writable } from 'svelte/store';

export let accessToken = null;

export const token = readable(null, function start(set) {
  const hashParams: any = {};
  const r = /([^&;=]+)=?([^&;]*)/g;
  if (typeof window !== "undefined") {
    const q = window.location.hash.substring(1);
    let e;
    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    const access_token: any = hashParams.access_token;
    accessToken = hashParams.access_token;
    set(access_token);
    window.history.pushState("object or string", "Title", "/");
  }
})

export const appUrl = readable(null, function start(set) {
  //set("https://spotify-prewrapped.vercel.app/");
  set("http://localhost:3000/");
});

export const timeRange = writable('medium_term');

export const tokenExpired = writable(false);