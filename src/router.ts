import { createRouter, createWebHashHistory } from "vue-router";
import LibraryView from "./views/LibraryView.vue";

export const router = createRouter({
	// 静的ホスティングでも動くようにハッシュ方式を使う
	history: createWebHashHistory(),
	routes: [
		{ path: "/", name: "library", component: LibraryView, meta: { title: "" } },
		{ path: "/song/:id", name: "song", component: () => import("./views/SongView.vue"), props: true },
		{ path: "/editor", name: "editor", component: () => import("./views/EditorView.vue"), meta: { title: "エディタ" } },
		{ path: "/about", name: "about", component: () => import("./views/AboutView.vue"), meta: { title: "このサイトについて" } },
		{ path: "/:pathMatch(.*)*", redirect: "/" },
	],
	scrollBehavior: () => ({ top: 0 }),
});

const SITE = "ABC 譜面ライブラリ";
router.afterEach((to) => {
	const title = to.meta.title as string | undefined;
	if (title !== undefined) document.title = title ? `${title} | ${SITE}` : SITE;
});
