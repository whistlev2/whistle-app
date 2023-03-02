<template>
    <div>
        <h1>ERROR</h1>
        <p>{{ error.statusCode }}: {{ error.message }}</p>
    </div>
</template>
<script setup>
    defineProps(['error']);
</script>