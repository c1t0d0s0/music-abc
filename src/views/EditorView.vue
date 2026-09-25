<template>
	<div class="container editor-page">
		<h1 class="no-print">{{ t.editor.heading }}</h1>
		<p class="lead no-print">{{ t.editor.lead }}</p>

		<div class="toolbar no-print">
			<div class="tool-set" role="group" :aria-label="t.editor.scoreTools">
				<button type="button" class="btn" @click="newTune"><ToolIcon name="new" />{{ t.editor.new }}</button>
				<label class="btn file">
					<ToolIcon name="open" />{{ t.editor.openFile }}
					<input type="file" accept=".abc,text/plain,text/vnd.abc" @change="openFile" />
				</label>
				<SongPicker @select="onPickSong" />
			</div>
			<span class="toolbar-divider" aria-hidden="true"></span>
			<DownloadButtons :abc="abc" :filename="filename" />
		</div>

		<div class="layout">
			<section class="input-pane no-print" :aria-label="t.editor.inputLabel">
				<AbcCodeInput ref="inputRef" :initial-value="initial" @input="onInput" @ready="onReady" />
				<div ref="warningsEl" class="warnings" aria-live="polite"></div>
				<details class="cheat">
					<summary>{{ t.editor.cheat.summary }}</summary>
					<dl>
						<template v-for="[term, desc] in t.editor.cheat.rows" :key="term">
							<dt>{{ term }}</dt>
							<dd>
								<template v-for="(part, i) in desc.split('`')" :key="i">
									<code v-if="i % 2 === 1">{{ part }}</code>
									<template v-else>{{ part }}</template>
								</template>
							</dd>
						</template>
					</dl>
					<p>
						{{ t.editor.cheat.moreBefore }}
						<a href="https://abcnotation.com/wiki/abc:standard:v2.1" rel="noopener">{{ t.editor.cheat.moreLink }}</a
						>{{ t.editor.cheat.moreAfter }}
					</p>
				</details>
			</section>

			<section class="output-pane" :aria-label="t.editor.scoreLabel">
				<div class="player no-print">
					<div ref="audioEl" class="audio"></div>
					<VolumeControl />
				</div>
				<div ref="paperEl" class="score-paper"></div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import abcjs, { type AbcElem, type Editor } from "abcjs";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AbcCodeInput from "../components/AbcCodeInput.vue";
import DownloadButtons from "../components/DownloadButtons.vue";
import SongPicker from "../components/SongPicker.vue";
import ToolIcon from "../components/ToolIcon.vue";
import VolumeControl from "../components/VolumeControl.vue";
import {
	EDITOR_STORAGE_KEY,
	abcTitle,
	loadScoreFonts,
	observeLayout,
	safeFilename,
	scoreFontFormat,
	scoreLayout,
	storageGet,
	storageSet,
} from "../lib/abc-utils";
import { CursorControl } from "../lib/cursor-control";
import { findSong, localizedAbc } from "../lib/songs";
import { messagesFor, t, tr } from "../i18n";

const DEFAULT_ABC = t.editor.defaultAbc;
/** どちらの言語のひな形も「未編集」とみなす */
const TEMPLATES = [messagesFor("ja").editor.defaultAbc, messagesFor("en").editor.defaultAbc];

const route = useRoute();
const router = useRouter();

const inputRef = ref<InstanceType<typeof AbcCodeInput>>();
const warningsEl = ref<HTMLElement>();
const audioEl = ref<HTMLElement>();
const paperEl = ref<HTMLElement>();

let textarea: HTMLTextAreaElement | null = null;
let editor: Editor | null = null;
let stopObserving: (() => void) | undefined;
let unmounted = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
/** 最後に読み込んでから編集したか */
let dirty = false;

const initial = pickInitial();
const abc = ref(initial);
const filename = computed(() => safeFilename(abcTitle(abc.value)));

function pickInitial(): string {
	const saved = storageGet(EDITOR_STORAGE_KEY);
	const song = typeof route.query.song === "string" ? findSong(route.query.song) : undefined;
	if (song) {
		const songAbc = localizedAbc(song);
		const keepSaved =
			saved &&
			saved !== songAbc &&
			!TEMPLATES.includes(saved) &&
			!window.confirm(t.editor.confirmReplaceSaved(tr(song.title)));
		if (!keepSaved) {
			storageSet(EDITOR_STORAGE_KEY, songAbc);
			return songAbc;
		}
	}
	return saved ?? DEFAULT_ABC;
}

function clickListener(abcElem: AbcElem) {
	// 楽譜の音符をクリックしたら、対応する ABC のテキストを選択して音を鳴らす（abcjs-editor と同じ動作）。
	// タッチ操作の端末ではフォーカスするとキーボードが開いて入力欄へスクロールしてしまうので、音を鳴らすだけにする
	const touch = window.matchMedia("(pointer: coarse)").matches;
	if (!touch && textarea && abcElem.startChar !== undefined && abcElem.endChar !== undefined) {
		textarea.focus();
		textarea.setSelectionRange(abcElem.startChar, abcElem.endChar);
	}
	if (abcElem.midiPitches && editor) {
		abcjs.synth
			.playEvent(abcElem.midiPitches, abcElem.midiGraceNotePitches ?? [], editor.millisecondsPerMeasure())
			.catch(() => {});
	}
}

function visualParams() {
	return {
		responsive: "resize" as const,
		add_classes: true,
		oneSvgPerLine: true,
		clickListener,
		format: scoreFontFormat(),
		...scoreLayout(paperEl.value!.clientWidth),
	};
}

async function onReady(ta: HTMLTextAreaElement) {
	textarea = ta;
	// 楽譜の文字の大きさを正しく測れるよう、描く前に必要なフォントを読み込む
	const fonts = await loadScoreFonts(ta.value);
	if (unmounted) return;
	// 待ちきれなかったフォントが届いたら描き直す
	if (!fonts.loadedInTime) void fonts.loaded.then(() => !unmounted && editor?.paramChanged(visualParams()));
	editor = new abcjs.Editor(ta, {
		canvas_id: paperEl.value!,
		warnings_id: warningsEl.value!,
		synth: {
			el: audioEl.value!,
			cursorControl: new CursorControl(() => paperEl.value ?? null),
			options: { displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true },
		},
		abcjsParams: visualParams(),
	});
	stopObserving = observeLayout(paperEl.value!, () => editor?.paramChanged(visualParams()));
}

function onInput(value: string) {
	abc.value = value;
	dirty = true;
	clearTimeout(saveTimer);
	saveTimer = setTimeout(() => storageSet(EDITOR_STORAGE_KEY, value), 400);
}

function replaceContent(value: string) {
	if (dirty && abc.value !== value && !window.confirm(t.editor.confirmReplace)) return false;
	inputRef.value?.setValue(value);
	abc.value = value;
	dirty = false;
	storageSet(EDITOR_STORAGE_KEY, value);
	// 新しい内容の文字に必要なフォントを読み込んでから描き直す
	void loadScoreFonts(value).then(() => {
		if (!unmounted) editor?.fireChanged();
	});
	return true;
}

function newTune() {
	replaceContent(DEFAULT_ABC);
}

async function openFile(ev: Event) {
	const input = ev.target as HTMLInputElement;
	const file = input.files?.[0];
	input.value = "";
	if (file) replaceContent(await file.text());
}

function onPickSong(id: string) {
	const song = findSong(id);
	if (song) replaceContent(localizedAbc(song));
}

onMounted(() => {
	// 読み込み済みの曲を URL に残さない（再読み込みで上書きしないように）
	if (route.query.song) router.replace({ query: {} });
});

onBeforeUnmount(() => {
	unmounted = true;
	stopObserving?.();
	clearTimeout(saveTimer);
	storageSet(EDITOR_STORAGE_KEY, abc.value);
	try {
		editor?.pauseMidi(true);
	} catch {
		/* 未再生なら何もしない */
	}
});
</script>

<style scoped>
.editor-page h1 {
	margin: 24px 0 4px;
	font-size: 1.8rem;
}

.lead {
	margin: 0 0 12px;
	color: var(--ink-soft);
	font-size: 0.92rem;
}

/* 操作を 1 本の帯にまとめ、「楽譜を用意する」と「書き出す」を区切り線で分ける */
.toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px 14px;
	margin-bottom: 16px;
	padding: 10px;
	border: 1px solid var(--line);
	border-radius: 12px;
	background: rgba(255, 253, 248, 0.75);
}

.tool-set {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.toolbar-divider {
	align-self: stretch;
	width: 1px;
	margin: 4px 0;
	background: var(--line);
}

/* ファイル選択はボタンの見た目のラベルで開く。入力欄は見えないがキーボードで選べるようにしておく */
.file input {
	position: absolute;
	width: 1px;
	height: 1px;
	opacity: 0;
	pointer-events: none;
}

.file:focus-within {
	outline: 3px solid var(--focus);
	outline-offset: 2px;
}

@media (max-width: 560px) {
	.toolbar {
		gap: 10px;
	}
	.tool-set {
		width: 100%;
	}
	.tool-set > .btn {
		flex: 1 1 auto;
	}
	.tool-set > .song-picker {
		flex-basis: 100%;
	}
	.toolbar-divider {
		display: none;
	}
}

.visually-hidden {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip: rect(0 0 0 0);
}

.layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 16px;
}

@media (min-width: 960px) {
	.layout {
		grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
		align-items: start;
	}
	.output-pane {
		position: sticky;
		top: 8px;
	}
}

.warnings {
	margin-top: 8px;
	color: var(--highlight);
	font-size: 0.85rem;
	font-family: var(--font-mono);
	white-space: pre-wrap;
}

.cheat {
	margin-top: 12px;
	font-size: 0.88rem;
}

.cheat summary {
	cursor: pointer;
}

.cheat dl {
	display: grid;
	grid-template-columns: max-content 1fr;
	gap: 4px 12px;
}

.cheat dt {
	font-weight: 700;
}

.cheat dd {
	margin: 0;
}

.cheat code {
	background: var(--chip);
	padding: 0 4px;
	border-radius: 3px;
	font-family: var(--font-mono);
}

.player {
	margin-bottom: 12px;
}

.score-paper {
	background: var(--score);
	border: 1px solid var(--line);
	border-radius: 6px;
	padding: 12px 8px;
	min-height: 200px;
	color: #111;
}

@media (max-width: 599px) {
	/* 入力欄の下にある楽譜まで、スクロールせずに届きやすくする */
	.input-pane :deep(code-input) {
		min-height: 260px;
	}
}

/*
 * 印刷では楽譜だけを紙面の幅いっぱいに出す。
 * 画面の 2 列レイアウトや、楽譜の欄を上に貼り付ける sticky のままだと、
 * ブラウザによっては楽譜の欄を分割できず、丸ごと 2 ページ目に送ってしまう。
 */
@media print {
	.layout {
		display: block;
	}
	.output-pane {
		position: static;
	}
	.score-paper {
		min-height: 0;
	}
}
</style>
