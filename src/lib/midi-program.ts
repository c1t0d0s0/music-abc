/**
 * ABC の中の「%%MIDI program」（声部ごとの音色）を読み書きする。
 * エディタの音色の選択から使う。
 *
 * abcjs は、本文（K: より後）にある単独の「V:声部」行の直後に書いた %%MIDI program を、その声部の音色として使う。
 * 声部のない曲では、K: 行の直後に書いた %%MIDI program が曲全体の音色になる。
 */

export interface VoiceProgram {
	/** 声部の ID（V: の直後の語）。声部のない曲では null */
	id: string | null;
	/** 表示用の名前（V: の name="…"）。なければ ID */
	name: string;
	/** 指定されている音色（General MIDI の番号）。指定がなければ null（abcjs の既定のピアノで鳴る） */
	program: number | null;
}

const PROGRAM_RE = /^%%MIDI\s+program\s+(\d+)(?:\s+(\d+))?/;
/** 単独の V: 行。m[1] が声部の ID、m[2] が残り */
const VOICE_LINE_RE = /^V:\s*(\S+)(.*)$/;
const INLINE_VOICE_RE = /\[V:\s*([^\]\s]+)/g;

function splitLines(abc: string) {
	return abc.split("\n");
}

/** 最初の K: 行の位置（ヘッダーの終わり）。見つからなければ -1 */
function headerEnd(lines: string[]): number {
	return lines.findIndex((l) => /^K:/.test(l));
}

/** %%MIDI program の行から音色の番号を読む（「channel program」の 2 つの数を書く形なら後ろの数） */
function readProgram(line: string): number | null {
	const m = line.match(PROGRAM_RE);
	if (!m) return null;
	return Number(m[2] ?? m[1]);
}

/** start の行の直後から続く、%% の指定やコメントの行の中で %%MIDI program の行を探す */
function findProgramLine(lines: string[], start: number): number {
	for (let i = start + 1; i < lines.length; i++) {
		const l = lines[i]!;
		if (PROGRAM_RE.test(l)) return i;
		if (!l.startsWith("%")) break;
	}
	return -1;
}

/** 本文の中で、その声部の最初の単独の V: 行 */
function findBodyVoiceLine(lines: string[], id: string): number {
	const end = headerEnd(lines);
	if (end < 0) return -1;
	for (let i = end + 1; i < lines.length; i++) {
		const m = lines[i]!.match(VOICE_LINE_RE);
		if (m && m[1] === id) return i;
	}
	return -1;
}

/** 声部の ID を、ABC に初めて出てくる順に集める（V: 行と [V:…] の両方） */
function voiceIds(lines: string[]): string[] {
	const ids: string[] = [];
	const add = (id: string) => {
		if (!ids.includes(id)) ids.push(id);
	};
	for (const line of lines) {
		if (line.startsWith("%")) continue;
		const m = line.match(VOICE_LINE_RE);
		if (m) add(m[1]!);
		for (const im of line.matchAll(INLINE_VOICE_RE)) add(im[1]!);
	}
	return ids;
}

function voiceName(lines: string[], id: string): string {
	for (const line of lines) {
		const m = line.match(VOICE_LINE_RE);
		if (m && m[1] === id) {
			const name = m[2]!.match(/\b(?:name|nm)="([^"]*)"/);
			if (name?.[1]) return name[1];
		}
	}
	return id;
}

/** 声部のない曲で、曲全体の音色を指定している行（ヘッダーか K: の直後） */
function findGlobalProgramLine(lines: string[]): number {
	const end = headerEnd(lines);
	if (end < 0) return -1;
	for (let i = 0; i < end; i++) if (PROGRAM_RE.test(lines[i]!)) return i;
	return findProgramLine(lines, end);
}

/** 曲の声部と、それぞれに指定されている音色 */
export function listVoicePrograms(abc: string): VoiceProgram[] {
	const lines = splitLines(abc);
	if (headerEnd(lines) < 0) return [];
	const ids = voiceIds(lines);
	if (ids.length === 0) {
		const at = findGlobalProgramLine(lines);
		return [{ id: null, name: "", program: at < 0 ? null : readProgram(lines[at]!) }];
	}
	return ids.map((id) => {
		const v = findBodyVoiceLine(lines, id);
		const at = v < 0 ? -1 : findProgramLine(lines, v);
		return { id, name: voiceName(lines, id), program: at < 0 ? null : readProgram(lines[at]!) };
	});
}

/**
 * 声部（id が null なら曲全体）の音色を program にした ABC を返す。
 * すでに %%MIDI program があれば番号を書き換え、なければ行を足す。
 */
export function setVoiceProgram(abc: string, id: string | null, program: number): string {
	const lines = splitLines(abc);
	const end = headerEnd(lines);
	if (end < 0) return abc;
	const directive = `%%MIDI program ${program}`;

	if (id === null) {
		const at = findGlobalProgramLine(lines);
		if (at >= 0) lines[at] = directive;
		else lines.splice(end + 1, 0, directive);
		return lines.join("\n");
	}

	const v = findBodyVoiceLine(lines, id);
	if (v >= 0) {
		const at = findProgramLine(lines, v);
		if (at >= 0) lines[at] = directive;
		else lines.splice(v + 1, 0, directive);
		return lines.join("\n");
	}

	// 本文に単独の V: 行がない声部（[V:…] だけで書き分けている曲など）。
	// K: の直後にある声部ごとの設定の並びの最後に「V:声部」と音色の行を足す
	let insertAt = end + 1;
	/** 足す位置で有効な声部（声部の指定がない音符は最初の声部になる） */
	let current = voiceIds(lines)[0]!;
	while (insertAt < lines.length && (lines[insertAt]!.startsWith("%") || VOICE_LINE_RE.test(lines[insertAt]!))) {
		const m = lines[insertAt]!.match(VOICE_LINE_RE);
		if (m) current = m[1]!;
		insertAt++;
	}
	const added = [`V:${id}`, directive];
	// 続く音符に声部の指定がないと、足した V: の声部の音符になってしまうので、元の声部に戻す
	const next = lines[insertAt] ?? "";
	if (next.trim() !== "" && !/^\s*\[V:/.test(next) && current !== id) added.push(`V:${current}`);
	lines.splice(insertAt, 0, ...added);
	return lines.join("\n");
}
