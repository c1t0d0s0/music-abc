<!-- ボタンに添える小さな線画アイコン（装飾なので読み上げない） -->
<template>
	<svg
		class="tool-icon"
		viewBox="0 0 20 20"
		width="18"
		height="18"
		fill="none"
		stroke="currentColor"
		stroke-width="1.6"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<template v-if="name === 'new'">
			<path d="M5 2.5h6.5L15 6v11.5H5z" />
			<path d="M11.5 2.5V6H15" />
			<path d="M10 9v5M7.5 11.5h5" />
		</template>
		<template v-else-if="name === 'open'">
			<path d="M2.5 5.5a1 1 0 0 1 1-1h4l1.5 1.8h7.5a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z" />
			<path d="M2.5 9h15" />
		</template>
		<template v-else-if="name === 'library'">
			<path d="M4 3.5h9.5a1 1 0 0 1 1 1V17H5.5A1.5 1.5 0 0 1 4 15.5z" />
			<path d="M4 15.5A1.5 1.5 0 0 1 5.5 14h9" />
			<path d="M11 6.5v4.3" />
			<circle cx="9.6" cy="10.9" r="1.4" />
			<path d="M11 6.5l2 .8" />
		</template>
		<template v-else-if="name === 'midi'">
			<rect x="2.5" y="4.5" width="15" height="11" rx="1" />
			<path d="M6.25 4.5v6M10 4.5v6M13.75 4.5v6" />
			<path d="M5.5 4.5h1.5v6H5.5zM12.9 4.5h1.6v6h-1.6z" fill="currentColor" stroke="none" />
		</template>
		<template v-else-if="name === 'wav'">
			<path d="M2.5 10h1.5l1.5-4 2 9 2-12 2 11 2-7 1.5 3h3" />
		</template>
		<template v-else-if="name === 'abc'">
			<path d="M5 2.5h6.5L15 6v11.5H5z" />
			<path d="M11.5 2.5V6H15" />
			<path d="M7.5 10h5M7.5 12.5h5M7.5 15h3" />
		</template>
		<template v-else-if="name === 'print'">
			<path d="M6 7.5V3h8v4.5" />
			<rect x="3" y="7.5" width="14" height="6.5" rx="1" />
			<path d="M6 12h8v5H6z" />
		</template>
		<template v-else-if="name === 'edit'">
			<path d="M13 3.5l3.5 3.5L7.5 16H4v-3.5z" />
			<path d="M11 5.5L14.5 9" />
		</template>
	</svg>
</template>

<script setup lang="ts">
defineProps<{ name: "new" | "open" | "library" | "midi" | "wav" | "abc" | "print" | "edit" }>();
</script>

<style scoped>
.tool-icon {
	flex: 0 0 auto;
}
</style>
