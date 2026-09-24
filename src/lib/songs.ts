import { SONGS, type SongMeta } from "../songs/meta";

const sources = import.meta.glob<string>("../songs/**/*.abc", {
	query: "?raw",
	import: "default",
	eager: true,
});

export interface Song extends SongMeta {
	abc: string;
}

const abcById = new Map<string, string>();
for (const [path, abc] of Object.entries(sources)) {
	const id = path.replace(/^.*\//, "").replace(/\.abc$/, "");
	abcById.set(id, abc);
}

export const songs: Song[] = SONGS.flatMap((meta) => {
	const abc = abcById.get(meta.id);
	return abc ? [{ ...meta, abc }] : [];
});

export function findSong(id: string): Song | undefined {
	return songs.find((s) => s.id === id);
}

/** meta.ts に登録されていない .abc ファイル（テスト用） */
export const unregisteredAbcIds = [...abcById.keys()].filter((id) => !SONGS.some((s) => s.id === id));
