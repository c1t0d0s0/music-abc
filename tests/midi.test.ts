import { describe, expect, it } from "vitest";
import { abcToMidiBytes } from "../src/lib/abc-utils";
import { songs } from "../src/lib/songs";

interface MidiNote {
	on: number;
	off: number;
	pitch: number;
}

/** 標準 MIDI ファイルのトラックごとの音と、テンポ（4分音符あたりのマイクロ秒） */
function readMidi(bytes: Uint8Array): { tracks: MidiNote[][]; tempo: number | null; bad: number } {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let pos = 8 + view.getUint32(4);
	const tracks: MidiNote[][] = [];
	let tempo: number | null = null;
	let bad = 0; // 鳴っていない音を止めようとした回数
	while (pos < bytes.length) {
		const end = pos + 8 + view.getUint32(pos + 4);
		let p = pos + 8;
		let tick = 0;
		let status = 0;
		const sounding = new Map<number, number[]>();
		const notes: MidiNote[] = [];
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
			tick += varlen();
			if (bytes[p]! & 0x80) status = bytes[p++]!;
			if (status === 0xff) {
				const type = bytes[p++]!;
				const n = varlen();
				if (type === 0x51) tempo = (bytes[p]! << 16) | (bytes[p + 1]! << 8) | bytes[p + 2]!;
				p += n;
			} else if (status === 0xf0 || status === 0xf7) {
				const n = varlen();
				p += n;
			} else if ((status & 0xf0) === 0x90 || (status & 0xf0) === 0x80) {
				const pitch = bytes[p++]!;
				const vel = bytes[p++]!;
				if ((status & 0xf0) === 0x90 && vel > 0) {
					sounding.set(pitch, [...(sounding.get(pitch) ?? []), tick]);
				} else {
					const ons = sounding.get(pitch) ?? [];
					const on = ons.shift();
					if (on === undefined) bad++;
					else notes.push({ on, off: tick, pitch });
				}
			} else if ((status & 0xf0) === 0xc0 || (status & 0xf0) === 0xd0) {
				p += 1;
			} else {
				p += 2;
			}
		}
		for (const ons of sounding.values()) bad += ons.length;
		if (notes.length) tracks.push(notes);
		pos = end;
	}
	return { tracks, tempo, bad };
}

describe("MIDI ファイル", () => {
	it.each(songs.map((s) => [s.id, s] as const))("%s: すべての音が鳴り始めてから止まる", (_id, song) => {
		const { tracks, bad } = readMidi(abcToMidiBytes(song.abc));
		expect(bad).toBe(0);
		for (const t of tracks) for (const n of t) expect(n.off).toBeGreaterThan(n.on);
	});

	it("♩=60 以外のテンポでも、スタッカートの音は本来の半分ほどの長さで鳴る", () => {
		const abc = "X:1\nT:t\nM:4/4\nL:1/4\nQ:1/4=160\nK:C\n.C .D .E .F|]\n";
		const { tracks, tempo } = readMidi(abcToMidiBytes(abc));
		expect(tempo).toBe(Math.round(60_000_000 / 160));
		const [track] = tracks;
		expect(track).toHaveLength(4);
		for (const n of track!) expect(n.off).toBeGreaterThan(n.on);
		// 次の音の始まりより前に止まる（短く切れている）
		for (let i = 0; i + 1 < track!.length; i++) expect(track![i]!.off).toBeLessThan(track![i + 1]!.on);
	});
});
