<template>
    <h1>Emulator</h1>
    <div v-for="message in messages">
        <EmulatorMessage :message="message" />
    </div>
    <EmulatorSendMessage @sendMessage="sendMessage" />
</template>

<script setup>
    import { XMLParser } from 'fast-xml-parser';
    const route = useRoute();
    const messages = ref([]);
    async function sendMessage(outgoingMessage) {
        let message = {
            Body: outgoingMessage
        }
        let options = {
            method: 'POST',
            body: message
        }
        let ret = await useFetch(`/api/edit/messaging/webhook/${route.params.abbreviation}`, options)
        //TODO: Handle errors
        const parser = new XMLParser();
        let incomingMessage = parser.parse(ret.data.value);
        let nextMessage = {
            body: outgoingMessage,
            incoming: false,
        };
        messages.value.push(nextMessage);
        nextMessage = {
            body: incomingMessage.Response.Message,
            incoming: true,
        };
        messages.value.push(nextMessage);

    }
</script>