import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import license from "rollup-plugin-license";
import fs from "node:fs";
import path from "node:path";

const root = import.meta.dirname;

// abcjs-editor は npm パッケージではなくソースの一部を改変して取り込んでいるため、
// 自動生成されるライセンス一覧に手動で追記する
const abcjsEditorNotice = [
	"Name: abcjs-editor (portions: src/lib/cursor-control.ts, src/components/AbcCodeInput.vue)",
	"License: MIT",
	"Repository: https://github.com/abcjs-music/abcjs-editor",
	"License Text:",
	"===",
	"",
	fs.readFileSync(path.join(root, "licenses", "abcjs-editor.LICENSE.md"), "utf8").trim(),
].join("\n");

export default defineConfig({
	// 相対パスで出力し、GitHub Pages などのサブディレクトリ配置でも動くようにする
	base: "./",
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag === "code-input",
				},
			},
		}),
		{
			...license({
				thirdParty: {
					includePrivate: true,
					output: {
						file: path.join(root, "dist", "THIRD_PARTY_LICENSES.txt"),
						template: (dependencies) =>
							"このサイトのビルドに含まれるサードパーティ製ソフトウェアのライセンス\n" +
							"Third-party software licenses included in this build\n\n===\n\n" +
							[...dependencies.map((d) => d.text()), abcjsEditorNotice].join("\n\n---\n\n") +
							"\n",
					},
				},
			}),
			apply: "build",
		},
	],
	build: {
		rolldownOptions: {
			output: {
				codeSplitting: {
					// abcjs は大きいので単独のチャンクにして、キャッシュを効かせる
					groups: [{ name: "abcjs", test: /node_modules[\\/]abcjs[\\/]/ }],
				},
			},
		},
		// abcjs 本体だけで約 500 kB あるため
		chunkSizeWarningLimit: 700,
	},
	test: {
		environment: "node",
	},
});
