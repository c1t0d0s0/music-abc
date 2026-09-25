/**
 * 表示言語の切り替え。
 * ブラウザの第一言語が日本語なら日本語、それ以外は英語で表示する。
 * 言語はページの読み込み時に一度だけ決める。
 */

export type Lang = "ja" | "en";

/** 言語ごとの文字列 */
export type Localized = { ja: string; en: string };

export function detectLang(languages?: readonly string[]): Lang {
	const list =
		languages ??
		(typeof navigator === "undefined"
			? []
			: navigator.languages?.length
				? navigator.languages
				: [navigator.language]);
	return (list[0] ?? "").toLowerCase().startsWith("ja") ? "ja" : "en";
}

export const lang: Lang = detectLang();

/** 言語ごとの文字列から、表示中の言語のものを選ぶ。どちらの言語でも同じなら文字列のまま渡せる */
export function tr(text: Localized | string, to: Lang = lang): string {
	return typeof text === "string" ? text : text[to];
}

const ja = {
	siteName: "ABC 譜面スタジオ",
	siteDescription:
		"ABC記譜の譜面を表示・編集・再生・MIDIダウンロードできるWebアプリ。著作権の切れた唱歌・国歌・名曲を収録。",
	nav: { label: "メインメニュー", library: "曲をさがす", editor: "エディタ", about: "ライセンス" },
	pageTitle: { editor: "エディタ", about: "このサイトについて" },
	footer: {
		before: "譜面の表示・再生には ",
		abcjs: "（MIT License）を、エディタには ",
		abcjsEditor: "（MIT License）の一部を利用しています。収録曲はすべて著作権の保護期間が満了した作品です。",
		link: "ライセンスと権利情報",
	},
	library: {
		heading: "名曲を楽譜で見て聴いて編集する。",
		introBefore: "唱歌・各国の国歌・クラシックの名旋律を",
		abcNotation: "ABC 記法",
		introAfter:
			"で収録しています。曲を選ぶと楽譜の表示と再生ができ、MIDI や WAV でダウンロードしたり、エディタで書き換えたりできます。",
		searchLabel: "曲名・作者で検索",
		searchPlaceholder: "曲名・作者で検索（例：滝廉太郎、国歌、Beethoven）",
		year: (y: number) => `${y}年`,
		noResults: (q: string) => `「${q}」に一致する曲はありません。`,
	},
	lyrics: { sung: "歌詞つき", text: "歌詞は本文", none: "旋律のみ" },
	song: {
		breadcrumb: "パンくずリスト",
		published: "発表",
		rights: "権利",
		publicDomain: "パブリックドメイン",
		years: (born: number | undefined, died: number) => `（${born ?? "?"}–${died}）`,
		transpose: "移調",
		original: "原調",
		semitones: (n: number) => `${n > 0 ? "+" : "−"}${Math.abs(n)} 半音`,
		openInEditor: "エディタで開く",
		hint: "音符をクリック（タップ）すると、その音だけを鳴らせます。再生バーの「%」でテンポを変えられます。",
		viewSource: "ABC 記法のソースを見る",
		pager: "前後の曲",
		notFound: "曲が見つかりません",
		backToList: "曲の一覧に戻る",
	},
	score: {
		controls: "再生コントロール",
		noAudio: "このブラウザは Web Audio に対応していないため再生できません。",
		audioError: (msg: string) => `音声の準備に失敗しました: ${msg}`,
		volume: "音量",
		mute: "ミュート",
		unmute: "ミュートを解除",
	},
	download: {
		group: "ダウンロード",
		wavBusy: "WAV を作成中…",
		print: "印刷",
		error: (msg: string) => `ダウンロードに失敗しました: ${msg}`,
		midiError: "MIDI を生成できませんでした",
		parseError: "ABC を解析できませんでした",
	},
	editor: {
		heading: "ABC エディタ",
		lead: "左の欄（スマートフォンでは上の欄）に ABC 記法を書くと、右（下）の楽譜がすぐに更新されます。内容はこのブラウザに自動で保存されます。",
		new: "新規",
		openFile: "ファイルを開く",
		loadSong: "収録曲から読み込む…",
		loadSongLabel: "収録曲から読み込む",
		scoreTools: "楽譜を用意する",
		filterSongs: "曲名・作者で絞り込む",
		noSongMatch: (q: string) => `「${q}」に一致する曲はありません`,
		inputLabel: "ABC 入力",
		textareaLabel: "ABC 記法の入力欄",
		placeholder: "ここに ABC 記法を入力",
		scoreLabel: "楽譜",
		confirmReplace: "編集中の内容を置き換えますか？",
		confirmReplaceSaved: (title: string) =>
			`エディタに保存されている内容を「${title}」で置き換えますか？\n（キャンセルすると保存されている内容を開きます）`,
		defaultAbc: `X:1
T:新しい曲
C:作曲者
M:4/4
L:1/4
Q:1/4=100
K:C
% ↓ ここに音符を書きます（C D E F G A B c = ドレミファソラシド）
C D E F | G A B c | c B A G | F E D C |]
w: ド レ ミ ファ ソ ラ シ ド ド シ ラ ソ ファ ミ レ ド
`,
		cheat: {
			summary: "ABC 記法のかんたんな書き方",
			rows: [
				["ヘッダー", "`T:` 曲名、`C:` 作曲者、`M:` 拍子、`L:` 基準の音の長さ、`Q:` テンポ、`K:` 調（ヘッダーの最後に書く）"],
				["音の高さ", "`C D E F G A B` がドレミファソラシ。`c` は1オクターブ上、`C,` は1オクターブ下"],
				["臨時記号", "`^F` シャープ、`_B` フラット、`=F` ナチュラル"],
				["音の長さ", "`C2` は L: の2倍、`C/` は半分、`C3/2` は付点。`z` は休符"],
				["小節線", "`|` 小節線、`|]` 終止線、`|: :|` 反復"],
				["和音・コード", '`[CEG]` で和音、`"C"` のように音符の前に書くとコードネーム'],
				["歌詞", "音符の行の次に `w:` 行を書く。音節は空白かハイフンで区切り、`_` で前の音節を伸ばす"],
			] as [string, string][],
			moreBefore: "詳しくは",
			moreLink: "ABC 記法の規格（英語）",
			moreAfter: "を参照してください。",
		},
	},
	categories: {
		school: {
			title: "学校で歌う歌",
			description: "小学校・中学校の音楽の教科書でおなじみの唱歌・童謡・日本古謡",
		},
		anthems: { title: "各国の国歌", description: "作詞・作曲者の没後、保護期間が満了した国歌" },
		"classical-folk": { title: "クラシック・世界の民謡", description: "鑑賞曲や器楽で親しまれる名旋律" },
	},
	roles: {
		lyricist: "作詞",
		composer: "作曲",
		lyricsMusic: "作詞・作曲",
		lyricsSource: "歌詞",
		arranger: "編曲",
		reviser: "補作編曲",
		lyricistFrench: "作詞（仏語）",
		lyricistEnglish: "作詞（英語）",
	},
	about: {
		heading: "このサイトについて",
		toc: "目次",
		tocSongs: "収録曲の権利",
		tocAbc: "楽譜データのライセンス",
		tocOss: "オープンソースソフトウェア",
		tocSoundfont: "再生に使う音源",
		songsHeading: "収録曲の権利について",
		thSong: "曲名",
		thCreators: "作詞・作曲など",
		thPublished: "発表",
		thLyrics: "歌詞",
		died: (y: number) => `（${y}年没）`,
		lyricsTable: { sung: "音符に付けて収録", text: "本文のみ収録", none: "なし（旋律のみ）" },
		abcHeading: "楽譜データ（ABC）のライセンス",
		ossHeading: "利用しているオープンソースソフトウェア",
		licenseText: "ライセンス全文",
		soundfontHeading: "再生に使う音源",
		analyticsHeading: "アクセス解析",
		disclaimerHeading: "免責事項",
	},
};

export type Messages = typeof ja;

const en: Messages = {
	siteName: "ABC Score Studio",
	siteDescription:
		"View, edit, and play sheet music written in ABC notation and download it as MIDI. Includes public-domain school songs, national anthems, and classical melodies.",
	nav: { label: "Main menu", library: "Songs", editor: "Editor", about: "Licenses" },
	pageTitle: { editor: "Editor", about: "About" },
	footer: {
		before: "Scores are rendered and played with ",
		abcjs: " (MIT License), and the editor uses parts of ",
		abcjsEditor: " (MIT License). All songs in this library are in the public domain.",
		link: "Licenses and rights",
	},
	library: {
		heading: "See, hear, and edit great songs as sheet music.",
		introBefore: "Japanese school songs, national anthems, and classical melodies, written in ",
		abcNotation: "ABC notation",
		introAfter:
			". Choose a song to view and play its score, download it as MIDI or WAV, or change it in the editor.",
		searchLabel: "Search by title or author",
		searchPlaceholder: "Search by title or author (e.g. Taki, anthem, Beethoven)",
		year: (y: number) => String(y),
		noResults: (q: string) => `No songs match “${q}”.`,
	},
	lyrics: { sung: "With lyrics", text: "Lyrics as text", none: "Melody only" },
	song: {
		breadcrumb: "Breadcrumb",
		published: "Published",
		rights: "Rights",
		publicDomain: "Public domain",
		years: (born: number | undefined, died: number) => ` (${born ?? "?"}–${died})`,
		transpose: "Transpose",
		original: "Original key",
		semitones: (n: number) => `${n > 0 ? "+" : "−"}${Math.abs(n)} semitone${Math.abs(n) === 1 ? "" : "s"}`,
		openInEditor: "Open in editor",
		hint: "Click (or tap) a note to hear just that note. Use the “%” box in the player to change the tempo.",
		viewSource: "View the ABC source",
		pager: "Previous and next songs",
		notFound: "Song not found",
		backToList: "Back to the song list",
	},
	score: {
		controls: "Playback controls",
		noAudio: "This browser does not support Web Audio, so playback is not available.",
		audioError: (msg: string) => `Could not prepare the audio: ${msg}`,
		volume: "Volume",
		mute: "Mute",
		unmute: "Unmute",
	},
	download: {
		group: "Download",
		wavBusy: "Creating WAV…",
		print: "Print",
		error: (msg: string) => `Download failed: ${msg}`,
		midiError: "Could not create the MIDI file",
		parseError: "Could not parse the ABC",
	},
	editor: {
		heading: "ABC Editor",
		lead: "Type ABC notation on the left (above on phones) and the score on the right (below) updates as you type. Your work is saved in this browser automatically.",
		new: "New",
		openFile: "Open file",
		loadSong: "Load a song from the library…",
		loadSongLabel: "Load a song from the library",
		scoreTools: "Get a score",
		filterSongs: "Filter by title or author",
		noSongMatch: (q: string) => `No songs match “${q}”`,
		inputLabel: "ABC input",
		textareaLabel: "ABC notation",
		placeholder: "Type ABC notation here",
		scoreLabel: "Score",
		confirmReplace: "Replace what you are editing?",
		confirmReplaceSaved: (title: string) =>
			`Replace the tune saved in the editor with “${title}”?\n(Choose Cancel to open the saved tune instead.)`,
		defaultAbc: `X:1
T:New Tune
C:Composer
M:4/4
L:1/4
Q:1/4=100
K:C
% Write your notes below (C D E F G A B c = do re mi fa sol la ti do)
C D E F | G A B c | c B A G | F E D C |]
w: do re mi fa sol la ti do do ti la sol fa mi re do
`,
		cheat: {
			summary: "ABC notation basics",
			rows: [
				["Header", "`T:` title, `C:` composer, `M:` meter, `L:` default note length, `Q:` tempo, `K:` key (always the last header line)"],
				["Pitch", "`C D E F G A B` are the notes from middle C. `c` is an octave higher and `C,` an octave lower"],
				["Accidentals", "`^F` sharp, `_B` flat, `=F` natural"],
				["Length", "`C2` is twice the L: length, `C/` is half, `C3/2` is dotted. `z` is a rest"],
				["Bar lines", "`|` bar line, `|]` final bar, `|: :|` repeat"],
				["Chords", '`[CEG]` for a chord; `"C"` before a note for a chord symbol'],
				["Lyrics", "Put a `w:` line below the line of notes. Separate syllables with spaces or hyphens; `_` holds the previous syllable"],
			] as [string, string][],
			moreBefore: "For details, see the",
			moreLink: "ABC notation standard",
			moreAfter: ".",
		},
	},
	categories: {
		school: {
			title: "School songs",
			description: "Shōka, children's songs, and traditional songs from Japanese elementary and junior high school music textbooks",
		},
		anthems: {
			title: "National anthems",
			description: "Anthems whose lyricists and composers died long enough ago that their copyright has expired",
		},
		"classical-folk": {
			title: "Classical and folk",
			description: "Well-loved melodies from classical music and folk traditions around the world",
		},
	},
	roles: {
		lyricist: "Lyrics",
		composer: "Music",
		lyricsMusic: "Lyrics & music",
		lyricsSource: "Text",
		arranger: "Arrangement",
		reviser: "Revised by",
		lyricistFrench: "French lyrics",
		lyricistEnglish: "English lyrics",
	},
	about: {
		heading: "About this site",
		toc: "Contents",
		tocSongs: "Song rights",
		tocAbc: "License of the scores",
		tocOss: "Open-source software",
		tocSoundfont: "Sound font",
		songsHeading: "Rights of the songs",
		thSong: "Song",
		thCreators: "Lyrics, music, etc.",
		thPublished: "Published",
		thLyrics: "Lyrics",
		died: (y: number) => ` (d. ${y})`,
		lyricsTable: { sung: "Set to the notes", text: "Text only", none: "None (melody only)" },
		abcHeading: "License of the scores (ABC files)",
		ossHeading: "Open-source software used",
		licenseText: "Full license text",
		soundfontHeading: "Sound font used for playback",
		analyticsHeading: "Analytics",
		disclaimerHeading: "Disclaimer",
	},
};

/** 表示中の言語のメッセージ */
export const t: Messages = lang === "ja" ? ja : en;

export const messagesFor = (to: Lang): Messages => (to === "ja" ? ja : en);
