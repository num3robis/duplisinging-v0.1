export type SpotifyArtistType = {
	id: string;
	name: string;
};

export type SpotifyTrackType = {
	artists: Array<SpotifyArtistType>;
	duration_ms: number;
	id: string;
	linked_from: SpotifyTrackType;
	name: string;
	uri: string;
};

export type SpotifyPlaylistType = {
	collaborative: boolean;
	id: string;
	images?: Array<{ url: string }>;
	name: string;
	owner: SpotifyUserType;
	snapshot_id?: string;
	tracks: {
		href: string;
	};
};

export type SpotifyPlaylistTrackType = {
	added_at: string;
	added_by: SpotifyUserType;
	is_local: boolean;
	index?: number;
	track: SpotifyTrackType | null;
};

export type SpotifySavedTrackType = {
	added_at: string;
	track: SpotifyTrackType | null;
};

export type SpotifyUserType = {
	display_name?: string;
	href: string;
	id: string;
	type: 'user';
	uri: string;
};
