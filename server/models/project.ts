//TODO: Add testing
import mongoose, { Document, Schema } from "mongoose";

import { ProjectType } from "~~/interfaces/types/index";

export interface ProjectModelType extends ProjectType, Document {}

//TODO: Flesh out schema
const ProjectSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        sections: { type: Array, required: true },
        ref: { type: String, required: true, unique: true },
        type: { type: String, required: true },
        settings: { type: Object, required: true }
    },
    {
        versionKey: false
    }
);

export default mongoose.model<ProjectModelType>("Project", ProjectSchema);
