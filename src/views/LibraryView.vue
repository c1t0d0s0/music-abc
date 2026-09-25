<template>
	<div class="container">
		<section class="intro">
			<h1>{{ t.library.heading }}</h1>
			<p>
				{{ t.library.introBefore }}<a href="https://abcnotation.com/" rel="noopener">{{ t.library.abcNotation }}</a
				>{{ t.library.introAfter }}
			</p>
			<div class="search">
				<label for="q" class="visually-hidden">{{ t.library.searchLabel }}</label>
				<input id="q" v-model="query" type="search" :placeholder="t.library.searchPlaceholder" />
			</div>
		</section>

		<section v-for="group in groups" :key="group.category" class="group" :aria-labelledby="`h-${group.category}`">
			<h2 :id="`h-${group.category}`">{{ t.categories[group.category].title }}</h2>
			<p class="group-desc">{{ t.categories[group.category].description }}</p>
			<ul class="cards">
				<li v-for="song in group.songs" :key="song.id">
					<RouterLink :to="`/song/${song.id}`" class="card">
						<span class="title">{{ tr(song.title) }}</span>
						<span v-if="cardSub(song)" class="sub">{{ cardSub(song) }}</span>
						<span class="creators">{{ creatorsText(song) }}</span>
						<span class="chips">
							<span class="chip">{{ t.library.year(song.published) }}</span>
							<span class="chip">{{ t.lyrics[song.lyrics] }}</span>
						</span>
					</RouterLink>
				</li>
			</ul>
		</section>

		<p v-if="groups.length === 0" class="empty">{{ t.library.noResults(query) }}</p>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { t, tr } from "../i18n";
import { groupSongs, type Song } from "../lib/songs";

const query = ref("");

function cardSub(song: Song) {
	return (song.country && tr(song.country)) || (song.subtitle && tr(song.subtitle)) || "";
}

function creatorsText(song: Song) {
	return song.creators.map((c) => tr(c.name)).join(" / ");
}

const groups = computed(() => groupSongs(query.value));
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

.card:active {
	border-color: var(--accent);
}

/* タッチ端末ではタップ後にホバー表示が残るので、ホバーできる端末だけで浮かせる */
@media (hover: hover) {
	.card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 10px rgba(31, 42, 38, 0.08);
	}
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
