import { describe, expect, it } from "vitest";
import abcjs from "abcjs";
import { localizedAbc, songs, unregisteredAbcIds } from "../src/lib/songs";
import { detectLang, tr } from "../src/i18n";
import { PD_DEATH_YEAR_LIMIT, SONGS } from "../src/songs/meta";
import { abcToMidiBytes } from "../src/lib/abc-utils";

/**
 * w: 行が何個の音符に割り当てられるかを、abcjs 自身に数えさせる。
 * 十分な数の音符を並べたダミーの曲に w: 行を付けてパースし、歌詞が付いた音符を数える。
 */
function countSyllables(w: string): number {
	const dummy = `X:1\nT:x\nL:1/4\nK:C\n${"C ".repeat(300)}|]\nw:${w}\n`;
	const voice = (abcjs.parseOnly(dummy)[0]!.lines[0]!.staff![0]!.voices![0] ?? []) as { el_type: string; lyric?: unknown }[];
	return voice.filter((el) => el.el_type === "note" && el.lyric).length;
}

interface LineGroup {
	music: string;
	lyrics: string[];
	/** 声部の番号（登場順、0 始まり）。abcjs では段（staff）の番号に対応する */
	voice: number;
	/** その声部の中で何番目の行か。abcjs では tune.lines の何段目かに対応する */
	system: number;
}

/** 本文を「音楽の行 + 直後の w: 行群」に分ける。[V:x] で始まる行は声部ごとに数える */
function musicLineGroups(abc: string): LineGroup[] {
	const lines = abc.split("\n");
	const body = lines.slice(lines.findIndex((l) => l.startsWith("K:")) + 1);
	const voices: string[] = [];
	const counts = new Map<string, number>();
	const groups: LineGroup[] = [];
	for (const line of body) {
		if (!line.trim() || line.startsWith("%")) continue;
		if (line.startsWith("w:")) {
			groups.at(-1)?.lyrics.push(line.slice(2));
			continue;
		}
		if (/^[A-Za-z]:/.test(line)) continue;
		const id = line.match(/^\[V:\s*([^\]\s]+)\]/)?.[1] ?? "";
		if (!voices.includes(id)) voices.push(id);
		const system = counts.get(id) ?? 0;
		counts.set(id, system + 1);
		groups.push({ music: line, lyrics: [], voice: voices.indexOf(id), system });
	}
	return groups;
}

type AbcEl = {
	el_type: string;
	duration?: number;
	rest?: unknown;
	type?: string;
	startTriplet?: number;
	tripletMultiplier?: number;
	endTriplet?: boolean;
};

describe("収録曲", () => {
	it("すべての .abc にメタデータがあり、すべてのメタデータに .abc がある", () => {
		expect(unregisteredAbcIds).toEqual([]);
		expect(songs.map((s) => s.id)).toEqual(SONGS.map((s) => s.id));
	});

	it("id が重複していない", () => {
		expect(new Set(SONGS.map((s) => s.id)).size).toBe(SONGS.length);
	});

	describe.each(songs.map((s) => [s.id, s] as const))("%s", (_id, song) => {
		const tune = abcjs.parseOnly(song.abc)[0]!;

		it("パース時に警告が出ない", () => {
			expect(tune.warnings ?? []).toEqual([]);
		});

		it("タイトルがある", () => {
			expect(tune.metaText.title).toBeTruthy();
		});

		it("パブリックドメインの条件を満たす", () => {
			for (const c of song.creators) {
				if (c.anonymous) {
					expect(song.published, `${c.name}`).toBeLessThanOrEqual(PD_DEATH_YEAR_LIMIT);
				} else {
					expect(c.died, `${c.name} の没年`).toBeDefined();
					expect(c.died!, `${c.name}`).toBeLessThanOrEqual(PD_DEATH_YEAR_LIMIT);
				}
			}
		});

		it("小節の長さが拍子と一致する（弱起・終止・反復記号の前後を除く）", () => {
			const meter = tune.getMeterFraction();
			const full = meter.num / (meter.den ?? 1);
			const staffCount = Math.max(...tune.lines.map((l) => l.staff?.length ?? 0));
			for (let st = 0; st < staffCount; st++) {
				const bars: { dur: number; endType: string }[] = [];
				let cur = 0;
				// 3連符などの中の音符は、書かれた長さに tripletMultiplier を掛けた長さで数える
				let multiplier = 1;
				for (const line of tune.lines) {
					for (const el of (line.staff?.[st]?.voices?.[0] ?? []) as AbcEl[]) {
						if (el.startTriplet) multiplier = el.tripletMultiplier ?? 1;
						if (el.el_type === "note") cur += (el.duration ?? 0) * multiplier;
						if (el.endTriplet) multiplier = 1;
						if (el.el_type === "bar") {
							bars.push({ dur: cur, endType: el.type ?? "" });
							cur = 0;
						}
					}
				}
				if (cur > 0) bars.push({ dur: cur, endType: "end" });
				const bad = bars.filter((b, i) => {
					if (Math.abs(b.dur - full) < 1e-6 || b.dur === 0) return false;
					const prev = bars[i - 1];
					const isEdge = i === 0 || i === bars.length - 1;
					const nearRepeat = b.endType !== "bar_thin" || (prev && prev.endType !== "bar_thin");
					// 弱起の小節は短い
					return !((isEdge || nearRepeat) && b.dur < full);
				});
				expect(bad.map((b) => `${st + 1}段目 ${bars.indexOf(b) + 1}小節目: ${b.dur}`)).toEqual([]);
			}
		});

		it("歌詞の音節数が各行の音符数と一致する", () => {
			const groups = musicLineGroups(song.abc);
			const staffLines = tune.lines.filter((l) => l.staff);
			const voiceCount = Math.max(...groups.map((g) => g.voice)) + 1;
			expect(staffLines.length * voiceCount).toBe(groups.length);
			for (const g of groups) {
				if (g.lyrics.length === 0) continue;
				const notes = ((staffLines[g.system]!.staff![g.voice]!.voices![0] ?? []) as AbcEl[]).filter(
					(el) => el.el_type === "note" && !el.rest,
				).length;
				for (const w of g.lyrics) {
					expect(countSyllables(w), `${g.system + 1}段目（声部${g.voice + 1}）: ${w}`).toBe(notes);
				}
			}
			if (song.lyrics === "sung") expect(groups.some((g) => g.lyrics.length > 0)).toBe(true);
			else expect(groups.every((g) => g.lyrics.length === 0)).toBe(true);
		});

		it("英語表示用の ABC も警告なくパースでき、見出しが英語になる", () => {
			const en = abcjs.parseOnly(localizedAbc(song, "en"))[0]!;
			expect(en.warnings ?? []).toEqual([]);
			expect(en.metaText.title).toBe(tr(song.title, "en"));
			expect(en.metaText.composer ?? "").not.toMatch(/[\u3040-\u30ff\u4e00-\u9fff]/);
			// 音符の部分は変わらない
			const body = (abc: string) => abc.slice(abc.indexOf("\nK:"));
			expect(body(localizedAbc(song, "en"))).toBe(body(song.abc));
			expect(localizedAbc(song, "ja")).toBe(song.abc);
		});

		it("英語の表記に日本語が混ざっていない", () => {
			const jp = /[\u3040-\u30ff\u4e00-\u9fff]/;
			const texts = [song.title, song.subtitle, song.country, song.note, ...song.creators.map((c) => c.name)];
			for (const text of texts) if (text) expect(tr(text, "en")).not.toMatch(jp);
		});

		it("MIDI を生成できる", () => {
			const bytes = abcToMidiBytes(song.abc);
			expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("MThd");
			expect(bytes.length).toBeGreaterThan(100);
		});
	});
});

describe("表示言語の判定", () => {
	it("第一言語が日本語なら日本語、それ以外は英語", () => {
		expect(detectLang(["ja"])).toBe("ja");
		expect(detectLang(["ja-JP", "en-US"])).toBe("ja");
		expect(detectLang(["en-US", "ja"])).toBe("en");
		expect(detectLang(["fr-FR"])).toBe("en");
		expect(detectLang([])).toBe("en");
	});
});
