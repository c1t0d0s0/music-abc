# ABC 譜面ライブラリ

[English](README.md) | 日本語

ABC 記法で書かれた楽譜を表示・再生・編集し、MIDI / WAV / ABC でダウンロードできる Web アプリです。
著作権の保護期間が満了した唱歌、各国の国歌、クラシックの名旋律など 27 曲を収録しています。

- 譜面の描画・再生: [abcjs](https://github.com/paulrosen/abcjs)
- エディタ: [abcjs-editor](https://github.com/abcjs-music/abcjs-editor) の一部を改変して利用
- フレームワーク: Vite + Vue 3 + TypeScript（サーバー不要の静的サイト）

## 機能

- 曲の一覧と検索（曲名・作者・カテゴリ）
- 譜面の表示、再生（ループ、テンポ変更、再生位置のカーソル表示）、音符クリックで単音を発音
- 移調（±6 半音。表示・再生・MIDI・WAV すべてに反映）
- MIDI / WAV / ABC のダウンロード、印刷
- ABC エディタ（構文ハイライト、リアルタイム描画、エラー表示、.abc ファイルの読み込み、自動保存）
- 著作権・ライセンス表示のページ（OSS のライセンス全文、収録曲の権利情報）

## 開発

```bash
npm install
npm run dev       # 開発サーバー
npm test          # 収録曲の検証（パース、小節の長さ、歌詞の音節数、PD 条件、MIDI 生成）
npm run build     # dist/ に静的サイトを出力（THIRD_PARTY_LICENSES.txt も生成）
npm run preview   # ビルド結果の確認
```

`dist/` をそのまま GitHub Pages や Netlify などに置けば動きます。
相対パスで出力し、ルーティングはハッシュ方式（`#/song/furusato` など）なので、サブディレクトリに置いても設定は要りません。

## 曲を追加するには

1. `src/songs/<カテゴリ>/<id>.abc` を作る（`school` / `anthems` / `classical-folk`）
2. `src/songs/meta.ts` の `SONGS` に、同じ `id` で作者・没年・発表年などを追加する
3. `npm test` を実行する。作者の没年が 1967 年より後だとテストが失敗する

歌詞は音符の行の直後に `w:` 行で書きます。音節の数とその行の音符の数（休符を除く）が一致しないとテストが失敗します。

## ライセンス

- ソースコード: MIT License（[LICENSE](LICENSE)）
- 収録曲の ABC ファイル: CC0 1.0
- サードパーティ: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
