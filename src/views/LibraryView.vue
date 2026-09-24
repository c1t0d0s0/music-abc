<template>
	<div class="container">
		<section class="intro">
			<h1>名曲を楽譜で見て聴いて編集する。</h1>
			<p>
				唱歌・各国の国歌・クラシックの名旋律を
				<a href="https://abcnotation.com/" rel="noopener">ABC 記法</a>で収録しています。
				曲を選ぶと楽譜の表示と再生ができ、MIDI や WAV でダウンロードしたり、エディタで書き換えたりできます。
			</p>
			<div class="search">
				<label for="q" class="visually-hidden">曲名・作者で検索</label>
				<input id="q" v-model="query" type="search" placeholder="曲名・作者で検索（例：滝廉太郎、国歌、Beethoven）" />
			</div>
		</section>

		<section v-for="group in groups" :key="group.category" class="group" :aria-labelledby="`h-${group.category}`">
			<h2 :id="`h-${group.category}`">{{ CATEGORY_LABELS[group.category].title }}</h2>
			<p class="group-desc">{{ CATEGORY_LABELS[group.category].description }}</p>
			<ul class="cards">
				<li v-for="song in group.songs" :key="song.id">
					<RouterLink :to="`/song/${song.id}`" class="card">
						<span class="title">{{ song.title }}</span>
						<span v-if="song.country || song.subtitle" class="sub">{{ song.country ?? song.subtitle }}</span>
						<span class="creators">{{ creatorsText(song) }}</span>
						<span class="chips">
							<span class="chip">{{ song.published }}年</span>
							<span class="chip">{{ LYRICS_LABEL[song.lyrics] }}</span>
						</span>
					</RouterLink>
				</li>
			</ul>
		</section>

		<p v-if="groups.length === 0" class="empty">「{{ query }}」に一致する曲はありません。</p>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { songs, type Song } from "../lib/songs";
import { CATEGORY_LABELS, type Category } from "../songs/meta";

const LYRICS_LABEL = { sung: "歌詞つき", text: "歌詞は本文", none: "旋律のみ" } as const;

const query = ref("");

function creatorsText(song: Song) {
	return song.creators.map((c) => c.name).join(" / ");
}

function matches(song: Song, q: string) {
	const hay = [
		song.title,
		song.subtitle,
		song.country,
		CATEGORY_LABELS[song.category].title,
		...song.creators.map((c) => c.name),
		song.abc.match(/^T:.*$/gm)?.join(" "),
	]
		.join(" ")
		.toLowerCase();
	return q
		.toLowerCase()
		.split(/\s+/)
		.every((w) => hay.includes(w));
}

const groups = computed(() => {
	const q = query.value.trim();
	const order: Category[] = ["school", "anthems", "classical-folk"];
	return order
		.map((category) => ({
			category,
			songs: songs.filter((s) => s.category === category && (!q || matches(s, q))),
		}))
		.filter((g) => g.songs.length > 0);
});
</script>

<style scoped>
.intro {
	padding: 32px 0 8px;
}

.intro h1 {
	font-size: clamp(1.5rem, 4.5vw, 2.3rem);
	margin: 0 0 12px;
}

.intro p {
	max-width: 44em;
	color: var(--ink-soft);
}

.search input {
	width: 100%;
	max-width: 560px;
	padding: 10px 16px;
	border: 1px solid var(--line);
	border-radius: 999px;
	background: #fff;
	font: inherit;
}

.visually-hidden {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip: rect(0 0 0 0);
}

.group {
	margin-top: 36px;
}

.group h2 {
	margin: 0;
	font-size: 1.4rem;
	border-bottom: 2px solid var(--accent);
	display: inline-block;
	padding-bottom: 2px;
}

.group-desc {
	margin: 6px 0 16px;
	color: var(--ink-soft);
	font-size: 0.9rem;
}

.cards {
	list-style: none;
	margin: 0;
	padding: 0;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 12px;
}

.card {
	display: flex;
	flex-direction: column;
	gap: 2px;
	height: 100%;
	padding: 14px 16px;
	background: var(--score);
	border: 1px solid var(--line);
	border-radius: 8px;
	color: inherit;
	text-decoration: none;
	transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}

.card:hover {
	border-color: var(--accent);
	transform: translateY(-2px);
	box-shadow: 0 4px 10px rgba(31, 42, 38, 0.08);
}

.title {
	font-family: var(--font-head);
	font-size: 1.15rem;
	font-weight: 600;
}

.sub {
	color: var(--ink-soft);
	font-size: 0.85rem;
}

.creators {
	font-size: 0.82rem;
	color: var(--ink-soft);
	margin-top: 4px;
}

.chips {
	display: flex;
	gap: 6px;
	margin-top: auto;
	padding-top: 8px;
}

.empty {
	margin-top: 32px;
	color: var(--ink-soft);
}
</style>
