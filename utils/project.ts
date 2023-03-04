import {
    SectionBodyType,
    WebSettingsType,
    MessagingSettingsType,
    ProjectType
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

let settings: MessagingSettingsType = {
    published: true,
    keywords: {
        options: {
            operation: "send",
            arguments: ["this is a options message"]
        },
        help: {
            operation: "send",
            arguments: ["this is a help message"]
        }
    },
    errorMessage: "Something went wrong, sorry",
    parsingErrorMessage: "Couldn't undertand your response - please try again",
    finalView: {
        ref: "lastMessage",
        type: "text",
        body: {
            contents:
                "Thank you for filing a report with HfRN. We are sorry you have experienced this, what you have told us will help us to prevent other people from experiencing this and help us to work towards accountability for those responsible."
        },
        show: []
    }
};

export default Project;
