<template>
    <h1>
        Messaging Emulator - {{ project.title
        }}<v-btn id="restartButton" @click="restartConversation"
            >Restart Conversation</v-btn
        >
    </h1>

    <v-divider />
    <div class="messages" ref="messagesDiv">
        <div v-for="message in messages">
            <EmulatorMessage :message="message" />
        </div>
    </div>
    <EmulatorMessageInput @sendMessage="sendMessage" class="message-input" />
</template>

<script lang="ts" setup>
import { XMLParser } from "fast-xml-parser";
import Project from "~~/utils/project";
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
const messagesDiv = ref<HTMLElement | null>(null);
const abbreviation = Array.isArray(route.params.abbreviation)
    ? route.params.abbreviation[0]
    : route.params.abbreviation;
clearSessionCookie();
const project = await getProject(abbreviation);
const pageErrors = ref<Error[]>([]);
if (!project) {
    throw createError({
        statusCode: 404,
        message: `Project ${abbreviation} not found`
    });
}

function clearSessionCookie() {
    const sessionCookie = useCookie("session");
    sessionCookie.value = null;
}

function restartConversation() {
    messages.value = [];
    clearSessionCookie();
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
        return ret.Response.Message.map(
            (message: string) => new EMessage(message, true)
        );
    }
    return [new EMessage(ret.Response.Message, true)];
}
function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sendMessage(outgoingMessage: string) {
    let { data, error } = await useFetch(
        `/api/edit/messaging/webhook/${route.params.abbreviation}/test`,
        {
            method: "POST",
            body: {
                Body: outgoingMessage
            }
        }
    );
    //TODO: Handle pending

    if (error?.value) {
        pageErrors.value.push(error.value);
        //TODO: Create and show error modal
        return;
    }
    messages.value.push({
        body: outgoingMessage,
        incoming: false
    });
    let incomingMessages = handleIncomingMessages(data.value);
    for (let i = 0; i < incomingMessages.length; i++) {
        messages.value.push(incomingMessages[i]);
    }
    if (messagesDiv.value) {
        await timeout(10); //Wait for DOM to update
        messagesDiv.value.scrollTop =
            messagesDiv.value.scrollHeight - messagesDiv.value.clientHeight;
    }
}
</script>
<style scoped>
.message-input {
    position: sticky;
    bottom: 10px;
    left: 0;
    right: 0;
}
.messages {
    height: 80vh;
    overflow-y: scroll;
    margin: auto;
    width: 80%;
}

#restartButton {
    margin-left: 10px;
}
</style>
