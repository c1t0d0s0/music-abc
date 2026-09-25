<template>
	<div class="downloads no-print">
		<div class="btn-group" role="group" :aria-label="t.download.group">
			<button type="button" class="btn" @click="run('midi')"><ToolIcon name="midi" />MIDI</button>
			<button type="button" class="btn" :disabled="busy === 'wav'" @click="run('wav')">
				<ToolIcon name="wav" />{{ busy === "wav" ? t.download.wavBusy : "WAV" }}
			</button>
			<button type="button" class="btn" @click="run('abc')"><ToolIcon name="abc" />ABC</button>
			<button type="button" class="btn" @click="print"><ToolIcon name="print" />{{ t.download.print }}</button>
		</div>
		<p v-if="error" class="error" role="alert">{{ error }}</p>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { t } from "../i18n";
import { downloadAbc, downloadMidi, downloadWav } from "../lib/abc-utils";
import ToolIcon from "./ToolIcon.vue";

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
		error.value = t.download.error(e instanceof Error ? e.message : String(e));
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

/* スマートフォンでは 4 つのボタンを横幅いっぱいに均等に並べる */
@media (max-width: 560px) {
	.downloads,
	.btn-group {
		width: 100%;
	}
	.btn-group > .btn {
		flex: 1 1 0;
		padding: 0 6px;
	}
}

.error {
	flex-basis: 100%;
	margin: 0;
	color: var(--highlight);
	font-size: 0.88rem;
}
</style>
