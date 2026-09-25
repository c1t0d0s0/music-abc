<!--
	声部の音色を選ぶ。ABC の入力欄の上に置くボタンと、種類ごとに見出しを付けた一覧。
	選んだ音色は親が ABC の %%MIDI program として書き込む。
	キーボード: ボタンで ↓ / Enter / Space → 開く、一覧で ↑↓ Home End → 選択、Enter / Space → 決定、Esc → 閉じる
-->
<template>
	<div ref="root" class="instrument-picker" @focusout="onFocusOut">
		<button
			ref="trigger"
			type="button"
			class="picker-trigger"
			aria-haspopup="listbox"
			:aria-expanded="open"
			:aria-controls="listId"
			:aria-label="triggerLabel"
			:title="triggerLabel"
			@click="toggle"
			@keydown.down.prevent="openPanel"
		>
			<span v-if="label" class="trigger-voice">{{ label }}</span>
			<span class="trigger-label">{{ tr(current.name) }}</span>
			<svg class="chevron" :class="{ flipped: open }" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
				<path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		<div v-if="open" class="picker-panel" :class="{ 'align-right': alignRight }">
			<div
				:id="listId"
				ref="list"
				class="picker-list"
				role="listbox"
				tabindex="-1"
				:aria-label="t.score.instrument"
				:aria-activedescendant="optionId(active)"
				@keydown="onKey"
			>
				<div v-for="(g, gi) in INSTRUMENT_GROUPS" :key="gi" role="group" :aria-labelledby="`${listId}-g${gi}`">
					<div :id="`${listId}-g${gi}`" class="picker-group" role="presentation">{{ tr(g.title) }}</div>
					<div
						v-for="ins in g.instruments"
						:id="optionId(ins.program)"
						:key="ins.program"
						role="option"
						class="picker-option"
						:class="{ active: ins.program === active, chosen: ins.program === current.program }"
						:aria-selected="ins.program === current.program"
						@mousemove="active = ins.program"
						@click="choose(ins.program)"
					>
						<span>{{ tr(ins.name) }}</span>
						<svg v-if="ins.program === current.program" class="check" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
							<path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</div>
				</div>
			</div>
			<p class="picker-note">{{ t.score.instrumentNote }}</p>
		</div>
	</div>
</template>

<script lang="ts">
let pickerCount = 0;
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { t, tr } from "../i18n";
import { findInstrument, INSTRUMENT_GROUPS, INSTRUMENTS } from "../lib/instruments";

const props = defineProps<{
	/** 音色（General MIDI の番号）。null は指定なし（abcjs の既定のピアノで鳴る） */
	modelValue: number | null;
	/** 声部の名前。声部のない曲では付けない */
	label?: string;
}>();
const emit = defineEmits<{ (e: "update:modelValue", program: number): void }>();

const PANEL_WIDTH = 260;
const listId = `instrument-list-${++pickerCount}`;
const optionId = (program: number) => `${listId}-${program}`;

const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const list = ref<HTMLElement>();
const open = ref(false);
const current = computed(() => findInstrument(props.modelValue ?? 0));
const active = ref(current.value.program);
/** 画面の右端からはみ出すときは、一覧をボタンの右端にそろえて開く */
const alignRight = ref(false);
const triggerLabel = computed(() =>
	[props.label, `${t.score.instrument}: ${tr(current.value.name)}`].filter(Boolean).join(" "),
);

function scrollActiveIntoView() {
	nextTick(() => document.getElementById(optionId(active.value))?.scrollIntoView({ block: "nearest" }));
}

async function openPanel() {
	if (open.value) return;
	active.value = current.value.program;
	const rect = root.value?.getBoundingClientRect();
	alignRight.value = !!rect && rect.left + PANEL_WIDTH > document.documentElement.clientWidth - 8;
	open.value = true;
	document.addEventListener("pointerdown", onPointerDownOutside, true);
	await nextTick();
	list.value?.focus();
	scrollActiveIntoView();
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

function choose(program: number) {
	close(true);
	if (program !== props.modelValue) emit("update:modelValue", program);
}

function moveTo(index: number) {
	const i = Math.min(INSTRUMENTS.length - 1, Math.max(0, index));
	active.value = INSTRUMENTS[i]!.program;
	scrollActiveIntoView();
}

function onKey(ev: KeyboardEvent) {
	const i = INSTRUMENTS.findIndex((x) => x.program === active.value);
	switch (ev.key) {
		case "ArrowDown":
			moveTo(i + 1);
			break;
		case "ArrowUp":
			moveTo(i - 1);
			break;
		case "Home":
			moveTo(0);
			break;
		case "End":
			moveTo(INSTRUMENTS.length - 1);
			break;
		case "Enter":
		case " ":
			choose(active.value);
			break;
		case "Escape":
			close(true);
			break;
		default:
			return;
	}
	ev.preventDefault();
}

function onPointerDownOutside(ev: PointerEvent) {
	if (root.value && !root.value.contains(ev.target as Node)) close();
}

function onFocusOut(ev: FocusEvent) {
	const next = ev.relatedTarget as Node | null;
	if (open.value && next && root.value && !root.value.contains(next)) close();
}

onBeforeUnmount(() => document.removeEventListener("pointerdown", onPointerDownOutside, true));
</script>

<style scoped>
.instrument-picker {
	position: relative;
	flex: 0 1 auto;
	min-width: 0;
}

/* ツールバーのボタンと同じ質感の、小さめのボタン */
.picker-trigger {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	max-width: 100%;
	min-height: 32px;
	padding: 0 10px 0 12px;
	border: 1px solid #d6ccba;
	border-bottom-color: #bdb09a;
	border-radius: 8px;
	background: linear-gradient(#fffefb, #f6f0e6);
	box-shadow:
		inset 0 1px 0 rgba(255, 255, 255, 0.9),
		0 1px 2px rgba(45, 74, 62, 0.08);
	color: var(--ink);
	font: inherit;
	font-size: 0.85rem;
	cursor: pointer;
	transition: border-color 0.15s;
}

.picker-trigger:hover,
.picker-trigger[aria-expanded="true"] {
	border-color: var(--accent);
}

.picker-trigger:focus-visible {
	outline: 3px solid var(--focus);
	outline-offset: 2px;
}

.trigger-voice {
	overflow: hidden;
	max-width: 10em;
	color: var(--ink-soft);
	font-size: 0.78rem;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.trigger-label {
	overflow: hidden;
	font-weight: 700;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.chevron {
	flex: 0 0 auto;
	color: var(--ink-soft);
	transition: transform 0.15s;
}

.chevron.flipped {
	transform: rotate(180deg);
}

/* 収録曲の一覧と同じ、紙の上に一枚重ねたパネル */
.picker-panel {
	position: absolute;
	top: calc(100% + 6px);
	left: 0;
	z-index: 20;
	display: flex;
	flex-direction: column;
	width: 260px;
	max-height: min(440px, 60vh);
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

.picker-panel.align-right {
	right: 0;
	left: auto;
	transform-origin: top right;
}

@keyframes picker-in {
	from {
		opacity: 0;
		transform: translateY(-4px) scale(0.98);
	}
}

.picker-list {
	overflow-y: auto;
	overscroll-behavior: contain;
	padding: 4px 6px 6px;
}

.picker-list:focus {
	outline: none;
}

.picker-list:focus-visible {
	box-shadow: inset 0 0 0 2px var(--focus);
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
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 7px 12px;
	border-radius: 8px;
	color: var(--ink);
	font-size: 0.92rem;
	cursor: pointer;
}

.picker-option.active {
	background: #edf2ee;
	box-shadow: inset 3px 0 0 var(--accent);
}

.picker-option.chosen {
	font-weight: 700;
}

.check {
	flex: 0 0 auto;
	color: var(--accent);
}

.picker-note {
	margin: 0;
	padding: 8px 14px 10px;
	border-top: 1px solid var(--line);
	color: var(--ink-soft);
	font-size: 0.75rem;
	line-height: 1.5;
}

@media (prefers-reduced-motion: reduce) {
	.picker-panel {
		animation: none;
	}
	.chevron,
	.picker-trigger {
		transition: none;
	}
}
</style>
