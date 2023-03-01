<template>
    <h1>Emulator</h1>
    <EmulatorMessage v-for="message in messages" :message="message" />
    <EmulatorSendMessage @sendMessage="sendMessage" />
</template>

<script setup>
    const route = useRoute();
    const messages = ref([]);
    async function sendMessage(newMessage) {
        let message = {
            Body: newMessage
        }
        let options = {
            method: 'POST',
            body: message
        }
        let ret = await useFetch(`/api/edit/messaging/webhook/${route.params.abbreviation}`, options)
        //TODO: Process the response
        console.log(ret);

        messages.value.push({
            body: newMessage,
            incoming: false,
        });
    }
</script>