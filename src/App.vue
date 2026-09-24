<template>
	<header class="site-header">
		<div class="container bar">
			<RouterLink to="/" class="brand">
				<svg viewBox="0 0 32 32" aria-hidden="true" width="28" height="28">
					<rect width="32" height="32" rx="6" fill="currentColor" />
					<path d="M12 23V9l11-3v14" fill="none" stroke="#f7f2ea" stroke-width="2" />
					<ellipse cx="9.5" cy="23" rx="3.5" ry="2.6" fill="#f7f2ea" />
					<ellipse cx="20.5" cy="20" rx="3.5" ry="2.6" fill="#f7f2ea" />
				</svg>
				<span>ABC 譜面ライブラリ</span>
			</RouterLink>
			<nav aria-label="メインメニュー">
				<RouterLink to="/">曲をさがす</RouterLink>
				<RouterLink to="/editor">エディタ</RouterLink>
				<RouterLink to="/about">ライセンス</RouterLink>
			</nav>
		</div>
	</header>
	<main>
		<RouterView />
	</main>
	<footer class="site-footer">
		<div class="container">
			<p>
				譜面の表示・再生には <a href="https://github.com/paulrosen/abcjs" rel="noopener">abcjs</a>（MIT License）を、
				エディタには <a href="https://github.com/abcjs-music/abcjs-editor" rel="noopener">abcjs-editor</a>（MIT License）の一部を利用しています。
				収録曲はすべて著作権の保護期間が満了した作品です。
				<RouterLink to="/about">ライセンスと権利情報</RouterLink>
			</p>
			<p class="copyright">© 2026 c1t0d0s0</p>
		</div>
	</footer>
</template>

<style scoped>
.site-header {
	background: var(--accent);
	color: var(--accent-ink);
}

.bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 8px 24px;
	min-height: 60px;
	padding-top: 8px;
	padding-bottom: 8px;
}

.brand {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	color: var(--accent-ink);
	text-decoration: none;
	font-family: var(--font-head);
	font-size: 1.2rem;
}

.brand svg {
	color: #c98a2b;
}

nav {
	display: flex;
	gap: 4px;
	flex-wrap: wrap;
}

nav a {
	color: var(--accent-ink);
	text-decoration: none;
	padding: 4px 12px;
	border-radius: 999px;
	font-size: 0.95rem;
}

nav a:hover {
	background: rgba(255, 255, 255, 0.12);
}

nav a.router-link-exact-active {
	background: var(--accent-ink);
	color: var(--accent);
}

main {
	min-height: calc(100vh - 200px);
	padding-bottom: 48px;
}

.site-footer {
	border-top: 1px solid var(--line);
	color: var(--ink-soft);
	font-size: 0.82rem;
	padding: 16px 0 32px;
}

.copyright {
	margin: 8px 0 0;
}
</style>
