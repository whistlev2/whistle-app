import ProjectServices from '../../services/project';

export default defineEventHandler(async (event) => {
    //TODO: Route validation

    //TODO: Test error handling
    if (!event.context.params?.abbreviation) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request - no project abbreviation provided',
            data: {
              statusCode: 400,
              responseBody: 'Bad Request - no project abbreviation provided'
            },
          })
    }
    let project = await ProjectServices.getProjectFromAbbreviation(event.context.params?.abbreviation)
    if (!project) {
        throw createError({
            statusCode: 404,
            message: 'Not Found - project not found',
            data: {
              statusCode: 404,
              responseBody: 'Not Found - project not found'
            },
          })
    }
    return project;
});