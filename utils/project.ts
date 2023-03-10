import {
    SectionBodyType,
    WebSettingsType,
    MessagingSettingsType,
    ProjectType,
    MessagingProjectType,
    ActionType
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

function getActionsRefs(actions: ActionType[]): string[] {
    let refs: string[] = [];
    for (let i = 0; i < actions.length; i++) {
        switch (actions[i].operation) {
            case "set":
                refs.push(actions[i].arguments[0]);
                break;
        }
    }
    return refs;
}

function getSectionRefs(section: SectionBodyType): string[] {
    let refs: string[] = [];
    switch (section.type) {
        case "section":
            for (let i = 0; i < section.body.length; i++) {
                refs = refs.concat(getSectionRefs(section.body[i]));
            }
            break;
        case "text":
        case "custom":
            if (section.input) {
                refs = refs.concat(getActionsRefs(section.input.actions));
            }
            break;
    }
    return refs;
}

function getProjectRefs(project: ProjectType): string[] {
    if (!project.sections) return [];
    let refs: string[] = [];
    for (let i = 0; i < project.sections.length; i++) {
        refs = refs.concat(getSectionRefs(project.sections[i]));
    }
    return refs;
}

export default Project;

export { Project, MessagingProject, getProjectRefs };
