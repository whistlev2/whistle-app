<template>
    <div>
        <h3>{{ section.title }}</h3>
        <v-btn @click="$emit('expand')">Expand Section</v-btn>
    </div>
</template>
<script setup lang="ts">
const { section } = defineProps(["section"]);
</script>
<style scoped></style>
