import { defineConfig, type Plugin } from "vitest/config";
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

/**
 * Google アナリティクス 4 または Google タグマネージャーの ID を取得する。
 * 1. 環境変数 GA_ID または GTM_ID が設定されていればそれを優先
 * 2. なければプロジェクト直下の config.js（git 管理外）から GTM_ID を読む
 *   G-XXXXXXX   … Google アナリティクス 4 の測定 ID（gtag.js を埋め込む）
 *   GTM-XXXXXXX … Google タグマネージャーのコンテナ ID
 */
function readAnalyticsId(): string {
	const envId = (process.env.GA_ID || process.env.GTM_ID || "").trim();
	if (envId) {
		if (!/^(G|GTM)-[A-Z0-9]+$/.test(envId)) {
			console.warn(`環境変数の ID の形式が正しくないため、アクセス解析のタグを入れません: ${envId}`);
			return "";
		}
		return envId;
	}

	const file = path.join(root, "config.js");
	if (!fs.existsSync(file)) return "";
	const id = fs.readFileSync(file, "utf8").match(/\bGTM_ID\s*=\s*["'`]([^"'`]*)["'`]/)?.[1]?.trim() ?? "";
	if (!id) return "";
	if (!/^(G|GTM)-[A-Z0-9]+$/.test(id)) {
		console.warn(`config.js の GTM_ID の形式が正しくないため、アクセス解析のタグを入れません: ${id}`);
		return "";
	}
	return id;
}

/** index.html にアクセス解析のタグを入れる */
function analyticsPlugin(id: string): Plugin {
	return {
		name: "music-abc:analytics",
		transformIndexHtml() {
			if (!id) return [];
			if (id.startsWith("GTM-")) {
				return [
					{
						tag: "script",
						injectTo: "head-prepend",
						children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`,
					},
					{
						tag: "noscript",
						injectTo: "body-prepend",
						children: `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
					},
				];
			}
			return [
				{
					tag: "script",
					attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${id}` },
					injectTo: "head-prepend",
				},
				{
					tag: "script",
					injectTo: "head-prepend",
					// ページビューはページを移動するたびに src/lib/analytics.ts から送るので、自動送信は止める
					children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{send_page_view:false});`,
				},
			];
		},
	};
}

export default defineConfig(({ command }) => {
	// 開発サーバーでは計測しない（開発中のアクセスが集計に混ざらないように）
	const analyticsId = command === "build" ? readAnalyticsId() : "";
	return {
		// 相対パスで出力し、GitHub Pages などのサブディレクトリ配置でも動くようにする
		base: "./",
		define: {
			__ANALYTICS_ID__: JSON.stringify(analyticsId),
		},
		plugins: [
			analyticsPlugin(analyticsId),
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
	};
});
