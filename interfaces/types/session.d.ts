import { Schema } from 'mongoose';
import ProjectType, { ViewType, MessagingProjectType } from './project';

type MessageType = ViewType | string;

interface SessionType {
    active: Schema.Types.ObjectId[]; //rename to reports
    current: Schema.Types.ObjectId;
    expires?: Date;
    project: ProjectType;
    messages?: Array<MessageType>;
    cursor: number;
}

interface MessagingSessionType extends SessionType {
    messages: Array<MessageType>;
    project: MessagingProjectType;
}

export { MessageType, SessionType, MessagingSessionType };
export default SessionType;
