import ProjectServices from "~~/server/services/project";
import ProjectSchema from "~~/server/schemas/project";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const project = body?.project;
    if (!project) {
        throw createError({
            statusCode: 400,
            message: "Bad Request - no project provided"
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
        let createdProject = await ProjectServices.createProject(value);
        return createdProject;
    } catch (err: any) {
        if (err && err.code === 11000) {
            throw createError({
                statusCode: 409,
                message: "Conflict - a project with these keys already exists" //TODO: Only expose this in dev mode
            });
        }
        throw createError({
            statusCode: 500,
            message: `Internal Server Error - could not create project.\n${err}` //TODO: Only expose this in dev mode
        });
    }
});
