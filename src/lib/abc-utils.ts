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

/** 楽譜の中の文字（曲名・作者・歌詞・注記など）に使う書体。サイト全体と同じゴシック体 */
const SCORE_FONT_FAMILY = "Zen Kaku Gothic New, Hiragino Sans, Noto Sans JP, sans-serif";

/**
 * フォントが遅れて届いた回数。
 * abcjs は文字の大きさの測定結果を「文字列＋書体の指定」をキーにしてページを開いている間ずっと使い回すので、
 * フォントの読み込み前に測った値が残ってしまう。フォントが遅れて届いたら書体の指定の末尾に
 * 実在しない名前（見た目には影響しない）を足してキーを変え、新しいフォントで測り直させる。
 */
let fontGeneration = 0;

function scoreFont(): string {
	return `"${SCORE_FONT_FAMILY}${fontGeneration ? `, score-font-${fontGeneration}` : ""}"`;
}

/**
 * abcjs の書体の設定。abcjs は既定でセリフ体を使うので、ゴシック体を指定する。
 * CSS で表示だけを差し替えると、abcjs が配置の計算に使う文字の大きさと実際の大きさがずれ、
 * 行が重なることがあるため、abcjs 自身に書体を渡す。文字の大きさは abcjs の既定と同じ。
 */
export function scoreFontFormat(): Record<string, string> {
	const font = scoreFont();
	const f = (size: number, bold = false) => `${font} ${size}${bold ? " bold" : ""}`;
	return {
		titlefont: f(20),
		subtitlefont: f(16),
		composerfont: f(14),
		partsfont: f(15),
		tempofont: f(15, true),
		gchordfont: f(12),
		annotationfont: f(12),
		footerfont: f(12),
		headerfont: f(12),
		historyfont: f(16),
		infofont: f(14),
		measurefont: f(14),
		repeatfont: f(13),
		textfont: f(16),
		tripletfont: f(11),
		vocalfont: f(13, true),
		wordsfont: f(16),
		voicefont: f(13, true),
	};
}

/**
 * 楽譜に出てくる文字に必要な Web フォントを読み込む（最長 timeoutMs まで待つ）。
 * 待ちきれなかったときは loadedInTime が false になる。その場合は loaded が解決したとき（フォントが届いたとき）に描き直す。
 * abcjs は短い文字列の大きさを一度測ると使い回すので、フォントの読み込み前に描くと、
 * 読み込み後も誤った大きさのまま配置されてしまう。描く前に読み込んでおく。
 * 日本語の Web フォントは文字の範囲ごとに分かれているので、実際に使う文字を渡して必要な分だけ読み込む。
 */
export async function loadScoreFonts(
	abc: string,
	timeoutMs = 1500,
): Promise<{ loadedInTime: boolean; loaded: Promise<unknown> }> {
	const fonts = typeof document !== "undefined" ? document.fonts : undefined;
	if (!fonts?.load) return { loadedInTime: true, loaded: Promise.resolve() };
	const text = [...new Set(abc.replace(/\s+/g, ""))].join("") + "0123456789";
	const loaded = Promise.all(
		["400", "700"].map((weight) => fonts.load(`${weight} 16px "Zen Kaku Gothic New"`, text).catch(() => [])),
	);
	const loadedInTime = await Promise.race([
		loaded.then(() => true),
		new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
	]);
	if (loadedInTime) return { loadedInTime, loaded };
	// 待ちきれなかったフォントが届いたら、測り直させるために書体の指定を変える
	return {
		loadedInTime,
		loaded: loaded.then(() => {
			fontGeneration++;
		}),
	};
}
