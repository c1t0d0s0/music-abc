import abcjs, { type AbcVisualParams } from "abcjs";
import { t } from "../i18n";

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
	if (!bytes || bytes.length === 0) throw new Error(t.download.midiError);
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
	if (!visualObj) throw new Error(t.download.parseError);
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

/** これより狭い表示幅では、スマートフォン向けに小節を折り返して譜面を描く */
const NARROW_WIDTH = 600;

/**
 * 譜面を描く領域の幅に応じたレイアウト設定。
 * 広い画面では ABC どおりの改行で描き、狭い画面では五線の基準幅を画面幅に合わせて小節を自動で折り返す
 * （PC 用の幅のまま縮小すると、スマートフォンでは音符や歌詞が読めないほど小さくなるため）。
 */
export function scoreLayout(width: number): Pick<AbcVisualParams, "staffwidth" | "wrap"> {
	if (width >= NARROW_WIDTH) return { staffwidth: width > 800 ? 900 : 740 };
	return {
		// 画面幅より少し広めに描いて縮小表示し、音符の読みやすさと 1 行に入る小節数の釣り合いをとる
		staffwidth: Math.max(380, Math.round(width * 1.3)),
		wrap: { minSpacing: 1.5, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
	};
}

/** レイアウトの区分が変わるほど幅が変わったときだけ onChange を呼ぶ（画面の回転など） */
export function observeLayout(el: HTMLElement, onChange: () => void): () => void {
	let key = JSON.stringify(scoreLayout(el.clientWidth));
	let timer: ReturnType<typeof setTimeout> | undefined;
	const ro = new ResizeObserver(() => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const next = JSON.stringify(scoreLayout(el.clientWidth));
			if (next === key) return;
			key = next;
			onChange();
		}, 150);
	});
	ro.observe(el);
	return () => {
		clearTimeout(timer);
		ro.disconnect();
	};
}
