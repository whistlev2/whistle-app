<template>
    <div>{{ view }}</div>
</template>
<script setup lang="ts">
const { view, refs } = defineProps(["view", "refs"]);
</script>
<style scoped></style>
