<template>
	<div v-if="song" class="container">
		<nav class="crumbs no-print" aria-label="パンくずリスト">
			<RouterLink to="/">曲をさがす</RouterLink>
			<span aria-hidden="true">›</span>
			<span>{{ CATEGORY_LABELS[song.category].title }}</span>
		</nav>

		<header class="head">
			<h1>{{ song.title }}</h1>
			<p v-if="song.subtitle || song.country" class="sub">
				{{ [song.subtitle, song.country].filter(Boolean).join(" ・ ") }}
			</p>
		</header>

		<dl class="meta">
			<template v-for="c in song.creators" :key="c.role + c.name">
				<dt>{{ c.role }}</dt>
				<dd>
					{{ c.name }}<span v-if="c.died" class="years">（{{ c.born ?? "?" }}–{{ c.died }}）</span>
				</dd>
			</template>
			<dt>発表</dt>
			<dd>{{ song.published }}年</dd>
			<dt>権利</dt>
			<dd><span class="chip pd">パブリックドメイン</span></dd>
		</dl>
		<p v-if="song.note" class="note">{{ song.note }}</p>

		<div class="toolbar no-print">
			<label class="transpose">
				<span>移調</span>
				<select v-model.number="transpose">
					<option v-for="n in TRANSPOSE_STEPS" :key="n" :value="n">
						{{ n === 0 ? "原調" : `${n > 0 ? "+" : "−"}${Math.abs(n)} 半音` }}
					</option>
				</select>
			</label>
			<DownloadButtons :abc="song.abc" :filename="song.id" :transpose="transpose" />
			<RouterLink class="btn primary" :to="{ path: '/editor', query: { song: song.id } }">エディタで開く</RouterLink>
		</div>

		<ScoreView :abc="song.abc" :transpose="transpose" />

		<p class="hint no-print">音符をクリックすると、その音だけを鳴らせます。再生バーの「%」でテンポを変えられます。</p>

		<details class="source no-print">
			<summary>ABC 記法のソースを見る</summary>
			<pre>{{ song.abc }}</pre>
		</details>

		<nav class="pager no-print" aria-label="前後の曲">
			<RouterLink v-if="prev" :to="`/song/${prev.id}`" class="btn">‹ {{ prev.title }}</RouterLink>
			<span v-else></span>
			<RouterLink v-if="next" :to="`/song/${next.id}`" class="btn">{{ next.title }} ›</RouterLink>
		</nav>
	</div>
	<div v-else class="container">
		<h1>曲が見つかりません</h1>
		<p><RouterLink to="/">曲の一覧に戻る</RouterLink></p>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import DownloadButtons from "../components/DownloadButtons.vue";
import ScoreView from "../components/ScoreView.vue";
import { findSong, songs } from "../lib/songs";
import { CATEGORY_LABELS } from "../songs/meta";

const props = defineProps<{ id: string }>();

const TRANSPOSE_STEPS = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

const song = computed(() => findSong(props.id));
const index = computed(() => songs.findIndex((s) => s.id === props.id));
const prev = computed(() => songs[index.value - 1]);
const next = computed(() => songs[index.value + 1]);
const transpose = ref(0);

watch(
	song,
	(s) => {
		transpose.value = 0;
		if (s) document.title = `${s.title} | ABC 譜面ライブラリ`;
	},
	{ immediate: true },
);
</script>

<style scoped>
.crumbs {
	display: flex;
	gap: 8px;
	padding-top: 16px;
	font-size: 0.85rem;
	color: var(--ink-soft);
}

.head h1 {
	margin: 12px 0 0;
	font-size: clamp(1.7rem, 5vw, 2.4rem);
}

.sub {
	margin: 0;
	color: var(--ink-soft);
}

.meta {
	display: grid;
	grid-template-columns: max-content 1fr;
	gap: 2px 16px;
	margin: 16px 0 8px;
	font-size: 0.92rem;
}

.meta dt {
	color: var(--ink-soft);
}

.meta dd {
	margin: 0;
}

.years {
	color: var(--ink-soft);
	font-size: 0.85em;
}

.pd {
	background: #dfe9e2;
	color: var(--accent);
}

.note {
	font-size: 0.88rem;
	color: var(--ink-soft);
	background: var(--chip);
	padding: 8px 12px;
	border-radius: 6px;
}

.toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 12px;
	margin: 20px 0 16px;
}

.transpose {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 0.9rem;
}

.transpose select {
	padding: 4px 8px;
	border-radius: 6px;
	border: 1px solid var(--line);
	background: #fff;
	font: inherit;
}

.hint {
	font-size: 0.82rem;
	color: var(--ink-soft);
}

.source summary {
	cursor: pointer;
	font-size: 0.9rem;
}

.source pre {
	background: #fff;
	border: 1px solid var(--line);
	border-radius: 6px;
	padding: 12px;
	overflow-x: auto;
	font-family: var(--font-mono);
	font-size: 0.82rem;
}

.pager {
	display: flex;
	justify-content: space-between;
	gap: 12px;
	margin-top: 32px;
}
</style>
