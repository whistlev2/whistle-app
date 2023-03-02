import { SectionBodyType, WebSettingsType, MessagingSettingsType, ViewType, ProjectType } from "~~/interfaces/types";

class Project implements ProjectType {
    title: string;
    sections: SectionBodyType[];
    abbreviation: string;
    type: 'web' | 'sms' | 'mms';
    published: boolean;
    settings: WebSettingsType | MessagingSettingsType;
    finalView: ViewType;
    
    constructor(project: any) {
        if (!project) {
            throw createError('No project provided');
        }
        let errors: String[] = [];
        let fields = Object.keys(this);
        fields.forEach((field) => {
            if (!project[field]) {
                errors.push(`No ${field} provided`);
            }
        });
        if (errors.length > 0) {
            throw createError(errors.join('\n'));
        }
        
        this.title = project.title;
        this.sections = project.sections;
        this.abbreviation = project.abbreviation;
        this.type = project.type;
        this.published = project.published;
        this.settings = project.settings;
        this.finalView = project.finalView;
    }
}

export default Project;