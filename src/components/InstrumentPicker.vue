<!--
	再生の音色を選ぶ。再生バー（深緑）の上に置くボタンと、種類ごとに見出しを付けた一覧。
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
			:aria-label="`${t.score.instrument}: ${tr(current.name)}`"
			:title="`${t.score.instrument}: ${tr(current.name)}`"
			@click="toggle"
			@keydown.down.prevent="openPanel"
		>
			<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
				<path d="M8 15.5V4.5l8-2v10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
				<ellipse cx="6" cy="15.5" rx="2.4" ry="1.9" fill="currentColor" />
				<ellipse cx="14" cy="12.5" rx="2.4" ry="1.9" fill="currentColor" />
			</svg>
			<span class="trigger-label">{{ tr(current.name) }}</span>
			<svg class="chevron" :class="{ flipped: open }" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
				<path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		<div v-if="open" class="picker-panel">
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
						:class="{ active: ins.program === active, chosen: ins.program === modelValue }"
						:aria-selected="ins.program === modelValue"
						@mousemove="active = ins.program"
						@click="choose(ins.program)"
					>
						<span>{{ tr(ins.name) }}</span>
						<svg v-if="ins.program === modelValue" class="check" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
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

const props = defineProps<{ modelValue: number }>();
const emit = defineEmits<{ (e: "update:modelValue", program: number): void }>();

const listId = `instrument-list-${++pickerCount}`;
const optionId = (program: number) => `${listId}-${program}`;

const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const list = ref<HTMLElement>();
const open = ref(false);
const active = ref(props.modelValue);
const current = computed(() => findInstrument(props.modelValue));

function scrollActiveIntoView() {
	nextTick(() => document.getElementById(optionId(active.value))?.scrollIntoView({ block: "nearest" }));
}

async function openPanel() {
	if (open.value) return;
	active.value = current.value.program;
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

/* 再生バー（深緑）の上に置くボタン */
.picker-trigger {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	max-width: 190px;
	height: 30px;
	padding: 0 10px 0 8px;
	border: 1px solid rgba(247, 242, 234, 0.35);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.08);
	color: var(--accent-ink);
	font: inherit;
	font-size: 0.85rem;
	cursor: pointer;
	transition:
		background 0.15s,
		border-color 0.15s;
}

.picker-trigger:hover,
.picker-trigger[aria-expanded="true"] {
	border-color: rgba(247, 242, 234, 0.7);
	background: rgba(255, 255, 255, 0.16);
}

.trigger-label {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.chevron {
	flex: 0 0 auto;
	opacity: 0.8;
	transition: transform 0.15s;
}

.chevron.flipped {
	transform: rotate(180deg);
}

/* 収録曲の一覧と同じ、紙の上に一枚重ねたパネル */
.picker-panel {
	position: absolute;
	top: calc(100% + 10px);
	right: 0;
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
	transform-origin: top right;
	animation: picker-in 0.14s ease-out;
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

/* 狭い画面ではボタンを音符のアイコンだけにする */
@media (max-width: 560px) {
	.trigger-label {
		display: none;
	}
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
