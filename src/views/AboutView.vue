<template>
	<div class="container about">
		<h1>{{ t.about.heading }}</h1>
		<p v-if="lang === 'ja'">
			ABC 記法で書かれた楽譜を表示・再生・編集し、MIDI や WAV でダウンロードできる Web アプリです。
			著作権の保護期間が満了した唱歌・各国の国歌・クラシックの名旋律を収録しています。
			すべての処理はブラウザの中で行われ、入力した楽譜がサーバーに送られることはありません
			（エディタの内容はこのブラウザの localStorage にだけ保存されます）。
		</p>
		<p v-else>
			This web app lets you view, play, and edit sheet music written in ABC notation, and download it as MIDI or WAV.
			It includes Japanese school songs, national anthems, and classical melodies whose copyright has expired.
			Everything runs in your browser, and the music you enter is never sent to a server
			(the editor's content is saved only in this browser's localStorage).
		</p>

		<nav class="toc" :aria-label="t.about.toc">
			<!-- ページの切り替えにハッシュを使っているので、目次はハッシュを変えずにスクロールする -->
			<a href="#songs-rights" @click.prevent="scrollToSection('songs-rights')">{{ t.about.tocSongs }}</a>
			<a href="#abc-license" @click.prevent="scrollToSection('abc-license')">{{ t.about.tocAbc }}</a>
			<a href="#oss" @click.prevent="scrollToSection('oss')">{{ t.about.tocOss }}</a>
			<a href="#soundfont" @click.prevent="scrollToSection('soundfont')">{{ t.about.tocSoundfont }}</a>
		</nav>

		<section id="songs-rights">
			<h2>{{ t.about.songsHeading }}</h2>
			<template v-if="lang === 'ja'">
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
			</template>
			<template v-else>
				<p>
					This library contains only works whose copyright protection has expired under Japanese copyright law.
					Protection generally lasts 70 years after the author's death, but the extension to 70 years on December 30, 2018
					was not retroactive, so works by <strong>authors who died in {{ PD_DEATH_YEAR_LIMIT }} or earlier</strong> are in the
					public domain. Anonymous folk songs and works published under an organization's name, such as the Ministry of
					Education school songs, are judged by the number of years since publication.
				</p>
				<p>
					Some arrangements, accompaniments, and Japanese translations found in textbooks and songbooks are still under
					copyright. This site does not use them; it contains only the original melodies and lyrics whose protection has
					expired. Songs whose lyrics are still protected are included as melody only. If you use these works outside
					Japan, please also check the law of your country.
				</p>
			</template>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th scope="col">{{ t.about.thSong }}</th>
							<th scope="col">{{ t.about.thCreators }}</th>
							<th scope="col">{{ t.about.thPublished }}</th>
							<th scope="col">{{ t.about.thLyrics }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="s in SONGS" :key="s.id">
							<th scope="row">
								<RouterLink :to="`/song/${s.id}`">{{ tr(s.title) }}</RouterLink>
							</th>
							<td :data-label="t.about.thCreators">
								<div>
									<span v-for="c in s.creators" :key="c.role + tr(c.name)" class="creator">
										{{ t.roles[c.role] }}: {{ tr(c.name) }}<template v-if="c.died">{{ t.about.died(c.died) }}</template>
									</span>
								</div>
							</td>
							<td :data-label="t.about.thPublished">{{ t.library.year(s.published) }}</td>
							<td :data-label="t.about.thLyrics">{{ t.about.lyricsTable[s.lyrics] }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section id="abc-license">
			<h2>{{ t.about.abcHeading }}</h2>
			<p v-if="lang === 'ja'">
				収録曲の ABC 譜は、このプロジェクトが公開されている楽譜を参考に旋律を書き起こしたものです。
				書き起こした ABC ファイルは
				<a href="https://creativecommons.org/publicdomain/zero/1.0/deed.ja" rel="noopener">CC0 1.0</a>
				で提供します。自由に利用・改変・再配布できます。
				書き起こしの誤りに気づいた場合は、エディタで修正してお使いください。
			</p>
			<p v-else>
				The ABC scores were transcribed by this project from published scores. The transcribed ABC files are released under
				<a href="https://creativecommons.org/publicdomain/zero/1.0/" rel="noopener">CC0 1.0</a>, so you can use, change, and
				share them freely. If you find a mistake in a transcription, you can fix it in the editor.
			</p>
		</section>

		<section id="oss">
			<h2>{{ t.about.ossHeading }}</h2>
			<p v-if="lang === 'ja'">
				このサイトは以下のソフトウェアを利用しています。各ソフトウェアの著作権は、それぞれの著作者に帰属します。
				ビルドに含まれるすべての依存パッケージのライセンス全文は
				<a href="./THIRD_PARTY_LICENSES.txt">THIRD_PARTY_LICENSES.txt</a> にまとめています。
			</p>
			<p v-else>
				This site uses the following software. The copyright of each belongs to its authors. The full license texts of
				every package included in the build are collected in
				<a href="./THIRD_PARTY_LICENSES.txt">THIRD_PARTY_LICENSES.txt</a>.
			</p>
			<ul class="oss">
				<li v-for="o in OSS_LICENSES" :key="o.name">
					<div class="oss-head">
						<a :href="o.url" rel="noopener">{{ o.name }}</a>
						<span class="chip">{{ o.license }}</span>
					</div>
					<p class="usage">{{ tr(o.usage) }}</p>
					<details>
						<summary>{{ t.about.licenseText }}</summary>
						<pre>{{ o.text.trim() }}</pre>
					</details>
				</li>
			</ul>
		</section>

		<section id="soundfont">
			<h2>{{ t.about.soundfontHeading }}</h2>
			<template v-if="lang === 'ja'">
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
			</template>
			<template v-else>
				<p>
					Playback and WAV export use FluidR3_GM from
					<a href="https://github.com/paulrosen/midi-js-soundfonts" rel="noopener">midi-js-soundfonts</a>, the sound font
					abcjs uses by default (Paul Rosen's fork of Benjamin Gleitzman's
					<a href="https://github.com/gleitz/midi-js-soundfonts" rel="noopener">gleitz/midi-js-soundfonts</a>). It is
					loaded from paulrosen.github.io when you play a song.
				</p>
				<p>
					The FluidR3_GM sound font was created by Frank Wen and others, and midi-js-soundfonts provides it under the
					<a href="https://creativecommons.org/licenses/by/3.0/us/" rel="noopener">Creative Commons Attribution 3.0</a>
					license.
				</p>
			</template>
		</section>

		<section v-if="ANALYTICS_ID">
			<h2>{{ t.about.analyticsHeading }}</h2>
			<p v-if="lang === 'ja'">
				このサイトでは、利用状況を把握するために Google アナリティクスを使っています。
				Google アナリティクスは Cookie を使って、閲覧したページなどのデータを収集します。
				収集したデータに、個人を特定する情報は含まれません。エディタに入力した楽譜は送信されません。
				データの扱いについては
				<a href="https://policies.google.com/technologies/partner-sites?hl=ja" rel="noopener">Google のポリシー</a>
				をご覧ください。
			</p>
			<p v-else>
				This site uses Google Analytics to understand how it is used. Google Analytics uses cookies to collect data
				such as the pages you view. The collected data does not include information that identifies you, and the music
				you enter in the editor is not sent. For how Google uses this data, see
				<a href="https://policies.google.com/technologies/partner-sites" rel="noopener">Google's policy</a>.
			</p>
		</section>

		<section>
			<h2>{{ t.about.disclaimerHeading }}</h2>
			<p v-if="lang === 'ja'">
				権利情報と楽譜は正確になるよう努めていますが、その正確さを保証するものではありません。
				このサイトの利用によって生じた損害について、作成者は責任を負いません。
			</p>
			<p v-else>
				We try to keep the rights information and scores accurate, but we cannot guarantee their accuracy. The author is
				not responsible for any damage resulting from the use of this site.
			</p>
		</section>
	</div>
</template>

<script setup lang="ts">
import { lang, t, tr } from "../i18n";
import { ANALYTICS_ID } from "../lib/analytics";

function scrollToSection(id: string) {
	document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
import { OSS_LICENSES } from "../licenses";
import { PD_DEATH_YEAR_LIMIT, SONGS } from "../songs/meta";
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

/* スマートフォンでは4列の表が収まらないので、1曲を1枚のカードとして縦に並べる */
@media (max-width: 640px) {
	table,
	tbody,
	tr,
	th,
	td {
		display: block;
	}

	thead {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	table {
		background: none;
	}

	tr {
		background: var(--score);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 8px 12px;
		margin-bottom: 8px;
	}

	th,
	td {
		border-bottom: none;
		padding: 2px 0;
	}

	tbody th {
		white-space: normal;
		font-size: 1rem;
	}

	td[data-label] {
		display: grid;
		grid-template-columns: 7.5em 1fr;
		gap: 8px;
	}

	td[data-label]::before {
		content: attr(data-label);
		color: var(--ink-soft);
	}
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
