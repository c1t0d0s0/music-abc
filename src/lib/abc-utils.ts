import abcjs from "abcjs";

/** ABC 文字列から最初の T: 行のタイトルを取り出す */
export function abcTitle(abc: string): string {
	const m = abc.match(/^T:\s*(.+)$/m);
	return m?.[1]?.trim() || "untitled";
}

/** ファイル名に使えない文字を置き換える。日本語はそのまま残す */
export function safeFilename(title: string): string {
	const s = title.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "");
	return s || "untitled";
}

function triggerDownload(href: string, filename: string) {
	const a = document.createElement("a");
	a.href = href;
	a.download = filename;
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

export function downloadAbc(abc: string, filename = safeFilename(abcTitle(abc))) {
	const url = URL.createObjectURL(new Blob([abc], { type: "text/vnd.abc;charset=utf-8" }));
	triggerDownload(url, `${filename}.abc`);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** ABC から標準 MIDI ファイルのバイト列を作る（複数曲ある場合は最初の曲） */
export function abcToMidiBytes(abc: string, transpose = 0): Uint8Array {
	const out = abcjs.synth.getMidiFile(abc, { midiOutputType: "binary", midiTranspose: transpose }) as
		| Uint8Array[]
		| Uint8Array;
	const bytes = Array.isArray(out) ? out[0] : out;
	if (!bytes || bytes.length === 0) throw new Error("MIDI を生成できませんでした");
	return bytes;
}

export function downloadMidi(abc: string, filename = safeFilename(abcTitle(abc)), transpose = 0) {
	const bytes = abcToMidiBytes(abc, transpose);
	const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "audio/midi" }));
	triggerDownload(url, `${filename}.mid`);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadWav(abc: string, filename = safeFilename(abcTitle(abc)), transpose = 0) {
	// 画面には描かず、解析結果だけを使う
	const visualObj = abcjs.renderAbc("*", abc, { visualTranspose: transpose })[0];
	if (!visualObj) throw new Error("ABC を解析できませんでした");
	const synth = new abcjs.synth.CreateSynth();
	await synth.init({ visualObj, options: { midiTranspose: transpose } });
	await synth.prime();
	const url = synth.download();
	triggerDownload(url, `${filename}.wav`);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** エディタに渡す ABC を保存する localStorage のキー */
export const EDITOR_STORAGE_KEY = "music-abc:editor";

export function storageGet(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function storageSet(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {
		/* プライベートモードなどで保存できない場合は無視する */
	}
}
