import { createRouter, createWebHashHistory } from "vue-router";
import { t } from "./i18n";
import LibraryView from "./views/LibraryView.vue";

export const router = createRouter({
	// 静的ホスティングでも動くようにハッシュ方式を使う
	history: createWebHashHistory(),
	routes: [
		{ path: "/", name: "library", component: LibraryView, meta: { title: "" } },
		{ path: "/song/:id", name: "song", component: () => import("./views/SongView.vue"), props: true },
		{ path: "/editor", name: "editor", component: () => import("./views/EditorView.vue"), meta: { title: t.pageTitle.editor } },
		{ path: "/about", name: "about", component: () => import("./views/AboutView.vue"), meta: { title: t.pageTitle.about } },
		{ path: "/:pathMatch(.*)*", redirect: "/" },
	],
	scrollBehavior: () => ({ top: 0 }),
});

const SITE = t.siteName;
router.afterEach((to) => {
	const title = to.meta.title as string | undefined;
	if (title !== undefined) document.title = title ? `${title} | ${SITE}` : SITE;
});
