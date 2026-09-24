<template>
	<div class="downloads no-print" role="group" aria-label="ダウンロード">
		<button type="button" class="btn" @click="run('midi')">MIDI</button>
		<button type="button" class="btn" :disabled="busy === 'wav'" @click="run('wav')">
			{{ busy === "wav" ? "WAV を作成中…" : "WAV" }}
		</button>
		<button type="button" class="btn" @click="run('abc')">ABC</button>
		<button type="button" class="btn" @click="print">印刷</button>
		<p v-if="error" class="error" role="alert">{{ error }}</p>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { downloadAbc, downloadMidi, downloadWav } from "../lib/abc-utils";

const props = withDefaults(defineProps<{ abc: string; filename: string; transpose?: number }>(), { transpose: 0 });

const busy = ref<"" | "wav">("");
const error = ref("");

async function run(kind: "midi" | "wav" | "abc") {
	error.value = "";
	const name = props.transpose ? `${props.filename}_${props.transpose > 0 ? "+" : ""}${props.transpose}` : props.filename;
	try {
		if (kind === "midi") downloadMidi(props.abc, name, props.transpose);
		if (kind === "abc") downloadAbc(props.abc, props.filename);
		if (kind === "wav") {
			busy.value = "wav";
			await downloadWav(props.abc, name, props.transpose);
		}
	} catch (e) {
		error.value = `ダウンロードに失敗しました: ${e instanceof Error ? e.message : String(e)}`;
	} finally {
		busy.value = "";
	}
}

function print() {
	window.print();
}
</script>

<style scoped>
.downloads {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	align-items: center;
}

.error {
	flex-basis: 100%;
	margin: 0;
	color: var(--highlight);
	font-size: 0.88rem;
}
</style>
