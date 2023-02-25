import ProjectServices from '../../services/project';
import ProjectSchema from '../../schemas/project';

export default defineEventHandler(async (event) => {
    const abbreviation = event.context.params?.abbreviation;
    if (!abbreviation) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request - no abbreviation provided'
        });
    }

    const body = await readBody(event);
    let project = body?.project;
    if (!project) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request - no project provided'
        });
    }

    if (project.abbreviation !== abbreviation) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request - project abbreviation does not match route'
        });
    }


    let { error, value } = ProjectSchema.validate(project);

    if (error) {
        throw createError({
            statusCode: 400,
            message: `Bad Request - project is invalid.\n${error}`, //TODO: Only expose this in dev mode
        });
    }

    if (!value) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request - could not validate project'
        });
    }
    
    try {
        project = await ProjectServices.updateProject(value);
        return project;
    } catch (err: any) {
        if (err && err.statusCode == 404) {
            throw createError({
                statusCode: 404,
                message: 'Not found - project not found'
            });
        } 
        throw createError({
            statusCode: 500,
            message: `Internal Server Error - could not create project.\n${err}` //TODO: Only expose this in dev mode
        });
    }
});