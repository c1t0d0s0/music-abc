<template>
	<div class="volume" role="group" :aria-label="t.score.volume">
		<button
			type="button"
			class="mute"
			:aria-label="silent ? t.score.unmute : t.score.mute"
			:title="silent ? t.score.unmute : t.score.mute"
			:aria-pressed="muted"
			@click="toggleMute"
		>
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
				<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
				<template v-if="silent">
					<path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
				</template>
				<template v-else>
					<path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
					<path
						v-if="volume > 0.5"
						d="M18 7a7 7 0 0 1 0 10"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						fill="none"
					/>
				</template>
			</svg>
		</button>
		<input
			type="range"
			min="0"
			max="100"
			step="1"
			:value="muted ? 0 : Math.round(volume * 100)"
			:aria-label="t.score.volume"
			:aria-valuetext="`${muted ? 0 : Math.round(volume * 100)}%`"
			@input="onInput"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { t } from "../i18n";
import { muted, volume } from "../lib/master-volume";

const silent = computed(() => muted.value || volume.value === 0);

function toggleMute() {
	// 音量 0 のときにボタンを押したら、聞こえる音量に戻す
	if (!muted.value && volume.value === 0) {
		volume.value = 0.8;
		return;
	}
	muted.value = !muted.value;
}

function onInput(ev: Event) {
	volume.value = Number((ev.target as HTMLInputElement).value) / 100;
	muted.value = false;
}
</script>

<style scoped>
.volume {
	display: flex;
	align-items: center;
	gap: 4px;
	flex: 0 0 auto;
	color: var(--accent-ink);
}

.mute {
	display: grid;
	place-items: center;
	width: 32px;
	height: 32px;
	padding: 0;
	border: none;
	border-radius: 50%;
	background: transparent;
	color: inherit;
	cursor: pointer;
}

.mute:hover {
	background: rgba(255, 255, 255, 0.15);
}

input[type="range"] {
	width: 88px;
	accent-color: #c98a2b;
	cursor: pointer;
}

/* スマートフォンでは再生バーが狭くなるので、スライダーを隠してミュートボタンだけにする（音量は端末のボタンで調整できる） */
@media (max-width: 480px) {
	input[type="range"] {
		display: none;
	}
}
</style>
