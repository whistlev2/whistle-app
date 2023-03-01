<template>
    <div>
        <VCard :text="message.body" />
    </div>
</template>

<script setup>
const { message } = defineProps(['message']);
</script>
