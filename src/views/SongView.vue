<template>
	<div v-if="song" class="container">
		<nav class="crumbs no-print" :aria-label="t.song.breadcrumb">
			<RouterLink to="/">{{ t.nav.library }}</RouterLink>
			<span aria-hidden="true">›</span>
			<span>{{ t.categories[song.category].title }}</span>
		</nav>

		<header class="head">
			<h1>{{ tr(song.title) }}</h1>
			<p v-if="subline" class="sub">{{ subline }}</p>
		</header>

		<dl class="meta">
			<template v-for="c in song.creators" :key="c.role + tr(c.name)">
				<dt>{{ t.roles[c.role] }}</dt>
				<dd>
					{{ tr(c.name) }}<span v-if="c.died" class="years">{{ t.song.years(c.born, c.died) }}</span>
				</dd>
			</template>
			<dt>{{ t.about.thLyrics }}</dt>
			<dd>{{ t.about.lyricsTable[song.lyrics] }}</dd>
			<dt>{{ t.song.published }}</dt>
			<dd>{{ t.library.year(song.published) }}</dd>
			<dt>{{ t.song.rights }}</dt>
			<dd>
				<span class="chip pd">{{ t.song.publicDomain }}</span>
			</dd>
		</dl>
		<p v-if="song.note" class="note">{{ tr(song.note) }}</p>

		<div class="toolbar no-print">
			<label class="transpose">
				<span>{{ t.song.transpose }}</span>
				<select v-model.number="transpose">
					<option v-for="n in TRANSPOSE_STEPS" :key="n" :value="n">
						{{ n === 0 ? t.song.original : t.song.semitones(n) }}
					</option>
				</select>
			</label>
			<DownloadButtons :abc="abc" :filename="song.id" :transpose="transpose" />
			<RouterLink class="btn primary" :to="{ path: '/editor', query: { song: song.id } }"
				><ToolIcon name="edit" />{{ t.song.openInEditor }}</RouterLink
			>
		</div>

		<ScoreView :abc="abc" :transpose="transpose" />

		<p class="hint no-print">{{ t.song.hint }}</p>

		<details class="source no-print">
			<summary>{{ t.song.viewSource }}</summary>
			<pre>{{ abc }}</pre>
		</details>

		<nav class="pager no-print" :aria-label="t.song.pager">
			<RouterLink v-if="prev" :to="`/song/${prev.id}`" class="btn">‹ {{ tr(prev.title) }}</RouterLink>
			<span v-else></span>
			<RouterLink v-if="next" :to="`/song/${next.id}`" class="btn">{{ tr(next.title) }} ›</RouterLink>
		</nav>
	</div>
	<div v-else class="container">
		<h1>{{ t.song.notFound }}</h1>
		<p>
			<RouterLink to="/">{{ t.song.backToList }}</RouterLink>
		</p>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import DownloadButtons from "../components/DownloadButtons.vue";
import ScoreView from "../components/ScoreView.vue";
import ToolIcon from "../components/ToolIcon.vue";
import { t, tr } from "../i18n";
import { findSong, localizedAbc, songs } from "../lib/songs";

const props = defineProps<{ id: string }>();

const TRANSPOSE_STEPS = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

const song = computed(() => findSong(props.id));
const abc = computed(() => (song.value ? localizedAbc(song.value) : ""));
const subline = computed(() => {
	const s = song.value;
	if (!s) return "";
	return [s.subtitle && tr(s.subtitle), s.country && tr(s.country)].filter(Boolean).join(" ・ ");
});
const index = computed(() => songs.findIndex((s) => s.id === props.id));
const prev = computed(() => songs[index.value - 1]);
const next = computed(() => songs[index.value + 1]);
const transpose = ref(0);

watch(
	song,
	(s) => {
		transpose.value = 0;
		if (s) document.title = `${tr(s.title)} | ${t.siteName}`;
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

/* 移調の選択もボタンと同じ質感にそろえる */
.transpose select {
	appearance: none;
	min-height: 38px;
	padding: 0 30px 0 12px;
	border: 1px solid #d6ccba;
	border-bottom-color: #bdb09a;
	border-radius: 8px;
	background:
		url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5l3 3 3-3' fill='none' stroke='%2355615c' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
			no-repeat right 10px center / 12px,
		linear-gradient(#fffefb, #f6f0e6);
	box-shadow:
		inset 0 1px 0 rgba(255, 255, 255, 0.9),
		0 1px 2px rgba(45, 74, 62, 0.08);
	color: var(--ink);
	font: inherit;
	font-size: 0.92rem;
	cursor: pointer;
}

.transpose select:hover {
	border-color: var(--accent);
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
