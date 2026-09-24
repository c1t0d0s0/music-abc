/**
 * 収録曲の権利情報。
 *
 * 日本の著作権法では保護期間は著作者の死後70年だが、2018年12月30日の延長は
 * 遡らないため、1967年以前に亡くなった著作者の作品は保護期間が満了している。
 * 作者不詳・団体名義の作品は公表後の年数で判断する。
 * いずれの曲も、ABC 譜は本プロジェクトが旋律だけを書き起こしたもの（CC0）。
 *
 * 表示用の文字列は日本語と英語の両方を持つ。どちらの言語でも同じ表記なら文字列のままでよい。
 */
import type { Localized } from "../i18n";

export type Category = "school" | "anthems" | "classical-folk";

export type Role =
	| "lyricist"
	| "composer"
	| "lyricsMusic"
	| "lyricsSource"
	| "arranger"
	| "reviser"
	| "lyricistFrench"
	| "lyricistEnglish";

export interface Creator {
	role: Role;
	name: Localized | string;
	born?: number;
	died?: number;
	/** 作者不詳・民謡・団体名義など、個人の没年で判断できないもの */
	anonymous?: boolean;
}

export interface SongMeta {
	id: string;
	category: Category;
	/** 表示用の短い曲名 */
	title: Localized | string;
	/** 読み・原題・訳題など */
	subtitle?: Localized | string;
	country?: Localized;
	creators: Creator[];
	/** 初出年（旋律または歌詞の古い方ではなく、収録版の公表年） */
	published: number;
	/** 譜面上の歌詞: "sung" = 音符に付けて表示、"text" = 譜面の下に本文のみ、"none" = なし */
	lyrics: "sung" | "text" | "none";
	note?: Localized;
}

export const PD_DEATH_YEAR_LIMIT = 1967;

const TAKANO = { role: "lyricist", name: { ja: "高野辰之", en: "Takano Tatsuyuki" }, born: 1876, died: 1947 } as const;
const OKANO = { role: "composer", name: { ja: "岡野貞一", en: "Okano Teiichi" }, born: 1878, died: 1941 } as const;
const TAKI = { role: "composer", name: { ja: "滝廉太郎", en: "Taki Rentarō" }, born: 1879, died: 1903 } as const;
const YAMADA = { name: { ja: "山田耕筰", en: "Yamada Kōsaku" }, born: 1886, died: 1965 } as const;

export const SONGS: SongMeta[] = [
	// ---- 学校で歌う歌 ----
	{
		id: "furusato",
		category: "school",
		title: { ja: "ふるさと", en: "Furusato" },
		subtitle: { ja: "故郷", en: "Hometown" },
		creators: [TAKANO, OKANO],
		published: 1914,
		lyrics: "sung",
		note: {
			ja: "尋常小学唱歌。1〜3番を収録。",
			en: "A Ministry of Education school song. Verses 1–3 are included.",
		},
	},
	{
		id: "haru-no-ogawa",
		category: "school",
		title: { ja: "春の小川", en: "Haru no Ogawa" },
		subtitle: { ja: "", en: "The Brook in Spring" },
		creators: [TAKANO, OKANO],
		published: 1912,
		lyrics: "sung",
		note: {
			ja: "1912年の原詞を収録。1942年以降の改詞（林柳波、1974年没）は保護期間中のため使っていません。",
			en: "The original 1912 lyrics. The 1942 revision (by Hayashi Ryūha, d. 1974) is still under copyright and is not used.",
		},
	},
	{
		id: "akatombo",
		category: "school",
		title: { ja: "赤とんぼ", en: "Akatombo" },
		subtitle: { ja: "", en: "Red Dragonfly" },
		creators: [
			{ role: "lyricist", name: { ja: "三木露風", en: "Miki Rofū" }, born: 1889, died: 1964 },
			{ role: "composer", ...YAMADA },
		],
		published: 1927,
		lyrics: "sung",
	},
	{
		id: "natsu-wa-kinu",
		category: "school",
		title: { ja: "夏は来ぬ", en: "Natsu wa Kinu" },
		subtitle: { ja: "", en: "Summer Has Come" },
		creators: [
			{ role: "lyricist", name: { ja: "佐佐木信綱", en: "Sasaki Nobutsuna" }, born: 1872, died: 1963 },
			{ role: "composer", name: { ja: "小山作之助", en: "Koyama Sakunosuke" }, born: 1864, died: 1927 },
		],
		published: 1896,
		lyrics: "sung",
	},
	{
		id: "hamabe-no-uta",
		category: "school",
		title: { ja: "浜辺の歌", en: "Hamabe no Uta" },
		subtitle: { ja: "", en: "Song of the Seashore" },
		creators: [
			{ role: "lyricist", name: { ja: "林古渓", en: "Hayashi Kokei" }, born: 1875, died: 1947 },
			{ role: "composer", name: { ja: "成田為三", en: "Narita Tamezō" }, born: 1893, died: 1945 },
		],
		published: 1918,
		lyrics: "none",
	},
	{
		id: "kaeru-no-gassho",
		category: "school",
		title: { ja: "かえるの合唱", en: "Kaeru no Gasshō" },
		subtitle: { ja: "Froschgesang", en: "Frog Chorus (Froschgesang)" },
		creators: [{ role: "composer", name: { ja: "ドイツ民謡", en: "German folk song" }, anonymous: true }],
		published: 1942,
		lyrics: "none",
		note: {
			ja: "旋律のみ。日本語詞（岡本敏明、1977年没）は保護期間中のため収録していません。1〜4の番号の位置から追いかけて輪唱できます。",
			en: "Melody only. The Japanese lyrics (by Okamoto Toshiaki, d. 1977) are still under copyright. Start from the numbers 1–4 to sing it as a round.",
		},
	},
	{
		id: "chatsumi",
		category: "school",
		title: { ja: "茶摘み", en: "Chatsumi" },
		subtitle: { ja: "", en: "Tea Picking" },
		creators: [
			{
				role: "lyricsMusic",
				name: { ja: "文部省唱歌（作者不詳）", en: "Ministry of Education song (author unknown)" },
				anonymous: true,
			},
		],
		published: 1912,
		lyrics: "sung",
	},
	{
		id: "hana",
		category: "school",
		title: { ja: "花", en: "Hana" },
		subtitle: { ja: "", en: "Flowers" },
		creators: [{ role: "lyricist", name: { ja: "武島羽衣", en: "Takeshima Hagoromo" }, born: 1872, died: 1967 }, TAKI],
		published: 1900,
		lyrics: "none",
		note: {
			ja: "組歌「四季」の第1曲。二部合唱の主旋律のみ。",
			en: "The first song of the suite “Shiki” (The Four Seasons). Only the main melody of the two-part chorus.",
		},
	},
	{
		id: "kojo-no-tsuki",
		category: "school",
		title: { ja: "荒城の月", en: "Kōjō no Tsuki" },
		subtitle: { ja: "", en: "The Moon over the Ruined Castle" },
		creators: [
			{ role: "lyricist", name: { ja: "土井晩翠", en: "Doi Bansui" }, born: 1871, died: 1952 },
			TAKI,
			{ role: "reviser", ...YAMADA },
		],
		published: 1901,
		lyrics: "sung",
		note: {
			ja: "一般に歌われる山田耕筰の補作版（ニ短調）。",
			en: "The commonly sung version revised by Yamada Kōsaku, in D minor.",
		},
	},
	{
		id: "sakura-sakura",
		category: "school",
		title: { ja: "さくら さくら", en: "Sakura Sakura" },
		subtitle: { ja: "", en: "Cherry Blossoms" },
		creators: [{ role: "lyricsMusic", name: { ja: "日本古謡", en: "Japanese traditional" }, anonymous: true }],
		published: 1888,
		lyrics: "sung",
	},
	{
		id: "hotaru-no-hikari",
		category: "school",
		title: { ja: "蛍の光", en: "Hotaru no Hikari" },
		subtitle: "Auld Lang Syne",
		creators: [
			{ role: "lyricist", name: { ja: "稲垣千穎", en: "Inagaki Chikai" }, born: 1845, died: 1913 },
			{ role: "composer", name: { ja: "スコットランド民謡", en: "Scottish folk song" }, anonymous: true },
		],
		published: 1881,
		lyrics: "sung",
	},
	{
		id: "hanyu-no-yado",
		category: "school",
		title: { ja: "埴生の宿", en: "Hanyū no Yado" },
		subtitle: "Home! Sweet Home!",
		creators: [
			{ role: "lyricist", name: { ja: "里見義", en: "Satomi Tadashi" }, born: 1824, died: 1886 },
			{ role: "composer", name: { ja: "ヘンリー・ビショップ", en: "Henry Bishop" }, born: 1786, died: 1855 },
		],
		published: 1889,
		lyrics: "sung",
	},

	// ---- 各国の国歌 ----
	{
		id: "kimigayo",
		category: "anthems",
		title: { ja: "君が代", en: "Kimigayo" },
		country: { ja: "日本", en: "Japan" },
		creators: [
			{
				role: "lyricsSource",
				name: { ja: "古今和歌集（詠み人知らず）", en: "Kokin Wakashū (anonymous)" },
				anonymous: true,
			},
			{ role: "composer", name: { ja: "林廣守", en: "Hayashi Hiromori" }, born: 1831, died: 1896 },
			{ role: "arranger", name: { ja: "フランツ・エッケルト", en: "Franz Eckert" }, born: 1852, died: 1916 },
		],
		published: 1880,
		lyrics: "sung",
		note: {
			ja: "上段が歌の旋律、下段が和音の伴奏です。伴奏は EveryonePiano のピアノ譜から読み取りました。",
			en: "The upper staff is the vocal melody and the lower staff is the chordal accompaniment, transcribed from a piano score by EveryonePiano.",
		},
	},
	{
		id: "star-spangled-banner",
		category: "anthems",
		title: "The Star-Spangled Banner",
		subtitle: { ja: "星条旗", en: "" },
		country: { ja: "アメリカ合衆国", en: "United States" },
		creators: [
			{ role: "lyricist", name: "Francis Scott Key", born: 1779, died: 1843 },
			{ role: "composer", name: "John Stafford Smith", born: 1750, died: 1836 },
		],
		published: 1814,
		lyrics: "sung",
	},
	{
		id: "god-save-the-king",
		category: "anthems",
		title: "God Save the King",
		subtitle: { ja: "国王陛下万歳", en: "" },
		country: { ja: "イギリス", en: "United Kingdom" },
		creators: [{ role: "lyricsMusic", name: { ja: "作者不詳", en: "Anonymous" }, anonymous: true }],
		published: 1745,
		lyrics: "sung",
	},
	{
		id: "la-marseillaise",
		category: "anthems",
		title: "La Marseillaise",
		subtitle: { ja: "ラ・マルセイエーズ", en: "" },
		country: { ja: "フランス", en: "France" },
		creators: [{ role: "lyricsMusic", name: "Claude Joseph Rouget de Lisle", born: 1760, died: 1836 }],
		published: 1792,
		lyrics: "text",
	},
	{
		id: "o-canada",
		category: "anthems",
		title: "O Canada",
		subtitle: { ja: "オー・カナダ", en: "" },
		country: { ja: "カナダ", en: "Canada" },
		creators: [
			{ role: "lyricistFrench", name: "Adolphe-Basile Routhier", born: 1839, died: 1920 },
			{ role: "composer", name: "Calixa Lavallée", born: 1842, died: 1891 },
		],
		published: 1880,
		lyrics: "text",
		note: {
			ja: "英語の公式歌詞は後年（1980年・2018年）の改訂を含むため収録していません。",
			en: "The official English lyrics include later revisions (1980 and 2018), so they are not included.",
		},
	},
	{
		id: "deutschlandlied",
		category: "anthems",
		title: "Das Lied der Deutschen",
		subtitle: { ja: "ドイツの歌", en: "Song of the Germans" },
		country: { ja: "ドイツ", en: "Germany" },
		creators: [
			{ role: "lyricist", name: "August Heinrich Hoffmann von Fallersleben", born: 1798, died: 1874 },
			{ role: "composer", name: "Joseph Haydn", born: 1732, died: 1809 },
		],
		published: 1841,
		lyrics: "sung",
		note: {
			ja: "国歌として歌われる第3節を収録。",
			en: "The third stanza, which is sung as the national anthem.",
		},
	},

	{
		id: "italy",
		category: "anthems",
		title: "Il Canto degli Italiani",
		subtitle: { ja: "イタリア人の歌", en: "The Song of the Italians" },
		country: { ja: "イタリア", en: "Italy" },
		creators: [
			{ role: "lyricist", name: "Goffredo Mameli", born: 1827, died: 1849 },
			{ role: "composer", name: "Michele Novaro", born: 1818, died: 1885 },
		],
		published: 1847,
		lyrics: "sung",
		note: {
			ja: "2017年の法律で国歌とされたノヴァーロの原譜に基づき、独唱の第1節と、合唱のリフレイン（テノールの上声）を収録しています。一般によく演奏される吹奏楽版とは、リフレインの旋律が異なります。",
			en: "Based on Novaro's original score, which a 2017 law made the national anthem: the solo first verse and the choral refrain (the upper tenor part). The refrain melody differs from the band arrangement that is often performed.",
		},
	},
	{
		id: "russia",
		category: "anthems",
		title: { ja: "ロシア連邦国歌", en: "State Anthem of the Russian Federation" },
		subtitle: "Государственный гимн Российской Федерации",
		country: { ja: "ロシア", en: "Russia" },
		creators: [{ role: "composer", name: { ja: "アレクサンドル・アレクサンドロフ", en: "Alexander Alexandrov" }, born: 1883, died: 1946 }],
		published: 1944,
		lyrics: "none",
		note: {
			ja: "旋律のみ。歌詞（セルゲイ・ミハルコフ、2009年没）は保護期間中のため収録していません。旋律は2000年の連邦憲法法律で定められた公式楽譜によります。",
			en: "Melody only. The lyrics (by Sergey Mikhalkov, d. 2009) are still under copyright. The melody follows the official score set by the Federal Constitutional Law of 2000.",
		},
	},

	// ---- クラシック・世界の民謡 ----
	{
		id: "ode-to-joy",
		category: "classical-folk",
		title: { ja: "歓喜の歌", en: "Ode to Joy" },
		subtitle: { ja: "交響曲第9番 第4楽章より", en: "From Symphony No. 9, 4th movement" },
		creators: [
			{ role: "lyricist", name: "Friedrich Schiller", born: 1759, died: 1805 },
			{ role: "composer", name: "Ludwig van Beethoven", born: 1770, died: 1827 },
		],
		published: 1824,
		lyrics: "sung",
	},
	{
		id: "twinkle-twinkle",
		category: "classical-folk",
		title: { ja: "きらきら星", en: "Twinkle, Twinkle, Little Star" },
		subtitle: { ja: "Twinkle, Twinkle, Little Star", en: "" },
		creators: [
			{ role: "lyricistEnglish", name: "Jane Taylor", born: 1783, died: 1824 },
			{ role: "composer", name: { ja: "フランス民謡", en: "French folk song" }, anonymous: true },
		],
		published: 1806,
		lyrics: "sung",
		note: {
			ja: "日本語詞（武鹿悦子）は保護期間中のため、英語の原詞を収録しています。",
			en: "The Japanese lyrics (by Buka Etsuko) are still under copyright, so the original English lyrics are used.",
		},
	},
	{
		id: "amazing-grace",
		category: "classical-folk",
		title: "Amazing Grace",
		subtitle: { ja: "アメイジング・グレイス", en: "" },
		creators: [
			{ role: "lyricist", name: "John Newton", born: 1725, died: 1807 },
			{
				role: "composer",
				name: { ja: "アメリカ民謡（New Britain）", en: "American folk tune (“New Britain”)" },
				anonymous: true,
			},
		],
		published: 1835,
		lyrics: "sung",
	},
	{
		id: "frere-jacques",
		category: "classical-folk",
		title: "Frère Jacques",
		subtitle: { ja: "フレール・ジャック（輪唱）", en: "A round" },
		creators: [{ role: "lyricsMusic", name: { ja: "フランス民謡", en: "French folk song" }, anonymous: true }],
		published: 1780,
		lyrics: "sung",
		note: {
			ja: "1〜4の番号の位置から追いかけて輪唱できます。",
			en: "Start from the numbers 1–4 to sing it as a round.",
		},
	},
	{
		id: "londonderry-air",
		category: "classical-folk",
		title: { ja: "ロンドンデリーの歌", en: "Londonderry Air" },
		subtitle: { ja: "Londonderry Air", en: "" },
		creators: [{ role: "composer", name: { ja: "アイルランド民謡", en: "Irish folk song" }, anonymous: true }],
		published: 1855,
		lyrics: "none",
	},
	{
		id: "goin-home",
		category: "classical-folk",
		title: { ja: "家路", en: "Going Home (Largo)" },
		subtitle: {
			ja: "交響曲第9番「新世界より」第2楽章",
			en: "From Symphony No. 9 “From the New World”, 2nd movement",
		},
		creators: [{ role: "composer", name: "Antonín Dvořák", born: 1841, died: 1904 }],
		published: 1893,
		lyrics: "none",
		note: {
			ja: "日本語詞「遠き山に日は落ちて」（堀内敬三、1983年没）は保護期間中のため収録していません。",
			en: "The Japanese lyrics “Tōki yama ni hi wa ochite” (by Horiuchi Keizō, d. 1983) are still under copyright and are not included.",
		},
	},
	{
		id: "minuet-in-g",
		category: "classical-folk",
		title: { ja: "メヌエット ト長調", en: "Minuet in G major" },
		subtitle: "BWV Anh. 114",
		creators: [{ role: "composer", name: "Christian Petzold", born: 1677, died: 1733 }],
		published: 1725,
		lyrics: "none",
		note: {
			ja: "長くバッハ作とされてきた曲。右手の旋律のみ。",
			en: "Long attributed to J. S. Bach. Right-hand melody only.",
		},
	},
	{
		id: "air-on-the-g-string",
		category: "classical-folk",
		title: { ja: "G線上のアリア", en: "Air on the G String" },
		subtitle: {
			ja: "管弦楽組曲第3番 BWV 1068 より「エア」",
			en: "Air from Orchestral Suite No. 3, BWV 1068",
		},
		creators: [{ role: "composer", name: "Johann Sebastian Bach", born: 1685, died: 1750 }],
		published: 1731,
		lyrics: "none",
		note: {
			ja: "「G線上のアリア」は、ヴィルヘルミが1871年にハ長調に移してヴァイオリンのG線だけで弾けるよう編曲したときの呼び名です。ここではバッハの原曲（ニ長調）の弦楽4部（第1・第2ヴァイオリン、ヴィオラ、通奏低音）を、音価を2倍にして収録しています。",
			en: "“Air on the G String” is the name of August Wilhelmj's 1871 arrangement, which moved the piece to C major so it could be played on the violin's G string alone. This is Bach's original four-part string setting in D major (violins I and II, viola, and continuo), written with doubled note values.",
		},
	},
	{
		id: "vivaldi-summer-3",
		category: "classical-folk",
		title: { ja: "四季「夏」第3楽章", en: "The Four Seasons: Summer, 3rd movement" },
		subtitle: { ja: "L'estate RV 315 より Presto（冒頭）", en: "L'estate, RV 315: Presto (opening)" },
		creators: [{ role: "composer", name: { ja: "アントニオ・ヴィヴァルディ", en: "Antonio Vivaldi" }, born: 1678, died: 1741 }],
		published: 1725,
		lyrics: "none",
		note: {
			ja: "嵐を描いた第3楽章の冒頭（第1〜40小節）を、独奏ヴァイオリンと通奏低音の2段で収録しています。第40小節は独奏パッセージに入る直前の D で終えています。",
			en: "The opening of the stormy third movement (bars 1–40), for solo violin and basso continuo. The excerpt ends on the D in bar 40, just before the solo passage begins.",
		},
	},
	{
		id: "greensleeves",
		category: "classical-folk",
		title: { ja: "グリーンスリーブス", en: "Greensleeves" },
		subtitle: { ja: "Greensleeves", en: "" },
		creators: [{ role: "composer", name: { ja: "イングランド民謡", en: "English folk song" }, anonymous: true }],
		published: 1580,
		lyrics: "none",
	},
];
