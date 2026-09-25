import { describe, expect, it } from "vitest";
import { abcToMidiBytes } from "../src/lib/abc-utils";
import { listVoicePrograms, setVoiceProgram } from "../src/lib/midi-program";
import { songs } from "../src/lib/songs";

/** 標準 MIDI ファイルの各トラックで、最初に出てくる音色の変更（program change）の番号 */
function trackPrograms(bytes: Uint8Array): (number | null)[] {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let pos = 8 + view.getUint32(4);
	const result: (number | null)[] = [];
	while (pos < bytes.length) {
		const len = view.getUint32(pos + 4);
		const end = pos + 8 + len;
		let p = pos + 8;
		let status = 0;
		let program: number | null = null;
		let hasNotes = false;
		const varlen = () => {
			let v = 0;
			let b: number;
			do {
				b = bytes[p++]!;
				v = (v << 7) | (b & 0x7f);
			} while (b & 0x80);
			return v;
		};
		while (p < end) {
			varlen();
			if (bytes[p]! & 0x80) status = bytes[p++]!;
			// varlen() は p を進めるので、「p += varlen()」とせずに長さを先に読む
			if (status === 0xff) {
				p++;
				const n = varlen();
				p += n;
			} else if (status === 0xf0 || status === 0xf7) {
				const n = varlen();
				p += n;
			} else if ((status & 0xf0) === 0xc0) {
				program ??= bytes[p];
				p++;
			} else if ((status & 0xf0) === 0xd0) {
				p += 1;
			} else {
				if ((status & 0xf0) === 0x90) hasNotes = true;
				p += 2;
			}
		}
		// 音符のあるトラックだけを数える（先頭のテンポなどだけのトラックは除く）
		if (hasNotes) result.push(program);
		pos = end;
	}
	return result;
}

const SINGLE = "X:1\nT:Test\nM:4/4\nL:1/4\nK:C\nCDEF|GABc|]\n";
const HEADER_VOICES = 'X:1\nT:Test\nM:4/4\nL:1/4\nV:S name="Soprano"\nV:B clef=bass\nK:C\n[V:S] CDEF|]\n[V:B] C,D,E,F,|]\n';

describe("%%MIDI program の読み書き", () => {
	it("声部のない曲では、K: の直後に曲全体の音色を書く", () => {
		expect(listVoicePrograms(SINGLE)).toEqual([{ id: null, name: "", program: null }]);
		const once = setVoiceProgram(SINGLE, null, 73);
		expect(once).toContain("K:C\n%%MIDI program 73\nCDEF");
		expect(listVoicePrograms(once)[0]!.program).toBe(73);
		expect(trackPrograms(abcToMidiBytes(once))).toEqual([73]);
		// 2 回目は行を増やさず書き換える
		const twice = setVoiceProgram(once, null, 40);
		expect(twice.match(/%%MIDI program/g)).toHaveLength(1);
		expect(trackPrograms(abcToMidiBytes(twice))).toEqual([40]);
	});

	it("[V:…] だけで書き分けている曲では、声部ごとの設定の行を足す", () => {
		expect(listVoicePrograms(HEADER_VOICES)).toEqual([
			{ id: "S", name: "Soprano", program: null },
			{ id: "B", name: "B", program: null },
		]);
		let abc = setVoiceProgram(HEADER_VOICES, "B", 42);
		abc = setVoiceProgram(abc, "S", 73);
		expect(listVoicePrograms(abc).map((v) => v.program)).toEqual([73, 42]);
		expect(trackPrograms(abcToMidiBytes(abc))).toEqual([73, 42]);
		abc = setVoiceProgram(abc, "B", 43);
		expect(abc.match(/%%MIDI program/g)).toHaveLength(2);
		expect(trackPrograms(abcToMidiBytes(abc))).toEqual([73, 43]);
	});

	it("声部の指定がない音符の前に足しても、音符の声部は変わらない", () => {
		const abc = "X:1\nT:Test\nM:4/4\nL:1/4\nV:1\nV:2\nK:C\nCDEF|]\nV:2\nC,D,E,F,|]\n";
		const out = setVoiceProgram(abc, "2", 42);
		// 本文にすでに V:2 行があるので、その直後に書く
		expect(out).toContain("V:2\n%%MIDI program 42\nC,D,E,F,");
		const first = setVoiceProgram(abc, "1", 73);
		expect(first).toContain("K:C\nV:1\n%%MIDI program 73\nCDEF");
		expect(trackPrograms(abcToMidiBytes(setVoiceProgram(first, "2", 42)))).toEqual([73, 42]);
	});

	it("収録曲の声部ごとの音色を読み取り、書き換えられる", () => {
		const air = songs.find((s) => s.id === "air-on-the-g-string")!;
		expect(listVoicePrograms(air.abc).map((v) => [v.name, v.program])).toEqual([
			["Violino I", 40],
			["Violino II", 40],
			["Viola", 41],
			["Continuo", 43],
		]);
		const changed = setVoiceProgram(air.abc, "V3", 42);
		expect(trackPrograms(abcToMidiBytes(changed))).toEqual([40, 40, 42, 43]);

		for (const song of songs) {
			const voices = listVoicePrograms(song.abc);
			expect(voices.length, song.id).toBeGreaterThan(0);
			let abc = song.abc;
			voices.forEach((v, i) => (abc = setVoiceProgram(abc, v.id, 70 + i)));
			expect(listVoicePrograms(abc).map((v) => v.program), song.id).toEqual(voices.map((_, i) => 70 + i));
			expect(trackPrograms(abcToMidiBytes(abc)), song.id).toEqual(voices.map((_, i) => 70 + i));
		}
	});
});
