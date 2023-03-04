import MessagingServices from "~~/server/services/messaging";
export default defineEventHandler(MessagingServices.getWebhookHandler(false));
