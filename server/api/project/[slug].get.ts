export default defineEventHandler(async (event) => {
    return {
        message: `Hello ${event.context.params?.slug}`
    };
});