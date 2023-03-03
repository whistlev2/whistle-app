import MessagingServices from "../../../../../services/messaging";
export default defineEventHandler(MessagingServices.getWebhookHandler(true));
