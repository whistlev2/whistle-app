import mongoose, { Document, Schema } from 'mongoose';

import { ReportType } from '../../interfaces/types/index';

export interface ReportModelType extends ReportType, Document {}

//TODO: Add validation
const ReportSchema: Schema = new Schema(
    {
        fields: { type: Object, required: true },
        reporter: { type: String, required: false },
        test: { type: Boolean, required: true },
        timestamp: { type: Date, required: true },
        assigned: { type: Schema.Types.ObjectId, required: false },
        project: { type: Schema.Types.ObjectId, required: true },
        tags: { type: [String], required: true }
    },
    {
        versionKey: false
    }
);

export default mongoose.model<ReportModelType>('Report', ReportSchema);
