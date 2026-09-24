<!--
	ABC 記法の構文ハイライト付きテキストエリア。

	abcjs-editor の app/components/atoms/CodeInputWrapper.vue をもとに、
	Nuxt 依存（ClientOnly）を外し、値を外から差し替えられるよう改変した。
	https://github.com/abcjs-music/abcjs-editor

	Copyright (c) 2023-2026 Paul Rosen
	Released under the MIT License (see THIRD_PARTY_NOTICES.md)
-->
<template>
	<div class="code-input-wrapper abcjs-light">
		<code-input
			ref="elem"
			language="abc"
			name="abc"
			aria-label="ABC 記法の入力欄"
			spellcheck="false"
			placeholder="ここに ABC 記法を入力"
			:value="initialValue"
			@input="onInput"
		></code-input>
	</div>
</template>

<script lang="ts">
import hljs from "highlight.js/lib/core";
import highlightAbc from "highlightjs-abc";
import * as codeInput from "@webcoder49/code-input";
import Hljs from "@webcoder49/code-input/templates/hljs.mjs";

// テンプレートの登録はページ全体で一度だけ行う
let registered = false;
function registerOnce() {
	if (registered) return;
	registered = true;
	hljs.registerLanguage("abc", highlightAbc);
	codeInput.registerTemplate("hljs", new Hljs(hljs, []));
}
</script>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

defineProps<{ initialValue: string }>();

const emit = defineEmits<{
	(e: "input", value: string): void;
	(e: "ready", textarea: HTMLTextAreaElement): void;
}>();

registerOnce();

const elem = ref<HTMLElement & { value: string }>();

function onInput(ev: Event) {
	emit("input", (ev.target as HTMLTextAreaElement).value);
}

let readyEmitted = false;
function loaded() {
	const ta = elem.value?.querySelector("textarea");
	if (!ta || readyEmitted) return;
	readyEmitted = true;
	emit("ready", ta);
}

// code-input は要素の生成と同時に初期化を終えることがあり、その場合は Vue がリスナーを付ける前に
// code-input_load が発火してしまう。マウント時にすでに初期化済みかも確認する。
onMounted(() => {
	if (elem.value?.classList.contains("code-input_loaded")) loaded();
	else elem.value?.addEventListener("code-input_load", loaded);
});
onBeforeUnmount(() => elem.value?.removeEventListener("code-input_load", loaded));

/** 外から内容を差し替える（ハイライトも更新される） */
function setValue(value: string) {
	if (elem.value) elem.value.value = value;
}

defineExpose({ setValue });
</script>

<style scoped>
.code-input-wrapper {
	border: 1px solid var(--line);
	border-radius: 6px;
	background: #fff;
	overflow: hidden;
}

code-input {
	width: 100%;
	min-height: 420px;
	margin: 0;
	resize: vertical;
	font-family: var(--font-mono);
	font-size: 14px;
	background: #fff;
}
</style>

<style>
code-input .hljs {
	background: #fff;
	letter-spacing: 0.03rem;
}

code-input textarea {
	letter-spacing: 0.03rem;
}

code-input textarea::selection {
	background: #6781ef;
	color: #fff;
}
</style>
