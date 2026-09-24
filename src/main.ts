import { createApp } from "vue";
import "abcjs/abcjs-audio.css";
import "@webcoder49/code-input/code-input.css";
import "highlightjs-abc/abcjs-light-theme.css";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).mount("#app");
