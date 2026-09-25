/**
 * エディタで選べる再生の音色（General MIDI の番号）。
 * 音源は abcjs が使う FluidR3_GM で、128 種類すべてがそろっているが、よく使うものに絞って並べる。
 */
import type { Localized } from "../i18n";

export interface Instrument {
	program: number;
	name: Localized;
}

export interface InstrumentGroup {
	title: Localized;
	instruments: Instrument[];
}

export const INSTRUMENT_GROUPS: InstrumentGroup[] = [
	{
		title: { ja: "鍵盤楽器", en: "Keyboards" },
		instruments: [
			{ program: 0, name: { ja: "ピアノ", en: "Piano" } },
			{ program: 4, name: { ja: "エレクトリック・ピアノ", en: "Electric piano" } },
			{ program: 6, name: { ja: "チェンバロ", en: "Harpsichord" } },
			{ program: 19, name: { ja: "パイプオルガン", en: "Church organ" } },
			{ program: 21, name: { ja: "アコーディオン", en: "Accordion" } },
		],
	},
	{
		title: { ja: "鉄琴・木琴", en: "Mallets and bells" },
		instruments: [
			{ program: 8, name: { ja: "チェレスタ", en: "Celesta" } },
			{ program: 10, name: { ja: "オルゴール", en: "Music box" } },
			{ program: 11, name: { ja: "ビブラフォン", en: "Vibraphone" } },
			{ program: 12, name: { ja: "マリンバ", en: "Marimba" } },
			{ program: 13, name: { ja: "シロフォン", en: "Xylophone" } },
		],
	},
	{
		title: { ja: "弦楽器", en: "Strings" },
		instruments: [
			{ program: 24, name: { ja: "クラシックギター", en: "Nylon guitar" } },
			{ program: 25, name: { ja: "アコースティックギター", en: "Steel guitar" } },
			{ program: 40, name: { ja: "バイオリン", en: "Violin" } },
			{ program: 41, name: { ja: "ビオラ", en: "Viola" } },
			{ program: 42, name: { ja: "チェロ", en: "Cello" } },
			{ program: 43, name: { ja: "コントラバス", en: "Contrabass" } },
			{ program: 46, name: { ja: "ハープ", en: "Harp" } },
			{ program: 48, name: { ja: "弦楽合奏", en: "String ensemble" } },
		],
	},
	{
		title: { ja: "管楽器", en: "Winds" },
		instruments: [
			{ program: 73, name: { ja: "フルート", en: "Flute" } },
			{ program: 74, name: { ja: "リコーダー", en: "Recorder" } },
			{ program: 68, name: { ja: "オーボエ", en: "Oboe" } },
			{ program: 71, name: { ja: "クラリネット", en: "Clarinet" } },
			{ program: 70, name: { ja: "ファゴット", en: "Bassoon" } },
			{ program: 65, name: { ja: "アルト・サックス", en: "Alto sax" } },
			{ program: 56, name: { ja: "トランペット", en: "Trumpet" } },
			{ program: 57, name: { ja: "トロンボーン", en: "Trombone" } },
			{ program: 60, name: { ja: "ホルン", en: "French horn" } },
			{ program: 22, name: { ja: "ハーモニカ", en: "Harmonica" } },
		],
	},
	{
		title: { ja: "声・その他", en: "Voices and more" },
		instruments: [
			{ program: 52, name: { ja: "合唱", en: "Choir" } },
			{ program: 53, name: { ja: "ハミング", en: "Humming voice" } },
			{ program: 79, name: { ja: "オカリナ", en: "Ocarina" } },
			{ program: 78, name: { ja: "口笛", en: "Whistle" } },
			{ program: 80, name: { ja: "電子音（矩形波）", en: "Square-wave synth" } },
		],
	},
];

export const INSTRUMENTS: Instrument[] = INSTRUMENT_GROUPS.flatMap((g) => g.instruments);

/** 一覧にない番号は、番号をそのまま名前にする（ABC に直接書かれた音色など） */
export function findInstrument(program: number): Instrument {
	return (
		INSTRUMENTS.find((i) => i.program === program) ?? {
			program,
			name: { ja: `音色 ${program}`, en: `Program ${program}` },
		}
	);
}
