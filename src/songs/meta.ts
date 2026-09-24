/**
 * 収録曲の権利情報。
 *
 * 日本の著作権法では保護期間は著作者の死後70年だが、2018年12月30日の延長は
 * 遡らないため、1967年以前に亡くなった著作者の作品は保護期間が満了している。
 * 作者不詳・団体名義の作品は公表後の年数で判断する。
 * いずれの曲も、ABC 譜は本プロジェクトが旋律だけを書き起こしたもの（CC0）。
 */

export type Category = "school" | "anthems" | "classical-folk";

export interface Creator {
	role: string;
	name: string;
	born?: number;
	died?: number;
	/** 作者不詳・民謡・団体名義など、個人の没年で判断できないもの */
	anonymous?: boolean;
}

export interface SongMeta {
	id: string;
	category: Category;
	/** 表示用の短い曲名 */
	title: string;
	/** 読み・原題など */
	subtitle?: string;
	country?: string;
	creators: Creator[];
	/** 初出年（旋律または歌詞の古い方ではなく、収録版の公表年） */
	published: number;
	/** 譜面上の歌詞: "sung" = 音符に付けて表示、"text" = 譜面の下に本文のみ、"none" = なし */
	lyrics: "sung" | "text" | "none";
	note?: string;
}

export const CATEGORY_LABELS: Record<Category, { title: string; description: string }> = {
	school: {
		title: "学校で歌う歌",
		description: "小学校・中学校の音楽の教科書でおなじみの唱歌・童謡・日本古謡",
	},
	anthems: {
		title: "各国の国歌",
		description: "作詞・作曲者の没後、保護期間が満了した国歌",
	},
	"classical-folk": {
		title: "クラシック・世界の民謡",
		description: "鑑賞曲や器楽で親しまれる名旋律",
	},
};

export const PD_DEATH_YEAR_LIMIT = 1967;

export const SONGS: SongMeta[] = [
	// ---- 学校で歌う歌 ----
	{
		id: "furusato",
		category: "school",
		title: "ふるさと",
		subtitle: "故郷",
		creators: [
			{ role: "作詞", name: "高野辰之", born: 1876, died: 1947 },
			{ role: "作曲", name: "岡野貞一", born: 1878, died: 1941 },
		],
		published: 1914,
		lyrics: "sung",
		note: "尋常小学唱歌。1〜3番を収録。",
	},
	{
		id: "haru-no-ogawa",
		category: "school",
		title: "春の小川",
		creators: [
			{ role: "作詞", name: "高野辰之", born: 1876, died: 1947 },
			{ role: "作曲", name: "岡野貞一", born: 1878, died: 1941 },
		],
		published: 1912,
		lyrics: "sung",
		note: "1912年の原詞を収録。1942年以降の改詞（林柳波、1974年没）は保護期間中のため使っていません。",
	},
	{
		id: "akatombo",
		category: "school",
		title: "赤とんぼ",
		creators: [
			{ role: "作詞", name: "三木露風", born: 1889, died: 1964 },
			{ role: "作曲", name: "山田耕筰", born: 1886, died: 1965 },
		],
		published: 1927,
		lyrics: "sung",
	},
	{
		id: "natsu-wa-kinu",
		category: "school",
		title: "夏は来ぬ",
		creators: [
			{ role: "作詞", name: "佐佐木信綱", born: 1872, died: 1963 },
			{ role: "作曲", name: "小山作之助", born: 1864, died: 1927 },
		],
		published: 1896,
		lyrics: "sung",
	},
	{
		id: "hamabe-no-uta",
		category: "school",
		title: "浜辺の歌",
		creators: [
			{ role: "作詞", name: "林古渓", born: 1875, died: 1947 },
			{ role: "作曲", name: "成田為三", born: 1893, died: 1945 },
		],
		published: 1918,
		lyrics: "none",
	},
	{
		id: "kaeru-no-gassho",
		category: "school",
		title: "かえるの合唱",
		subtitle: "Froschgesang",
		creators: [{ role: "作曲", name: "ドイツ民謡", anonymous: true }],
		published: 1942,
		lyrics: "none",
		note: "旋律のみ。日本語詞（岡本敏明、1977年没）は保護期間中のため収録していません。1〜4の番号の位置から追いかけて輪唱できます。",
	},
	{
		id: "chatsumi",
		category: "school",
		title: "茶摘み",
		creators: [{ role: "作詞・作曲", name: "文部省唱歌（作者不詳）", anonymous: true }],
		published: 1912,
		lyrics: "sung",
	},
	{
		id: "hana",
		category: "school",
		title: "花",
		creators: [
			{ role: "作詞", name: "武島羽衣", born: 1872, died: 1967 },
			{ role: "作曲", name: "滝廉太郎", born: 1879, died: 1903 },
		],
		published: 1900,
		lyrics: "none",
		note: "組歌「四季」の第1曲。二部合唱の主旋律のみ。",
	},
	{
		id: "kojo-no-tsuki",
		category: "school",
		title: "荒城の月",
		creators: [
			{ role: "作詞", name: "土井晩翠", born: 1871, died: 1952 },
			{ role: "作曲", name: "滝廉太郎", born: 1879, died: 1903 },
			{ role: "補作編曲", name: "山田耕筰", born: 1886, died: 1965 },
		],
		published: 1901,
		lyrics: "sung",
		note: "一般に歌われる山田耕筰の補作版（ニ短調）。",
	},
	{
		id: "sakura-sakura",
		category: "school",
		title: "さくら さくら",
		creators: [{ role: "作詞・作曲", name: "日本古謡", anonymous: true }],
		published: 1888,
		lyrics: "sung",
	},
	{
		id: "hotaru-no-hikari",
		category: "school",
		title: "蛍の光",
		subtitle: "Auld Lang Syne",
		creators: [
			{ role: "作詞", name: "稲垣千穎", born: 1845, died: 1913 },
			{ role: "作曲", name: "スコットランド民謡", anonymous: true },
		],
		published: 1881,
		lyrics: "sung",
	},
	{
		id: "hanyu-no-yado",
		category: "school",
		title: "埴生の宿",
		subtitle: "Home! Sweet Home!",
		creators: [
			{ role: "作詞", name: "里見義", born: 1824, died: 1886 },
			{ role: "作曲", name: "ヘンリー・ビショップ", born: 1786, died: 1855 },
		],
		published: 1889,
		lyrics: "sung",
	},

	// ---- 各国の国歌 ----
	{
		id: "kimigayo",
		category: "anthems",
		title: "君が代",
		country: "日本",
		creators: [
			{ role: "歌詞", name: "古今和歌集（詠み人知らず）", anonymous: true },
			{ role: "作曲", name: "林廣守", born: 1831, died: 1896 },
			{ role: "編曲", name: "フランツ・エッケルト", born: 1852, died: 1916 },
		],
		published: 1880,
		lyrics: "sung",
	},
	{
		id: "star-spangled-banner",
		category: "anthems",
		title: "The Star-Spangled Banner",
		subtitle: "星条旗",
		country: "アメリカ合衆国",
		creators: [
			{ role: "作詞", name: "Francis Scott Key", born: 1779, died: 1843 },
			{ role: "作曲", name: "John Stafford Smith", born: 1750, died: 1836 },
		],
		published: 1814,
		lyrics: "sung",
	},
	{
		id: "god-save-the-king",
		category: "anthems",
		title: "God Save the King",
		subtitle: "国王陛下万歳",
		country: "イギリス",
		creators: [{ role: "作詞・作曲", name: "作者不詳", anonymous: true }],
		published: 1745,
		lyrics: "sung",
	},
	{
		id: "la-marseillaise",
		category: "anthems",
		title: "La Marseillaise",
		subtitle: "ラ・マルセイエーズ",
		country: "フランス",
		creators: [{ role: "作詞・作曲", name: "Claude Joseph Rouget de Lisle", born: 1760, died: 1836 }],
		published: 1792,
		lyrics: "text",
	},
	{
		id: "o-canada",
		category: "anthems",
		title: "O Canada",
		subtitle: "オー・カナダ",
		country: "カナダ",
		creators: [
			{ role: "作詞（仏語）", name: "Adolphe-Basile Routhier", born: 1839, died: 1920 },
			{ role: "作曲", name: "Calixa Lavallée", born: 1842, died: 1891 },
		],
		published: 1880,
		lyrics: "text",
		note: "英語の公式歌詞は後年（1980年・2018年）の改訂を含むため収録していません。",
	},
	{
		id: "deutschlandlied",
		category: "anthems",
		title: "Das Lied der Deutschen",
		subtitle: "ドイツの歌",
		country: "ドイツ",
		creators: [
			{ role: "作詞", name: "August Heinrich Hoffmann von Fallersleben", born: 1798, died: 1874 },
			{ role: "作曲", name: "Joseph Haydn", born: 1732, died: 1809 },
		],
		published: 1841,
		lyrics: "sung",
		note: "国歌として歌われる第3節を収録。",
	},

	// ---- クラシック・世界の民謡 ----
	{
		id: "ode-to-joy",
		category: "classical-folk",
		title: "歓喜の歌",
		subtitle: "交響曲第9番 第4楽章より",
		creators: [
			{ role: "作詞", name: "Friedrich Schiller", born: 1759, died: 1805 },
			{ role: "作曲", name: "Ludwig van Beethoven", born: 1770, died: 1827 },
		],
		published: 1824,
		lyrics: "sung",
	},
	{
		id: "twinkle-twinkle",
		category: "classical-folk",
		title: "きらきら星",
		subtitle: "Twinkle, Twinkle, Little Star",
		creators: [
			{ role: "作詞（英語）", name: "Jane Taylor", born: 1783, died: 1824 },
			{ role: "作曲", name: "フランス民謡", anonymous: true },
		],
		published: 1806,
		lyrics: "sung",
		note: "日本語詞（武鹿悦子）は保護期間中のため、英語の原詞を収録しています。",
	},
	{
		id: "amazing-grace",
		category: "classical-folk",
		title: "Amazing Grace",
		subtitle: "アメイジング・グレイス",
		creators: [
			{ role: "作詞", name: "John Newton", born: 1725, died: 1807 },
			{ role: "作曲", name: "アメリカ民謡（New Britain）", anonymous: true },
		],
		published: 1835,
		lyrics: "sung",
	},
	{
		id: "frere-jacques",
		category: "classical-folk",
		title: "Frère Jacques",
		subtitle: "フレール・ジャック（輪唱）",
		creators: [{ role: "作詞・作曲", name: "フランス民謡", anonymous: true }],
		published: 1780,
		lyrics: "sung",
		note: "1〜4の番号の位置から追いかけて輪唱できます。",
	},
	{
		id: "londonderry-air",
		category: "classical-folk",
		title: "ロンドンデリーの歌",
		subtitle: "Londonderry Air",
		creators: [{ role: "作曲", name: "アイルランド民謡", anonymous: true }],
		published: 1855,
		lyrics: "none",
	},
	{
		id: "goin-home",
		category: "classical-folk",
		title: "家路",
		subtitle: "交響曲第9番「新世界より」第2楽章",
		creators: [{ role: "作曲", name: "Antonín Dvořák", born: 1841, died: 1904 }],
		published: 1893,
		lyrics: "none",
		note: "日本語詞「遠き山に日は落ちて」（堀内敬三、1983年没）は保護期間中のため収録していません。",
	},
	{
		id: "minuet-in-g",
		category: "classical-folk",
		title: "メヌエット ト長調",
		subtitle: "BWV Anh. 114",
		creators: [{ role: "作曲", name: "Christian Petzold", born: 1677, died: 1733 }],
		published: 1725,
		lyrics: "none",
		note: "長くバッハ作とされてきた曲。右手の旋律のみ。",
	},
	{
		id: "air-on-the-g-string",
		category: "classical-folk",
		title: "G線上のアリア",
		subtitle: "管弦楽組曲第3番 BWV 1068 より「エア」",
		creators: [{ role: "作曲", name: "Johann Sebastian Bach", born: 1685, died: 1750 }],
		published: 1731,
		lyrics: "none",
		note: "「G線上のアリア」は、ヴィルヘルミが1871年にハ長調に移してヴァイオリンのG線だけで弾けるよう編曲したときの呼び名です。ここではバッハの原曲（ニ長調）の第1ヴァイオリンの旋律を収録しています。",
	},
	{
		id: "greensleeves",
		category: "classical-folk",
		title: "グリーンスリーブス",
		subtitle: "Greensleeves",
		creators: [{ role: "作曲", name: "イングランド民謡", anonymous: true }],
		published: 1580,
		lyrics: "none",
	},
];
