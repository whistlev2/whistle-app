import SessionServices from '../../../services/session';
import ProjectServices from '../../../services/project';
import MessagingServices from '../../../services/messaging';
import IncomingMessageSchema from '../../../schemas/incomingMessage';

export default defineEventHandler(async (event) => {
    try {
        const incomingMessage = await readBody(event);
        const abbreviation = event.context.params?.abbreviation;
        if (!abbreviation) {
            throw createError({
                statusCode: 400,
                message: 'Bad request - Missing project abbreviation'
            })
        }

        let project = await ProjectServices.getProjectModelFromAbbreviation(abbreviation);
        if (!project) {
            throw createError({
                statusCode: 404,
                message: 'Not found - project not found'
            });
        }

        if (!incomingMessage?.Body) {
            throw createError({
                statusCode: 400,
                message: "Bad request - Invalid message body"
            });
        }

        
        let sessionCookie = getCookie(event, 'session');

        if (sessionCookie && sessionCookie.length !== 0) {
            let session = await SessionServices.getMessagingSession(sessionCookie);
            let expiredSession = session && session.expires && session.expires.valueOf() > Date.now();
            if (session && !expiredSession) {
                let sessionInfo = await MessagingServices.handleMessage(incomingMessage.Body, session);
                if (sessionInfo.sessionCompleted) {
                    setCookie(event, 'session', '');
                }
                return sessionInfo.messages;
            }
        }
        let sessionInfo = await MessagingServices.startSession(incomingMessage.Body, project);
        if (sessionInfo.sessionCompleted) {
            setCookie(event, 'session', '');
        } else {
            setCookie(event, 'session', sessionInfo.sessionID);
        }
        return sessionInfo.message;
    } catch (err) {
        throw createError({
            statusCode: 500,
            message: 'Internal server error - Could not handle message'
        })
    }
});