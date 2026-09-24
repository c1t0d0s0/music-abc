<template>
	<div class="score-view">
		<div v-show="audioSupported" class="player no-print">
			<div ref="audioEl" class="audio" :aria-label="t.score.controls"></div>
			<VolumeControl />
		</div>
		<p v-if="audioMessage" class="audio-message no-print" role="status">{{ audioMessage }}</p>
		<div ref="paperEl" class="score-paper"></div>
	</div>
</template>

<script setup lang="ts">
import abcjs, { type AbcElem, type SynthObjectController, type TuneObject } from "abcjs";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { t } from "../i18n";
import { loadScoreFonts, observeLayout, scoreFontFormat, scoreLayout } from "../lib/abc-utils";
import { CursorControl } from "../lib/cursor-control";
import VolumeControl from "./VolumeControl.vue";

const props = withDefaults(defineProps<{ abc: string; transpose?: number }>(), { transpose: 0 });

const paperEl = ref<HTMLElement>();
const audioEl = ref<HTMLElement>();
const audioMessage = ref("");

let stopObserving: (() => void) | undefined;
/** 描画の要求ごとに増やす。フォントの読み込みを待つ間に新しい要求が来たら、古い要求は描かない */
let renderSeq = 0;
let synthControl: SynthObjectController | null = null;
let visualObj: TuneObject | null = null;
const cursor = new CursorControl(() => paperEl.value ?? null);

function clickListener(abcElem: AbcElem) {
	// 音符をクリックしたらその音を鳴らす（abcjs-editor の AbcEditor.vue と同じ方法）
	if (!abcElem.midiPitches || !visualObj) return;
	abcjs.synth
		.playEvent(abcElem.midiPitches, abcElem.midiGraceNotePitches ?? [], visualObj.millisecondsPerMeasure())
		.catch(() => {});
}

const SYNTH_OPTIONS = {
	displayLoop: true,
	displayRestart: true,
	displayPlay: true,
	displayProgress: true,
	displayWarp: true,
};

/** 再生を止め、再生位置のタイマーと音声データを捨てる（destroy は abcjs の型定義にないが実装されている） */
function destroySynth() {
	try {
		(synthControl as (SynthObjectController & { destroy?: () => void }) | null)?.destroy?.();
	} catch {
		/* 未再生なら何もしない */
	}
	synthControl = null;
}

/**
 * 再生コントロールを作り直す。
 * SynthController.setTune は一度再生した後のタイマーと音声データを捨てないため、
 * 曲や移調を変えたのに前の曲のまま鳴ってしまう。曲を差し替えるたびに作り直す。
 */
function createSynth() {
	destroySynth();
	if (!audioEl.value) return;
	synthControl = new abcjs.synth.SynthController();
	synthControl.load(audioEl.value, cursor, SYNTH_OPTIONS);
}

async function render() {
	const seq = ++renderSeq;
	// 楽譜の文字の大きさを正しく測れるよう、描く前に必要なフォントを読み込む
	const fonts = await loadScoreFonts(props.abc);
	if (seq !== renderSeq || !paperEl.value) return;
	// 待ちきれなかったフォントが届いたら描き直す（再生中は止めないよう描き直さない）
	if (!fonts.loadedInTime) {
		void fonts.loaded.then(() => {
			if (seq === renderSeq && !isPlaying()) render();
		});
	}
	visualObj =
		abcjs.renderAbc(paperEl.value, props.abc, {
			responsive: "resize",
			format: scoreFontFormat(),
			// 広い画面では五線の基準幅を広めにとり、スマートフォンでは小節を折り返す
			...scoreLayout(paperEl.value.clientWidth),
			add_classes: true,
			oneSvgPerLine: true,
			visualTranspose: props.transpose,
			clickListener,
		})[0] ?? null;
	if (!audioSupported || !visualObj) return;
	createSynth();
	if (!synthControl) return;
	try {
		// visualTranspose した譜面から音を作るときは、同じ値を midiTranspose に渡すと表示どおりの高さで鳴る
		await synthControl.setTune(visualObj, false, { midiTranspose: props.transpose });
		audioMessage.value = "";
	} catch (e) {
		audioMessage.value = t.score.audioError(e instanceof Error ? e.message : String(e));
	}
}

const audioSupported = abcjs.synth.supportsAudio();

onMounted(() => {
	if (!audioSupported) audioMessage.value = t.score.noAudio;
	render();
	if (paperEl.value) stopObserving = observeLayout(paperEl.value, render);
});

/** abcjs の再生ボタンが押された状態（再生中）か */
function isPlaying() {
	return !!audioEl.value?.querySelector(".abcjs-midi-start.abcjs-pushed");
}

watch(() => [props.abc, props.transpose], render);

onBeforeUnmount(() => {
	stopObserving?.();
	renderSeq++;
	destroySynth();
});
</script>

<style scoped>
.player {
	position: sticky;
	top: 0;
	z-index: 2;
	margin-bottom: 12px;
}

.audio-message {
	color: var(--highlight);
	font-size: 0.9rem;
}

.score-paper {
	background: var(--score);
	border: 1px solid var(--line);
	border-radius: 6px;
	padding: 12px 8px;
	box-shadow: 0 1px 2px rgba(31, 42, 38, 0.06);
	color: #111;
}
</style>
