<template>
	<div class="container about">
		<h1>このサイトについて</h1>
		<p>
			ABC 記法で書かれた楽譜を表示・再生・編集し、MIDI や WAV でダウンロードできる Web アプリです。
			著作権の保護期間が満了した唱歌・各国の国歌・クラシックの名旋律を収録しています。
			すべての処理はブラウザの中で行われ、入力した楽譜がサーバーに送られることはありません
			（エディタの内容はこのブラウザの localStorage にだけ保存されます）。
		</p>

		<nav class="toc" aria-label="目次">
			<a href="#songs-rights">収録曲の権利</a>
			<a href="#abc-license">楽譜データのライセンス</a>
			<a href="#oss">オープンソースソフトウェア</a>
			<a href="#soundfont">再生に使う音源</a>
		</nav>

		<section id="songs-rights">
			<h2>収録曲の権利について</h2>
			<p>
				収録しているのは、日本の著作権法で保護期間が満了した作品だけです。保護期間は原則として著作者の死後70年ですが、
				2018年12月30日の延長は遡って適用されないため、<strong>{{ PD_DEATH_YEAR_LIMIT }}年以前に亡くなった著作者</strong>の作品は保護期間が満了しています。
				作者不詳の民謡や文部省唱歌などの団体名義の作品は、公表からの年数で判断しています。
			</p>
			<p>
				教科書や楽譜集の編曲・伴奏・日本語訳詞には、保護期間中のものがあります。このサイトではそれらを使わず、原曲の旋律と、
				保護期間が満了した歌詞だけを載せています。歌詞が保護期間中の曲は旋律のみを収録しました。
				国外で利用する場合は、その国の法律もご確認ください。
			</p>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th scope="col">曲名</th>
							<th scope="col">作詞・作曲など</th>
							<th scope="col">発表</th>
							<th scope="col">歌詞</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="s in SONGS" :key="s.id">
							<th scope="row"><RouterLink :to="`/song/${s.id}`">{{ s.title }}</RouterLink></th>
							<td>
								<span v-for="c in s.creators" :key="c.role + c.name" class="creator">
									{{ c.role }}：{{ c.name }}<template v-if="c.died">（{{ c.died }}年没）</template>
								</span>
							</td>
							<td>{{ s.published }}年</td>
							<td>{{ LYRICS_LABEL[s.lyrics] }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section id="abc-license">
			<h2>楽譜データ（ABC）のライセンス</h2>
			<p>
				収録曲の ABC 譜は、このプロジェクトが公開されている楽譜を参考に旋律を書き起こしたものです。
				書き起こした ABC ファイルは
				<a href="https://creativecommons.org/publicdomain/zero/1.0/deed.ja" rel="noopener">CC0 1.0</a>
				で提供します。自由に利用・改変・再配布できます。
				書き起こしの誤りに気づいた場合は、エディタで修正してお使いください。
			</p>
		</section>

		<section id="oss">
			<h2>利用しているオープンソースソフトウェア</h2>
			<p>
				このサイトは以下のソフトウェアを利用しています。各ソフトウェアの著作権は、それぞれの著作者に帰属します。
				ビルドに含まれるすべての依存パッケージのライセンス全文は
				<a href="./THIRD_PARTY_LICENSES.txt">THIRD_PARTY_LICENSES.txt</a> にまとめています。
			</p>
			<ul class="oss">
				<li v-for="o in OSS_LICENSES" :key="o.name">
					<div class="oss-head">
						<a :href="o.url" rel="noopener">{{ o.name }}</a>
						<span class="chip">{{ o.license }}</span>
					</div>
					<p class="usage">{{ o.usage }}</p>
					<details>
						<summary>ライセンス全文</summary>
						<pre>{{ o.text.trim() }}</pre>
					</details>
				</li>
			</ul>
		</section>

		<section id="soundfont">
			<h2>再生に使う音源</h2>
			<p>
				再生と WAV の作成には、abcjs が既定で使うサウンドフォント
				<a href="https://github.com/paulrosen/midi-js-soundfonts" rel="noopener">midi-js-soundfonts</a>
				（Benjamin Gleitzman による
				<a href="https://github.com/gleitz/midi-js-soundfonts" rel="noopener">gleitz/midi-js-soundfonts</a> を Paul Rosen がフォークしたもの）
				の FluidR3_GM を使っています。再生するときに paulrosen.github.io から読み込みます。
			</p>
			<p>
				FluidR3_GM サウンドフォントは Frank Wen らによって作成され、midi-js-soundfonts では
				<a href="https://creativecommons.org/licenses/by/3.0/us/" rel="noopener">Creative Commons Attribution 3.0</a>
				のもとで提供されています。
			</p>
		</section>

		<section>
			<h2>免責事項</h2>
			<p>
				権利情報と楽譜は正確になるよう努めていますが、その正確さを保証するものではありません。
				このサイトの利用によって生じた損害について、作成者は責任を負いません。
			</p>
		</section>
	</div>
</template>

<script setup lang="ts">
import { OSS_LICENSES } from "../licenses";
import { PD_DEATH_YEAR_LIMIT, SONGS } from "../songs/meta";

const LYRICS_LABEL = { sung: "音符に付けて収録", text: "本文のみ収録", none: "なし（旋律のみ）" } as const;
</script>

<style scoped>
.about {
	max-width: 880px;
}

.about h1 {
	margin: 24px 0 8px;
}

.about h2 {
	margin-top: 40px;
	font-size: 1.35rem;
	border-bottom: 1px solid var(--line);
	padding-bottom: 4px;
}

.toc {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin: 16px 0;
}

.toc a {
	padding: 2px 12px;
	border: 1px solid var(--line);
	border-radius: 999px;
	text-decoration: none;
	font-size: 0.88rem;
}

.table-wrap {
	overflow-x: auto;
}

table {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.85rem;
	background: var(--score);
}

th,
td {
	text-align: left;
	vertical-align: top;
	padding: 6px 8px;
	border-bottom: 1px solid var(--line);
}

thead th {
	background: var(--chip);
	white-space: nowrap;
}

tbody th {
	white-space: nowrap;
}

td:nth-child(3) {
	white-space: nowrap;
}

.creator {
	display: block;
}

.oss {
	list-style: none;
	padding: 0;
	display: grid;
	gap: 12px;
}

.oss li {
	background: var(--score);
	border: 1px solid var(--line);
	border-radius: 8px;
	padding: 12px 16px;
}

.oss-head {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
	font-weight: 700;
}

.usage {
	margin: 4px 0;
	font-size: 0.88rem;
	color: var(--ink-soft);
}

details summary {
	cursor: pointer;
	font-size: 0.85rem;
}

pre {
	white-space: pre-wrap;
	font-family: var(--font-mono);
	font-size: 0.75rem;
	background: #fff;
	border: 1px solid var(--line);
	border-radius: 6px;
	padding: 12px;
}
</style>
