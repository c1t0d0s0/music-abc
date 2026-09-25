<!--
	収録曲を選ぶポップアップ。
	ブラウザ標準のプルダウンは一覧の見た目を変えられないので、カテゴリ見出しと絞り込み欄つきの一覧を自前で出す。
	キーボード: ボタンで ↓ / Enter / Space → 開く、入力欄で ↑↓ → 選択、Enter → 決定、Esc → 閉じる
-->
<template>
	<div ref="root" class="song-picker" @focusout="onFocusOut">
		<button
			ref="trigger"
			type="button"
			class="btn picker-trigger"
			aria-haspopup="dialog"
			:aria-expanded="open"
			:aria-controls="panelId"
			@click="toggle"
			@keydown.down.prevent="openPanel"
		>
			<ToolIcon name="library" />
			<span class="trigger-label">{{ t.editor.loadSong }}</span>
			<svg class="chevron" :class="{ flipped: open }" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
				<path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		<div v-if="open" :id="panelId" class="picker-panel" role="dialog" :aria-label="t.editor.loadSongLabel" @keydown.esc.prevent.stop="close(true)">
			<div class="picker-search">
				<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
					<circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6" />
					<path d="M13 13l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
				</svg>
				<input
					ref="input"
					v-model="query"
					type="search"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded="true"
					:aria-controls="listId"
					:aria-activedescendant="activeId || undefined"
					:aria-label="t.editor.filterSongs"
					:placeholder="t.editor.filterSongs"
					autocomplete="off"
					spellcheck="false"
					@keydown="onKey"
				/>
			</div>

			<div :id="listId" class="picker-list" role="listbox" :aria-label="t.editor.loadSongLabel">
				<div v-for="g in groups" :key="g.category" role="group" :aria-labelledby="`${listId}-${g.category}`">
					<div :id="`${listId}-${g.category}`" class="picker-group" role="presentation">
						{{ t.categories[g.category].title }}
					</div>
					<div
						v-for="s in g.songs"
						:id="optionId(s.id)"
						:key="s.id"
						role="option"
						class="picker-option"
						:class="{ active: s.id === activeSongId }"
						:aria-selected="s.id === activeSongId"
						@mousemove="activeSongId = s.id"
						@click="choose(s.id)"
					>
						<span class="option-title">{{ tr(s.title) }}</span>
						<span class="option-sub">{{ subLine(s) }}</span>
					</div>
				</div>
				<p v-if="flat.length === 0" class="picker-empty">{{ t.editor.noSongMatch(query.trim()) }}</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
let pickerCount = 0;
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { t, tr } from "../i18n";
import { groupSongs, type Song } from "../lib/songs";
import ToolIcon from "./ToolIcon.vue";

const emit = defineEmits<{ (e: "select", id: string): void }>();

const uid = ++pickerCount;
const panelId = `song-picker-${uid}`;
const listId = `song-picker-list-${uid}`;
const optionId = (id: string) => `${listId}-${id}`;

const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const input = ref<HTMLInputElement>();

const open = ref(false);
const query = ref("");
const activeSongId = ref("");

const groups = computed(() => groupSongs(query.value));
const flat = computed(() => groups.value.flatMap((g) => g.songs));
const activeId = computed(() => (activeSongId.value ? optionId(activeSongId.value) : ""));

/** 一覧の 2 行目: 国（国歌）→ 副題 → 作者の順に、ある方を出す */
function subLine(song: Song) {
	const parts = [song.country && tr(song.country), song.subtitle && tr(song.subtitle)].filter(Boolean);
	return parts[0] || song.creators.map((c) => tr(c.name)).join(" / ");
}

// 絞り込みで今の選択が消えたら、先頭の曲を選ぶ
watch(flat, (list) => {
	if (!list.some((s) => s.id === activeSongId.value)) activeSongId.value = list[0]?.id ?? "";
});

function scrollActiveIntoView() {
	nextTick(() => {
		const el = activeId.value ? document.getElementById(activeId.value) : null;
		el?.scrollIntoView({ block: "nearest" });
	});
}

async function openPanel() {
	if (open.value) return;
	query.value = "";
	activeSongId.value = flat.value[0]?.id ?? "";
	open.value = true;
	document.addEventListener("pointerdown", onPointerDownOutside, true);
	await nextTick();
	input.value?.focus();
}

function close(returnFocus = false) {
	if (!open.value) return;
	open.value = false;
	document.removeEventListener("pointerdown", onPointerDownOutside, true);
	if (returnFocus) trigger.value?.focus();
}

function toggle() {
	if (open.value) close(true);
	else openPanel();
}

function choose(id: string) {
	close(true);
	emit("select", id);
}

function move(delta: number) {
	const items = flat.value;
	if (items.length === 0) return;
	const i = items.findIndex((s) => s.id === activeSongId.value);
	const next = i < 0 ? 0 : Math.min(items.length - 1, Math.max(0, i + delta));
	activeSongId.value = items[next]!.id;
	scrollActiveIntoView();
}

function onKey(ev: KeyboardEvent) {
	switch (ev.key) {
		case "ArrowDown":
			ev.preventDefault();
			move(1);
			break;
		case "ArrowUp":
			ev.preventDefault();
			move(-1);
			break;
		case "PageDown":
			ev.preventDefault();
			move(8);
			break;
		case "PageUp":
			ev.preventDefault();
			move(-8);
			break;
		case "Enter":
			ev.preventDefault();
			if (activeSongId.value) choose(activeSongId.value);
			break;
	}
}

function onPointerDownOutside(ev: PointerEvent) {
	if (root.value && !root.value.contains(ev.target as Node)) close();
}

/** Tab などでフォーカスが外に出たら閉じる */
function onFocusOut(ev: FocusEvent) {
	const next = ev.relatedTarget as Node | null;
	if (open.value && next && root.value && !root.value.contains(next)) close();
}

onBeforeUnmount(() => document.removeEventListener("pointerdown", onPointerDownOutside, true));
</script>

<style scoped>
.song-picker {
	position: relative;
}

.picker-trigger {
	padding-right: 12px;
}

.chevron {
	margin-left: 6px;
	color: var(--ink-soft);
	transition: transform 0.15s;
}

.chevron.flipped {
	transform: rotate(180deg);
}

/* 紙の上に一枚重ねたパネル */
.picker-panel {
	position: absolute;
	top: calc(100% + 6px);
	left: 0;
	z-index: 20;
	display: flex;
	flex-direction: column;
	width: min(400px, calc(100vw - 32px));
	max-height: min(460px, 65vh);
	border: 1px solid var(--line);
	border-radius: 12px;
	background: #fffdf9;
	box-shadow:
		0 14px 36px rgba(31, 42, 38, 0.18),
		0 2px 6px rgba(31, 42, 38, 0.08);
	overflow: hidden;
	transform-origin: top left;
	animation: picker-in 0.14s ease-out;
}

@keyframes picker-in {
	from {
		opacity: 0;
		transform: translateY(-4px) scale(0.98);
	}
}

.picker-search {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 12px;
	border-bottom: 1px solid var(--line);
	color: var(--ink-soft);
}

.picker-search input {
	flex: 1;
	min-width: 0;
	padding: 6px 2px;
	border: none;
	background: transparent;
	color: var(--ink);
	font: inherit;
	font-size: 0.95rem;
}

.picker-search input:focus {
	outline: none;
}

.picker-search:focus-within {
	box-shadow: inset 0 -2px 0 var(--focus);
}

.picker-list {
	overflow-y: auto;
	overscroll-behavior: contain;
	padding: 4px 6px 8px;
}

.picker-group {
	position: sticky;
	top: -4px;
	z-index: 1;
	margin: 0 -6px;
	padding: 10px 18px 4px;
	background: #fffdf9;
	color: var(--accent);
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.04em;
}

.picker-option {
	display: flex;
	flex-direction: column;
	gap: 1px;
	padding: 7px 12px;
	border-radius: 8px;
	cursor: pointer;
}

.picker-option.active {
	background: #edf2ee;
	box-shadow: inset 3px 0 0 var(--accent);
}

.option-title {
	color: var(--ink);
	font-size: 0.95rem;
}

.option-sub {
	overflow: hidden;
	color: var(--ink-soft);
	font-size: 0.78rem;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.picker-empty {
	margin: 16px 12px;
	color: var(--ink-soft);
	font-size: 0.9rem;
}

@media (max-width: 560px) {
	.song-picker,
	.picker-trigger {
		width: 100%;
	}
	.trigger-label {
		flex: 1;
		text-align: left;
	}
	.picker-panel {
		width: 100%;
	}
}

@media (prefers-reduced-motion: reduce) {
	.picker-panel {
		animation: none;
	}
	.chevron {
		transition: none;
	}
}
</style>
