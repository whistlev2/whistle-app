import { SessionType } from "~~/interfaces/types";
import SessionModel from "~~/server/models/session";
import {
    SessionModelType,
    MessagingSessionModelType
} from "~~/server/models/session";

async function createSession(session: SessionType) {
    try {
        let ret = await SessionModel.create(session);
        return ret;
    } catch (err) {
        console.error("Error creating session"); //TODO: Handle differently
    }
}

async function getSession(sessionID: string) {
    try {
        let ret = await SessionModel.findById(sessionID);
        return ret;
    } catch (err) {
        console.error("Error getting session"); //TODO: Handle differently
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
        console.error("Error updating session"); //TODO: Handle differently
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
        console.error("Error deleting session"); //TODO: Handle differently
    }
}

function validMessagingSession(
    session: SessionModelType
): asserts session is MessagingSessionModelType {
    if (session.project.type === "web") {
        throw createError("Invalid session type");
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

async function addToField(
    session: SessionModelType | null,
    field: string,
    value: any
) {
    //TODO: Add view to field
    //TODO: handle multiple choice fields
    if (!session) {
        throw createError("Invalid session");
    }
    try {
        if (!session.fields) {
            session.fields = {};
        }
        if (session.fields[field] && session.fields[field].value) {
            session.fields[field].value += ";" + value.toString();
        } else {
            session.fields[field] = {
                value: value.toString()
            };
        }
        session = await updateSession(session._id, session);
        return session;
    } catch (err) {
        console.error(err);
        throw createError("Could not add field"); //TODO: Handle differently
    }
}
export default {
    createSession,
    getSession,
    updateSession,
    deleteSession,
    validMessagingSession,
    getMessagingSession,
    addToField
};
