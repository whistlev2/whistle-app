import {
    SectionBodyType,
    WebSettingsType,
    MessagingSettingsType,
    ProjectType,
    MessagingProjectType
} from "~~/interfaces/types";

class Project implements ProjectType {
    title: string;
    sections: SectionBodyType[];
    ref: string;
    type: "web" | "sms" | "mms";
    settings: WebSettingsType | MessagingSettingsType;

    constructor(project: any) {
        if (!project) {
            throw createError("No project provided");
        }
        let errors: String[] = [];
        let fields = Object.keys(this);
        fields.forEach((field) => {
            if (!project[field]) {
                errors.push(`No ${field} provided`);
            }
        });
        if (errors.length > 0) {
            throw createError(errors.join("\n"));
        }

        this.title = project.title;
        this.sections = project.sections;
        this.ref = project.ref;
        this.type = project.type;
        this.settings = project.settings;
    }
}

class MessagingProject extends Project implements MessagingProjectType {
    settings: MessagingSettingsType;
    type: "sms" | "mms";

    constructor(project: any) {
        if (project.type !== "sms" && project.type !== "mms") {
            throw createError("Invalid project type");
        }
        if (!project.settings.keywords) {
            throw createError("Invalid settings");
        }
        super(project);
        this.type = project.type;
        this.settings = project.settings;
    }
}

export default Project;

export { Project, MessagingProject };
