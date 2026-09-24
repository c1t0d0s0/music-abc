<template>
	<div class="score-view">
		<div ref="audioEl" class="audio no-print" :aria-label="t.score.controls"></div>
		<p v-if="audioMessage" class="audio-message no-print" role="status">{{ audioMessage }}</p>
		<div ref="paperEl" class="score-paper"></div>
	</div>
</template>

<script setup lang="ts">
import abcjs, { type AbcElem, type SynthObjectController, type TuneObject } from "abcjs";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { t } from "../i18n";
import { observeLayout, scoreLayout } from "../lib/abc-utils";
import { CursorControl } from "../lib/cursor-control";

const props = withDefaults(defineProps<{ abc: string; transpose?: number }>(), { transpose: 0 });

const paperEl = ref<HTMLElement>();
const audioEl = ref<HTMLElement>();
const audioMessage = ref("");

let stopObserving: (() => void) | undefined;
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

async function render() {
	if (!paperEl.value) return;
	visualObj =
		abcjs.renderAbc(paperEl.value, props.abc, {
			responsive: "resize",
			// 広い画面では五線の基準幅を広めにとり、スマートフォンでは小節を折り返す
			...scoreLayout(paperEl.value.clientWidth),
			add_classes: true,
			oneSvgPerLine: true,
			visualTranspose: props.transpose,
			clickListener,
		})[0] ?? null;
	if (!synthControl || !visualObj) return;
	try {
		// visualTranspose した譜面から音を作るときは、同じ値を midiTranspose に渡すと表示どおりの高さで鳴る
		await synthControl.setTune(visualObj, false, { midiTranspose: props.transpose });
		audioMessage.value = "";
	} catch (e) {
		audioMessage.value = t.score.audioError(e instanceof Error ? e.message : String(e));
	}
}

onMounted(() => {
	if (abcjs.synth.supportsAudio() && audioEl.value) {
		synthControl = new abcjs.synth.SynthController();
		synthControl.load(audioEl.value, cursor, {
			displayLoop: true,
			displayRestart: true,
			displayPlay: true,
			displayProgress: true,
			displayWarp: true,
		});
	} else {
		audioMessage.value = t.score.noAudio;
	}
	render();
	if (paperEl.value) stopObserving = observeLayout(paperEl.value, render);
});

watch(() => [props.abc, props.transpose], render);

onBeforeUnmount(() => {
	stopObserving?.();
	try {
		synthControl?.pause();
	} catch {
		/* 未再生なら何もしない */
	}
});
</script>

<style scoped>
.audio {
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

.audio :deep(.abcjs-inline-audio) {
	background: var(--accent);
	border-radius: 999px;
	height: 40px;
	padding: 4px 12px;
}

.audio :deep(.abcjs-inline-audio .abcjs-btn) {
	border-radius: 50%;
}
</style>
