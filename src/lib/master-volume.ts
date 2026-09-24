/**
 * 再生音の音量（全体の音量）。
 *
 * abcjs は再生音を AudioContext の destination（スピーカー）に直接つなぐので、音量を変える手段がない。
 * そこで自前の AudioContext を作ってスピーカーの手前に GainNode をはさみ、
 * その AudioContext の destination が GainNode を指すようにしてから abcjs に登録する。
 * abcjs は登録済みの AudioContext をそのまま使うため、再生中でも音量を変えられる。
 * （WAV のダウンロードは別の経路で音を作るので、この音量の影響を受けない）
 */
import abcjs from "abcjs";
import { ref, watch } from "vue";

const STORAGE_KEY = "music-abc:volume";

function loadVolume(): number {
	try {
		const v = Number.parseFloat(localStorage.getItem(STORAGE_KEY) ?? "");
		return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
	} catch {
		return 1;
	}
}

/** 音量（0〜1）。このブラウザに保存し、次に開いたときも同じ音量にする */
export const volume = ref(loadVolume());
/** ミュート中か */
export const muted = ref(false);

let gain: GainNode | null = null;

/** スライダーの位置に対して音の大きさが自然に変わるよう、2乗して使う */
function targetGain() {
	return muted.value ? 0 : volume.value ** 2;
}

function applyGain() {
	if (!gain) return;
	// 急に変えるとプツッと鳴るので、少しだけなめらかに変える
	gain.gain.setTargetAtTime(targetGain(), gain.context.currentTime, 0.015);
}

/** 音量つきの AudioContext を作って abcjs に登録する（まだ作っていなければ） */
function ensureAudioContext() {
	if (gain) return;
	const AudioContextClass =
		window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	if (!AudioContextClass) return;
	const ctx = new AudioContextClass();
	gain = ctx.createGain();
	gain.gain.value = targetGain();
	gain.connect(ctx.destination);
	// abcjs が destination につなぐ音を、この GainNode に通す
	Object.defineProperty(ctx, "destination", { get: () => gain, configurable: true });
	abcjs.synth.registerAudioContext(ctx);
}

/**
 * アプリの起動時（abcjs が再生コントロールを作るより前）に呼ぶ。
 * abcjs は再生コントロールを作った時点で AudioContext を用意するので、それより先に音量つきのものを登録しておく。
 * （AudioContext は利用者が再生ボタンを押したときに abcjs が resume するまで音を出さない）
 */
export function installMasterVolume() {
	ensureAudioContext();

	watch([volume, muted], () => {
		applyGain();
		try {
			localStorage.setItem(STORAGE_KEY, String(volume.value));
		} catch {
			/* 保存できない環境では、このページを開いている間だけ有効 */
		}
	});
}
