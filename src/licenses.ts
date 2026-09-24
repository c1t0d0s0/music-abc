/**
 * About ページに表示する、利用しているオープンソースソフトウェアのライセンス。
 * ライセンス本文は node_modules（abcjs-editor は licenses/）から読み込むので、
 * 依存を更新しても本文がずれない。
 * ビルドに含まれる依存の完全な一覧は dist/THIRD_PARTY_LICENSES.txt に自動生成される。
 */
import abcjsLicense from "../node_modules/abcjs/LICENSE.md?raw";
import abcjsEditorLicense from "../licenses/abcjs-editor.LICENSE.md?raw";
import codeInputLicense from "../node_modules/@webcoder49/code-input/LICENSE?raw";
import highlightJsLicense from "../node_modules/highlight.js/LICENSE?raw";
import highlightAbcLicense from "../node_modules/highlightjs-abc/LICENSE?raw";
import vueLicense from "../node_modules/vue/LICENSE?raw";
import vueRouterLicense from "../node_modules/vue-router/LICENSE?raw";

export interface OssLicense {
	name: string;
	url: string;
	license: string;
	usage: string;
	text: string;
}

export const OSS_LICENSES: OssLicense[] = [
	{
		name: "abcjs",
		url: "https://github.com/paulrosen/abcjs",
		license: "MIT License",
		usage: "ABC 記法の解析、譜面の描画、再生、MIDI 生成、エディタ",
		text: abcjsLicense,
	},
	{
		name: "abcjs-editor",
		url: "https://github.com/abcjs-music/abcjs-editor",
		license: "MIT License",
		usage: "再生カーソル（src/lib/cursor-control.ts）と構文ハイライト付き入力欄（src/components/AbcCodeInput.vue）を改変して利用",
		text: abcjsEditorLicense,
	},
	{
		name: "code-input",
		url: "https://github.com/WebCoder49/code-input",
		license: "MIT License",
		usage: "構文ハイライト付きテキストエリア",
		text: codeInputLicense,
	},
	{
		name: "highlight.js",
		url: "https://github.com/highlightjs/highlight.js",
		license: "BSD 3-Clause License",
		usage: "構文ハイライトのエンジン",
		text: highlightJsLicense,
	},
	{
		name: "highlightjs-abc",
		url: "https://github.com/paulrosen/highlightjs-abc",
		license: "MIT License",
		usage: "highlight.js 用の ABC 記法の定義とテーマ",
		text: highlightAbcLicense,
	},
	{
		name: "Vue.js",
		url: "https://github.com/vuejs/core",
		license: "MIT License",
		usage: "UI フレームワーク",
		text: vueLicense,
	},
	{
		name: "Vue Router",
		url: "https://github.com/vuejs/router",
		license: "MIT License",
		usage: "ページの切り替え",
		text: vueRouterLicense,
	},
];
