import ProjectServices from '../../../services/project';

export default defineEventHandler(async (event) => {
    if (!event.context.params?.abbreviation) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request - no project abbreviation provided'
          })
    }
    try {
        let project = await ProjectServices.deleteProjectFromAbbreviation(event.context.params?.abbreviation)
        if (!project) {
            throw createError({
                statusCode: 404,
                message: 'Not Found - project not found'
            })
        }
        return project;
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            message: `Internal Server Error - could not delete project.`
        });
    }
});