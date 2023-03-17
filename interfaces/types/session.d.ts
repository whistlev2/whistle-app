import { Schema } from "mongoose";
import ProjectType, { ViewType, MessagingProjectType } from "./project";
import FieldType from "./field";
type MessageType = ViewType | string;

interface SessionType {
    reports: Schema.Types.ObjectId[];
    activeReport?: Schema.Types.ObjectId;
    expires?: Date;
    project: ProjectType;
    messages?: Array<MessageType>;
    cursor: number;
    fields?: { [key: string]: FieldType };
    test: boolean;
}

interface MessagingSessionType extends SessionType {
    messages: Array<MessageType>;
    project: MessagingProjectType;
}

export { MessageType, SessionType, MessagingSessionType };
export default SessionType;
