import { SessionType } from '../../interfaces/types';
import SessionModel from '../models/session';
import { SessionModelType, MessagingSessionModelType } from '../models/session';

async function createSession(session: SessionType) {
    try {
        let ret = await SessionModel.create(session);
        return ret;
    } catch (err) {
        console.error('Error creating session'); //TODO: Handle differently
    }
}

async function getSession(sessionID: string) {
    try {
        let ret = await SessionModel.findById(sessionID);
        return ret;
    } catch (err) {
        console.error('Error getting session'); //TODO: Handle differently
    }
}

async function updateSession(sessionID: string, updatedSession: SessionType) {
    try {
        let session = await SessionModel.findById(sessionID);
        if (session) {
            session.set(updatedSession);
            await session.save();
            return session;
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        console.error('Error updating session'); //TODO: Handle differently
        throw err;
    }
}

async function deleteSession(sessionID: string) {
    try {
        let session = await SessionModel.findById(sessionID);
        if (session) {
            await session.remove();
            return session;
        } else {
            return null;
        }
    } catch (err) {
        console.error('Error deleting session'); //TODO: Handle differently
    }
}

function validMessagingSession(session: SessionModelType): asserts session is MessagingSessionModelType {
    if (session.project.type === 'web') {
        throw new Error('Invalid session type');
    }
}

async function getMessagingSession(sessionID: string) {
    let session = await getSession(sessionID);
    if (!session) {
        return null;
    }
    validMessagingSession(session);
    return session;
}

export default {
    createSession,
    getSession,
    updateSession,
    deleteSession,
    validMessagingSession,
    getMessagingSession
};
