//const { MessagingResponse } = require('twilio').twiml;
import Twilio from "twilio";
const { MessagingResponse } = Twilio.twiml;
import {
    SectionBodyType,
    InputType,
    MessageType,
    TextBodyType,
    ViewType,
    ProjectType
} from "../../interfaces/types/index";
import SessionServices from "./session";
import ProjectServices from "./project";
import { MessagingSessionModelType, SessionModelType } from "../models/session";
import { ProjectModelType } from "../models/project";
import ReportServices from "./report";
import { BooleanSchema } from "joi";
import { H3Event } from "h3";
function getLastPromptInput(messages: Array<MessageType>): InputType | null {
    var message;
    for (let i = messages.length - 1; i >= 0; i--) {
        message = messages[i];
        if (typeof message !== "string") {
            if (message.input) {
                return message.input;
            }
        }
    }
    return null;
}

function getMultipleChoiceMessage(
    options: Array<string> | undefined,
    allowMultiple: boolean | undefined
): string {
    if (!options) {
        return "There are no options to choose from";
    }

    let ret = "Reply with the number of your choice:\n";
    for (let i = 0; i < options.length; i++) {
        ret += `${i + 1}: ${options[i]}\n`;
    }
    if (allowMultiple) {
        ret += "\nYou can reply with multiple numbers separated by commas";
    }
    return ret;
}
//Side effect: updates session
//TODO: change types
async function getNextMessages(
    session: MessagingSessionModelType
): Promise<{ messages: Array<string>; sessionCompleted: boolean }> {
    //TODO: make sure session updates correctly
    let views = ProjectServices.getSectionViews(session.project.sections);
    let report = await ReportServices.getReport(session.current);
    let messages: Array<string> = [];
    if (!report) {
        console.error("Report not found");
        throw createError("Report not found");
    }
    let showMessage = false;
    for (let i = session.cursor; i < views.length; i++) {
        showMessage = await ProjectServices.meetsAllConditions(
            views[i].show,
            report
        );
        session.cursor++;
        if (showMessage) {
            session.messages.push(views[i]);
            messages.push(ProjectServices.getViewText(views[i]));
            if (views[i].input) {
                if (views[i].input?.type === "multiple") {
                    let multipleChoiceMessage = getMultipleChoiceMessage(
                        views[i].input?.options,
                        views[i].input?.allowMultiple
                    );
                    session.messages.push(multipleChoiceMessage);
                    messages.push(multipleChoiceMessage);
                }
                await SessionServices.updateSession(session._id, session);
                return {
                    messages,
                    sessionCompleted: false
                };
            }
        }
    }
    session.messages.push(session.project.finalView);
    await SessionServices.updateSession(session._id, session);

    messages.push(ProjectServices.getViewText(session.project.finalView));
    return {
        messages,
        sessionCompleted: true
    };
}

function formatTwiml(messages: Array<string>): string {
    const twiml = new MessagingResponse();
    for (let i = 0; i < messages.length; i++) {
        twiml.message(messages[i]);
    }
    return twiml.toString();
}

async function processResponse(
    message: string,
    input: InputType,
    session: MessagingSessionModelType
): Promise<{ nextMessages: Array<string>; sessionCompleted: boolean }> {
    let nextMessages: Array<string> = [];
    let actions = input.actions;
    let actionPromises = [];
    for (let i = 0; i < actions.length; i++) {
        actionPromises.push(
            ProjectServices.performAction(actions[i], message, session)
        );
    }
    let effects = await Promise.all(actionPromises);
    for (let i = 0; i < effects.length; i++) {
        if (effects[i].messages) {
            nextMessages = nextMessages.concat(effects[i].messages);
        }
    }
    let updatedSession = await SessionServices.getMessagingSession(session._id);
    if (!updatedSession) {
        throw createError("Could not get session");
    }
    session = updatedSession;
    let nextMessageInfo = await getNextMessages(session);
    return {
        nextMessages: nextMessages.concat(nextMessageInfo.messages),
        sessionCompleted: nextMessageInfo.sessionCompleted
    };
}

async function handleMessage(
    message: string,
    session: MessagingSessionModelType
) {
    try {
        let sessionCompleted = false;
        //TODO: Resend last message after keyword?
        let action =
            session.project.settings.keywords[message.trim().toLowerCase()];
        if (action) {
            let { messages } = await ProjectServices.performAction(
                action,
                message,
                session
            );
            session.messages = session.messages.concat(messages);
            await SessionServices.updateSession(session._id, session);
            return {
                messages: formatTwiml(messages),
                sessionCompleted: false
            };
        } else {
            let input = getLastPromptInput(session.messages);
            session.messages.push(message);
            SessionServices.updateSession(session._id, session);
            let nextMessages: Array<string> = [];

            if (input) {
                let validInput = ProjectServices.validateInput(message, input);
                if (validInput.parsedOptions) {
                    message = validInput.parsedOptions;
                }
                if (validInput.valid) {
                    ({ nextMessages, sessionCompleted } = await processResponse(
                        message,
                        input,
                        session
                    ));
                } else {
                    nextMessages = [
                        session.project.settings.parsingErrorMessage
                    ];
                    //TODO: Get this from project
                }
            } else {
                //TODO: Concatenate message onto start message field
                // Race condition - already started session, but user sent another message before response
                console.info("Race condition");
                ReportServices.addToField(
                    session.current,
                    "startMessage",
                    message
                );
            }
            return {
                messages:
                    nextMessages.length == 0 ? "" : formatTwiml(nextMessages),
                sessionCompleted: sessionCompleted
            };
        }
    } catch (err) {
        console.error("Could not handle message"); //Handle differently
        console.error(err);
        throw err;
    }
}

function isValidMessagingSessionModel(
    session: SessionModelType | undefined
): asserts session is MessagingSessionModelType {
    if (!session) {
        throw createError("No session found");
    }
    if (!session.messages) {
        throw createError("Invalid session type");
    }
}

async function startSession(
    message: any,
    project: ProjectModelType,
    test: boolean
) {
    //Note: when starting a session, keywords are not checked
    console.log(`Creating ${test ? "test" : "real"} session`);
    let report = await ReportServices.createReport({
        fields: {
            startMessage: {
                value: message
            }
        },
        test: test,
        timestamp: new Date(),
        project: project._id,
        tags: []
    });
    if (!report) {
        console.error("Report not created");
        throw createError("Report not created");
    }
    let session = await SessionServices.createSession({
        active: [report._id],
        current: report._id,
        project: project,
        messages: [message, project.sections[0]],
        cursor: 0
    });

    if (!session) {
        throw createError("Could not create session");
    }

    if (!session.messages) {
        throw createError("Could not get messages");
    }
    //TODO: Separate session creation function?
    isValidMessagingSessionModel(session);
    let nextMessageInfo = await getNextMessages(session);
    return {
        sessionID: session._id,
        message: formatTwiml(nextMessageInfo.messages),
        sessionCompleted: nextMessageInfo.sessionCompleted
    };
}

async function sendErrorMessage() {
    try {
        //TODO: Handle message
        const twiml = new MessagingResponse();
        twiml.message(
            "Sorry, this chat bot is not currently available. Please try again later."
        );
        return twiml.toString();
    } catch (err) {
        console.error("Could send error message"); //Handle differently
        console.error(err);
    }
}

function parseMultiple(message: string): Array<string> {
    return message.split(/[\s,;.]+/);
}

function parseOption(option: string, options: Array<string>): string {
    let optionIndex = parseInt(option);
    if (isNaN(optionIndex)) {
        return option;
    }
    if (optionIndex > options.length) {
        return option;
    }
    return options[optionIndex - 1];
}

function getWebhookHandler(test: boolean) {
    return async function (event: H3Event) {
        const incomingMessage = await readBody(event);
        const abbreviation = event.context.params?.abbreviation;
        if (!abbreviation) {
            throw createError({
                statusCode: 400,
                message: "Bad request - Missing project abbreviation"
            });
        }
        let project = await ProjectServices.getProjectModelFromAbbreviation(
            abbreviation
        );
        if (!project) {
            throw createError({
                statusCode: 404,
                message: "Not found - project not found"
            });
        }
        if (!incomingMessage?.Body) {
            throw createError({
                statusCode: 400,
                message: "Bad request - Invalid message body"
            });
        }

        let sessionCookie = getCookie(event, "session");

        if (sessionCookie && sessionCookie.length !== 0) {
            let session = await SessionServices.getMessagingSession(
                sessionCookie
            );
            let expiredSession =
                session &&
                session.expires &&
                session.expires.valueOf() > Date.now();
            if (session && !expiredSession) {
                let sessionInfo = await handleMessage(
                    incomingMessage.Body,
                    session
                );
                if (sessionInfo.sessionCompleted) {
                    setCookie(event, "session", "");
                }
                return sessionInfo.messages;
            }
        }
        let sessionInfo = await startSession(
            incomingMessage.Body,
            project,
            test
        );
        if (sessionInfo.sessionCompleted) {
            setCookie(event, "session", "");
        } else {
            setCookie(event, "session", sessionInfo.sessionID);
        }
        return sessionInfo.message;
    };
}

export default {
    handleMessage,
    startSession,
    sendErrorMessage,
    parseMultiple,
    parseOption,
    getWebhookHandler
};
