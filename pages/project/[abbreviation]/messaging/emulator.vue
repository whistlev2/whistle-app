<template>
    <h1>Messaging Emulator - {{ project.title }}</h1>
    <v-btn @click="restartConversation">Restart Conversation</v-btn>
    <div v-for="message in messages">
        <EmulatorMessage :message="message" />
    </div>
    <EmulatorSendMessage @sendMessage="sendMessage" />
</template>

<script lang="ts" setup>
    import { XMLParser } from 'fast-xml-parser';
    import Project from '~~/utils/project';
    interface EMessageType {
        body: string;
        incoming: boolean;
    }
    class EMessage implements EMessageType {
        body: string;
        incoming: boolean;
        constructor(message: string, incoming: boolean) {
            this.body = message;
            this.incoming = incoming;
        }
    }
    const route = useRoute();
    const messages = ref<EMessageType[]>([]);
    const abbreviation = Array.isArray(route.params.abbreviation) ? route.params.abbreviation[0] : route.params.abbreviation;
    const project = await getProject(abbreviation);
    const pageErrors = ref<Error[]>([]);
    if (!project) {
        throw createError({
            statusCode: 404,
            message: `Project ${abbreviation} not found`
        });
    }

    function restartConversation() {
        messages.value = [];
        const sessionCookie = useCookie('session');
        sessionCookie.value = null;
    }

    async function getProject(abbreviation: string) {
        let response = await useFetch(`/api/edit/project/${abbreviation}`);
        try {
            let project = new Project(response.data.value);
            return project;
        } catch (error) {
            return null;
        }
    }

    function handleIncomingMessages(incomingMessage: string | null) {
        if (!incomingMessage) {
            return null;
        }
        const parser = new XMLParser();
        let ret = parser.parse(incomingMessage);
        //TODO: Handle multiple messages
        if (!ret?.Response?.Message) {
            return [];
        }
        if (Array.isArray(ret.Response.Message)) {
            return ret.Response.Message.map((message: string) => new EMessage(message, true));
        }
        return [new EMessage(ret.Response.Message, true)];
        
    }

    async function sendMessage(outgoingMessage: string) {
        let { data, error } = await useFetch(`/api/edit/messaging/webhook/${route.params.abbreviation}`, {
            method: 'POST',
            body: {
                Body: outgoingMessage
            }
        })
        //TODO: Handle pending
        
        if (error?.value) {
            pageErrors.value.push(error.value);
            return;
        }
        messages.value.push({
            body: outgoingMessage,
            incoming: false,
        });
        let incomingMessages = handleIncomingMessages(data.value);
        for (let i = 0; i < incomingMessages.length; i++) {
            messages.value.push(incomingMessages[i]);
        }
    }
</script>