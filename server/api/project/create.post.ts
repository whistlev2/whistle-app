import ProjectServices from '../../services/project';
import ProjectSchema from '../../schemas/project';

import Joi from 'joi';

export default defineEventHandler(async (event) => {
    if (!event.context.body.project) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request - no project provided'
        });
    }

    let project = event.context.body.project;

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

    let createdProject = await ProjectServices.createProject(value);

    return createdProject;
});