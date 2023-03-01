<template>
<v-form>
    <v-text-field
        v-model="message"
        append-icon="mdi-send"
        variant="filled"
        clear-icon="mdi-close-circle"
        clearable
        label="Message"
        type="text"
        @click:append="sendMessage"
        @click:clear="clearMessage"
    ></v-text-field>
    </v-form>
</template>
<script setup>
const message = ref('');
const emits = defineEmits(['sendMessage']);
function sendMessage(event) {
    console.log(event)
    if (message.value) {
        emits('sendMessage', message.value);
        message.value = '';
    }
}
function clearMessage() {
    message.value = '';
}
</script>