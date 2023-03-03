<template>
    <v-text-field
        v-model="message"
        append-icon="mdi-send"
        variant="filled"
        clear-icon="mdi-close-circle"
        clearable
        label="Message"
        type="text"
        ref="inputField"
        @click:append="sendMessage"
        @click:clear="clearMessage"
        @keyup.enter="sendMessage"
    ></v-text-field>
</template>
<script lang="ts" setup>
const message = ref("");
const emits = defineEmits(["sendMessage"]);
const inputField = ref<HTMLElement | null>(null);
onMounted(() => {
    if (inputField.value) {
        inputField.value.focus();
    }
});
function sendMessage() {
    if (message.value) {
        emits("sendMessage", message.value);
        message.value = "";
    }
}
function clearMessage() {
    message.value = "";
}
</script>
