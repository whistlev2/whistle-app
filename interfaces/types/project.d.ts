interface ConditionType {
    operation: 'equals' | 'contains' | 'includes';
    arguments: string[];
}

interface ActionType {
    operation: 'set' | 'jump' | 'send';
    arguments: string[];
}

interface ValidationType {
    type: 'required' | 'regex' | 'is';
    arguments?: string[];
}

//TODO: Make separate types for each input type
interface InputType {
    type: 'text' | 'multiple';
    actions: ActionType[];
    options?: string[];
    allowOther?: boolean;
    allowMultiple?: boolean;
    validations: ValidationType[];
}

interface TextBodyType {
    contents: string;
}

interface CustomBodyType {
    contents: string;
}

interface ViewType {
    ref: string;
    type: 'text' | 'custom';
    input?: InputType;
    body: TextBodyType | CustomBodyType;
    show: ConditionType[];
}

type SectionBodyType = SectionType | ViewType; //TODO: This isn't clean

interface SectionType {
    type: 'section';
    title: string;
    body: Array<SectionBodyType>;
    show: ConditionType[];
}

interface MessagingSettingsType {
    keywords: { [key: string]: ActionType };
    errorMessage: string;
    parsingErrorMessage: string;
}

interface WebSettingsType {
    image?: string;
    colour?: string;
    errorLink?: string;
}

interface ProjectType {
    title: string;
    sections: SectionBodyType[];
    abbreviation: string;
    type: 'web' | 'sms' | 'mms';
    published: boolean;
    settings: WebSettingsType | MessagingSettingsType;
    finalView: ViewType;
}

interface MessagingProjectType extends ProjectType {
    settings: MessagingSettingsType;
    type: 'sms' | 'mms';
}

export {
    ConditionType,
    ActionType,
    ValidationType,
    InputType,
    TextBodyType,
    CustomBodyType,
    ViewType,
    SectionBodyType,
    SectionType,
    MessagingSettingsType,
    WebSettingsType,
    ProjectType,
    MessagingProjectType
};

export default ProjectType;
