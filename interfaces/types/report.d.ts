import { Schema } from 'mongoose';

import ViewType from './project';

interface FieldType {
    value: string;
    view?: ViewType;
}

interface ReportType {
    fields: { [key: string]: FieldType };
    reporter?: string;
    test: boolean;
    timestamp: Date;
    assigned?: Schema.Types.ObjectId;
    project: Schema.Types.ObjectId;
    tags: string[];
}

export { FieldType, ReportType };

export default ReportType;
