import { lang, messagesFor, tr, type Lang } from "../i18n";
import { SONGS, type SongMeta } from "../songs/meta";

const sources = import.meta.glob<string>("../songs/**/*.abc", {
	query: "?raw",
	import: "default",
	eager: true,
});

export interface Song extends SongMeta {
	/** .abc ファイルの内容そのまま */
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

/** 作者の一覧を「役割: 名前 / 役割: 名前」の形にする */
export function creatorsLine(song: SongMeta, to: Lang = lang): string {
	const roles = messagesFor(to).roles;
	return song.creators.map((c) => `${roles[c.role]}: ${tr(c.name, to)}`).join(" / ");
}

/**
 * 表示する言語に合わせた ABC を返す。
 * .abc ファイルの見出し（T: C: S: N:）は日本語で書いてあるので、英語で表示するときは
 * メタデータから英語の見出しを作って差し替える。音符・歌詞・W: 行はそのまま。
 */
export function localizedAbc(song: Song, to: Lang = lang): string {
	if (to === "ja") return song.abc;
	const lines = song.abc.split("\n");
	const k = lines.findIndex((l) => l.startsWith("K:"));
	const header = lines.slice(0, k).filter((l) => !/^[TCSN]:/.test(l));
	const title = tr(song.title, to);
	const subtitle = song.subtitle ? tr(song.subtitle, to) : "";
	const country = song.country ? tr(song.country, to) : "";
	const added = [
		`T:${title}`,
		...(subtitle || country ? [`T:${[subtitle, country].filter(Boolean).join(", ")}`] : []),
		`C:${creatorsLine(song, to)}`,
	];
	// X: の直後に見出しを入れる
	const x = header.findIndex((l) => l.startsWith("X:"));
	header.splice(x + 1, 0, ...added);
	return [...header, ...lines.slice(k)].join("\n");
}
