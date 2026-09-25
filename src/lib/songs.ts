import { lang, messagesFor, tr, type Lang, type Localized } from "../i18n";
import { SONGS, type Category, type SongMeta } from "../songs/meta";

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

/** 表示中の言語にかかわらず、日本語・英語どちらの表記でも検索できるようにする */
function bothLanguages(text: Localized | string | undefined): string {
	if (!text) return "";
	return typeof text === "string" ? text : `${text.ja} ${text.en}`;
}

/** 曲名・副題・国・カテゴリ・作者・楽譜の曲名のどれかに、空白で区切った語がすべて含まれるか */
export function songMatches(song: Song, query: string): boolean {
	const hay = [
		bothLanguages(song.title),
		bothLanguages(song.subtitle),
		bothLanguages(song.country),
		messagesFor("ja").categories[song.category].title,
		messagesFor("en").categories[song.category].title,
		...song.creators.map((c) => bothLanguages(c.name)),
		song.abc.match(/^T:.*$/gm)?.join(" "),
	]
		.join(" ")
		.toLowerCase();
	return query
		.toLowerCase()
		.split(/\s+/)
		.every((w) => hay.includes(w));
}

export const CATEGORY_ORDER: Category[] = ["school", "anthems", "classical-folk"];

/** カテゴリごとにまとめた曲の一覧（絞り込みの語があれば一致する曲だけ）。空のカテゴリは含めない */
export function groupSongs(query = ""): { category: Category; songs: Song[] }[] {
	const q = query.trim();
	return CATEGORY_ORDER.map((category) => ({
		category,
		songs: songs.filter((s) => s.category === category && (!q || songMatches(s, q))),
	})).filter((g) => g.songs.length > 0);
}
