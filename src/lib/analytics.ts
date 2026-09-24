/**
 * アクセス解析（Google アナリティクス / Google タグマネージャー）。
 * 測定 ID はビルド時に config.js から読み込まれる（vite.config.ts を参照）。ID がなければ何もしない。
 */

declare const __ANALYTICS_ID__: string;

export const ANALYTICS_ID: string = typeof __ANALYTICS_ID__ === "string" ? __ANALYTICS_ID__ : "";

type AnalyticsWindow = Window & {
	gtag?: (...args: unknown[]) => void;
	dataLayer?: unknown[];
};

/**
 * ページビューを送る。
 * このサイトは #/song/furusato のようなハッシュ方式のルーティングなので、そのままでは GA4 がページを区別できない。
 * ハッシュの中のパスを通常のパスに置き換えた URL（例: https://example.com/song/furusato）で送る。
 */
export function trackPageView(routePath: string) {
	if (!ANALYTICS_ID) return;
	const w = window as AnalyticsWindow;
	const base = location.origin + location.pathname;
	const page_location = new URL(routePath.replace(/^\//, ""), base.endsWith("/") ? base : base + "/").href;
	const params = { page_location, page_title: document.title };
	if (ANALYTICS_ID.startsWith("GTM-")) w.dataLayer?.push({ event: "page_view", ...params });
	else w.gtag?.("event", "page_view", params);
}
