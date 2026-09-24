/*
 * 再生位置カーソルと音符ハイライト。
 *
 * abcjs-editor の app/helpers/cursor-control.ts をもとに、
 * document 全体ではなく指定した要素内だけを対象にするよう改変した。
 * https://github.com/abcjs-music/abcjs-editor
 *
 * Copyright (c) 2023-2026 Paul Rosen
 * Released under the MIT License (see THIRD_PARTY_NOTICES.md)
 */
import type { CursorControl as AbcCursorControl, NoteTimingEvent } from "abcjs";

export class CursorControl implements AbcCursorControl {
	private root: () => HTMLElement | null;
	private lastSvg: SVGElement | null = null;

	constructor(root: () => HTMLElement | null) {
		this.root = root;
	}

	private all(selector: string): Element[] {
		const r = this.root();
		return r ? Array.from(r.querySelectorAll(selector)) : [];
	}

	onStart() {
		// 1行ごとに svg が分かれているので、それぞれにカーソルを置く
		this.all("svg").forEach((svg) => {
			if (!svg.querySelector(".abcjs-cursor")) {
				const cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
				cursor.setAttribute("class", "abcjs-cursor");
				positionCursor(cursor, 0, 0, 0, 0);
				svg.appendChild(cursor);
			}
		});
		this.lastSvg = null;
	}

	onEvent(ev: NoteTimingEvent) {
		if (ev.measureStart && ev.left === null) return; // 小節をまたぐタイの後半は無視する

		this.all(".highlight").forEach((el) => el.classList.remove("highlight"));

		ev.elements?.forEach((note) => note?.forEach((n) => n?.classList.add("highlight")));

		const el = ev.elements?.[0]?.[0];
		if (!el) return;
		const svg = el.closest("svg");
		if (!svg) return;
		if (this.lastSvg === null) {
			this.lastSvg = svg;
		} else if (this.lastSvg !== svg) {
			positionCursor(this.lastSvg.querySelector(".abcjs-cursor"), 0, 0, 0, 0);
			this.lastSvg = svg;
		}
		if (ev.left !== undefined && ev.top !== undefined && ev.height !== undefined) {
			positionCursor(svg.querySelector(".abcjs-cursor"), ev.left - 2, ev.left - 2, ev.top, ev.top + ev.height);
			// 画面外の行に移ったら追従してスクロールする
			const rect = svg.getBoundingClientRect();
			if (rect.top < 0 || rect.bottom > window.innerHeight) {
				svg.scrollIntoView({ block: "center", behavior: "smooth" });
			}
		}
	}

	onFinished() {
		this.all(".highlight").forEach((el) => el.classList.remove("highlight"));
		this.all(".abcjs-cursor").forEach((c) => positionCursor(c, 0, 0, 0, 0));
	}
}

function positionCursor(cursor: Element | null, x1: number, x2: number, y1: number, y2: number) {
	if (!cursor) return;
	cursor.setAttribute("x1", String(x1));
	cursor.setAttribute("x2", String(x2));
	cursor.setAttribute("y1", String(y1));
	cursor.setAttribute("y2", String(y2));
}
