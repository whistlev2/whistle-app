import ProjectServices from "~~/server/services/project";

export default defineEventHandler(async (event) => {
    if (!event.context.params?.project) {
        throw createError({
            statusCode: 400,
            message: "Bad Request - no project reference provided"
        });
    }
    try {
        let project = await ProjectServices.deleteProjectFromReference(
            event.context.params?.project
        );
        if (!project) {
            throw createError({
                statusCode: 404,
                message: "Not Found - project not found"
            });
        }
        return project;
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            message: `Internal Server Error - could not delete project.`
        });
    }
});
