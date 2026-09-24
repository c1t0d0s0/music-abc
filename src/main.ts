import { createApp } from "vue";
import "abcjs/abcjs-audio.css";
import "@webcoder49/code-input/code-input.css";
import "highlightjs-abc/abcjs-light-theme.css";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { lang, t } from "./i18n";

// 表示言語に合わせて lang 属性と説明文を設定する
document.documentElement.lang = lang;
document.title = t.siteName;
document.querySelector('meta[name="description"]')?.setAttribute("content", t.siteDescription);

createApp(App).use(router).mount("#app");
