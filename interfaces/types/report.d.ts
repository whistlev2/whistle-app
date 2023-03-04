import { Schema } from "mongoose";
import FieldType from "./field";

interface ReportType {
    fields: { [key: string]: FieldType };
    reporter?: string;
    test: boolean;
    timestamp: Date;
    assigned?: Schema.Types.ObjectId;
    projectRef: string;
    tags: string[];
}

export { ReportType };

export default ReportType;
