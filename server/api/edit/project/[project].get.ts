import ProjectServices from "~~/server/services/project";

export default defineEventHandler(async (event) => {
    if (!event.context.params?.project) {
        throw createError({
            statusCode: 400,
            message: "Bad Request - no project reference provided"
        });
    }
    let project = await ProjectServices.getProjectFromReference(
        event.context.params?.project
    );
    if (!project) {
        throw createError({
            statusCode: 404,
            message: "Not Found - project not found"
        });
    }
    return project;
});
