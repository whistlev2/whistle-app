import mongoose, { Document, Schema } from "mongoose";

import { SessionType, MessagingSessionType } from "~~/interfaces/types/index";

export interface SessionModelType extends SessionType, Document {}
export interface MessagingSessionModelType
    extends MessagingSessionType,
        Document {}
//TODO: Add validation
const SessionSchema: Schema = new Schema(
    {
        reports: { type: [Schema.Types.ObjectId], required: true },
        activeReport: { type: Schema.Types.ObjectId, required: false },
        expires: { type: Date, required: false },
        project: { type: Object, required: true }, //TODO: Change to ProjectType
        messages: { type: [], required: false }, //TODO: Change to ViewType
        cursor: { type: Number, required: true }
    },
    {
        versionKey: false
    }
);

export default mongoose.model<SessionModelType>("Session", SessionSchema);
