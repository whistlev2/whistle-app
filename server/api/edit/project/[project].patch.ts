import ProjectServices from "~~/server/services/project";
import ProjectSchema from "~~/server/schemas/project";

export default defineEventHandler(async (event) => {
    const projectRef = event.context.params?.ref;
    if (!projectRef) {
        throw createError({
            statusCode: 400,
            message: "Bad Request - no project reference provided"
        });
    }

    const body = await readBody(event);
    let project = body?.project;
    if (!project) {
        throw createError({
            statusCode: 400,
            message: "Bad Request - no project provided"
        });
    }

    if (project.ref !== projectRef) {
        throw createError({
            statusCode: 400,
            message: "Bad Request - project reference does not match route"
        });
    }

    let { error, value } = ProjectSchema.validate(project);

    if (error) {
        throw createError({
            statusCode: 400,
            message: `Bad Request - project is invalid.\n${error}` //TODO: Only expose this in dev mode
        });
    }

    if (!value) {
        throw createError({
            statusCode: 400,
            message: "Bad Request - could not validate project"
        });
    }

    try {
        project = await ProjectServices.updateProject(value);
        return project;
    } catch (err: any) {
        if (err && err.statusCode == 404) {
            throw createError({
                statusCode: 404,
                message: "Not found - project not found"
            });
        }
        throw createError({
            statusCode: 500,
            message: `Internal Server Error - could not create project.\n${err}` //TODO: Only expose this in dev mode
        });
    }
});
