# サードパーティの著作権・ライセンス表示

このプロジェクトは以下のソフトウェアとデータを利用しています。
各ソフトウェアの著作権は、それぞれの著作者に帰属します。

ビルドに含まれるすべての npm パッケージのライセンス全文は、`npm run build` を実行すると
`dist/THIRD_PARTY_LICENSES.txt` に自動生成されます（公開サイトでは `/THIRD_PARTY_LICENSES.txt`）。
アプリの「ライセンス」ページにも同じ内容を表示しています。

## ソースコードの一部を改変して取り込んだもの

### abcjs-editor

- https://github.com/abcjs-music/abcjs-editor
- Copyright (c) 2023-2026 Paul Rosen
- MIT License（全文: [licenses/abcjs-editor.LICENSE.md](licenses/abcjs-editor.LICENSE.md)）

| このプロジェクトのファイル | 元のファイル | 主な変更 |
| --- | --- | --- |
| `src/lib/cursor-control.ts` | `app/helpers/cursor-control.ts` | document 全体ではなく指定要素内だけを対象にした。行をまたぐときの自動スクロールを追加 |
| `src/components/AbcCodeInput.vue` | `app/components/atoms/CodeInputWrapper.vue` | Nuxt への依存をなくし、外から内容を差し替える `setValue` を追加 |

`src/views/EditorView.vue` の `abcjs.Editor` の初期化と、音符クリックで発音・テキスト選択する処理は、
abcjs-editor の `app/components/atoms/AbcEditor.vue` を参考にしています。

## npm パッケージ

| パッケージ | ライセンス | 著作権者 | 用途 |
| --- | --- | --- | --- |
| [abcjs](https://github.com/paulrosen/abcjs) | MIT | Copyright (c) 2009-2026 Paul Rosen and Gregory Dyke | 譜面の解析・描画・再生・MIDI 生成 |
| [@webcoder49/code-input](https://github.com/WebCoder49/code-input) | MIT | Copyright (c) 2021-2026 Oliver Geer and contributors | 構文ハイライト付きテキストエリア |
| [highlight.js](https://github.com/highlightjs/highlight.js) | BSD-3-Clause | Copyright (c) 2006, Ivan Sagalaev | 構文ハイライト |
| [highlightjs-abc](https://github.com/paulrosen/highlightjs-abc) | MIT | Copyright (c) 2025 NriotHrreion | ABC 記法の構文定義とテーマ |
| [Vue.js](https://github.com/vuejs/core) | MIT | Copyright (c) 2018-present, Yuxi (Evan) You | UI フレームワーク |
| [Vue Router](https://github.com/vuejs/router) | MIT | Copyright (c) 2019-present Eduardo San Martin Morote | ルーティング |

## 実行時に読み込むデータ

### サウンドフォント（FluidR3_GM）

再生と WAV の作成では、abcjs の既定の設定どおり、
https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/ から音源を読み込みます。

- [paulrosen/midi-js-soundfonts](https://github.com/paulrosen/midi-js-soundfonts)
  （[gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts) のフォーク）
- FluidR3_GM は Frank Wen らが作成したサウンドフォントで、midi-js-soundfonts では
  [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/us/) のもとで提供されています。

### Web フォント

Google Fonts から Zen Kaku Gothic New、Zen Old Mincho、Fira Mono を読み込みます
（いずれも SIL Open Font License 1.1）。

## 楽曲

収録曲はすべて、日本の著作権法で保護期間が満了した作品です（判定の根拠は `src/songs/meta.ts` と
アプリの「ライセンス」ページを参照）。ABC への書き起こしはこのプロジェクトによるもので、CC0 1.0 で提供します。
書き起こしにあたっては、Wikipedia の各曲の記事に掲載された楽譜や、John Chambers 氏の ABC 楽譜集
（https://trillian.mit.edu/~jc/music/abc/）などの公開資料を参考にしました。
「G線上のアリア」は、[Mutopia Project](https://www.mutopiaproject.org/) で公開されている
Jeff Covey 氏によるバッハ協会版の浄書（Creative Commons Attribution-ShareAlike 3.0）を参考に、旋律を書き起こしました。
イタリア国歌は、[Cantorion](https://cantorion.org/) で公開されているパブリックドメインの歌唱譜と、
イタリア山岳兵協会（ANA）が公開している校訂版（ノヴァーロの原譜）を照らし合わせて書き起こしました。
ロシア国歌は、Wikimedia Commons にある2000年の連邦憲法法律の公式楽譜（パブリックドメイン）を参考にしました。
