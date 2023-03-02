import { ActionType, ConditionType, InputType, ProjectType, SectionBodyType, ValidationType, ViewType } from '../../interfaces/types';
import ProjectModel from '../models/project';
import { MessagingSessionModelType } from '../models/session';
import { ReportModelType } from '../models/report';
import ReportServices from './report';
import MessagingServices from './messaging';
import SessionServices from './session';

function getSectionViews(sections: Array<SectionBodyType>): Array<ViewType> {
    let views: Array<ViewType> = [];
    var section;
    for (let i = 0; i < sections.length; i++) {
        section = sections[i];
        if (section.type === 'section') {
            views = views.concat(getSectionViews(section.body));
        } else {
            views.push(section);
        }
    }
    //TODO: Compute conditions for each view and use number cursor to determine which view to show
    //Use views array to calculate cursor from reference
    return views;
}

function getViewIndex(ref: string, sections: Array<SectionBodyType>): number {
    let views = getSectionViews(sections);
    if (ref === 'end') {
        return views.length;
    }
    for (let i = 0; i < views.length; i++) {
        if (views[i].ref === ref) {
            return i;
        }
    }
    return -1;
}

async function createProject(project: ProjectType) {
    let ret = await ProjectModel.create(project);
    if (!ret) {
        throw createError('Error creating project');
    }
    return getProjectObject(ret);
}

async function getProject(projectID: string) {
    try {
        let ret = await ProjectModel.findById(projectID);
        return ret;
    } catch (err) {
        console.error('Error getting project'); //TODO: Handle differently
    }
}

async function getProjectModelFromAbbreviation(abbreviation: string) {
    let project = await ProjectModel.findOne({ abbreviation: abbreviation });
    return project;
}

async function getProjectFromAbbreviation(abbreviation: string) {
    let project = await getProjectModelFromAbbreviation(abbreviation);
    return getProjectObject(project);
}

async function updateProject(updatedProject: ProjectType) {
    let project = await ProjectModel.findOne({ abbreviation: updatedProject.abbreviation });

    if (!project) {
        throw createError({
            statusCode: 404,
            message: 'Not found - project not found'
        })
    }

    project.set(updatedProject);
    await project.save();
    return getProjectObject(project);
}

async function deleteProjectFromAbbreviation(abbreviation: string) {
    let project = await ProjectModel.findOneAndDelete({ abbreviation: abbreviation });
    return getProjectObject(project);
}

//TODO: Move action/validation/condition logic to session services? or another file?
function checkValidation(input: string, validation: ValidationType) {
    switch (validation.type) {
        case 'required':
            return input.length > 0;
        case 'regex':
            return true; //TODO: Implement
        case 'is':
            return true; //TODO: Implement
        default:
            return false;
    }
}

function validateInput(input: string, definition: InputType) {
    for (let i = 0; i < definition.validations.length; i++) {
        if (!checkValidation(input, definition.validations[i])) {
            return {
                valid: false
            };
        }
    }
    switch (definition.type) {
        case 'multiple':
            //TODO: Handle differently for web - could parse response before calling this function
            if (definition.allowOther) {
                return {
                    valid: true
                };
            }
            var parsedOptions: string[] = [];
            if (definition.options) {
                if (definition.allowMultiple) {
                    let selections = MessagingServices.parseMultiple(input);
                    var option;
                    for (let i = 0; i < selections.length; i++) {
                        option = MessagingServices.parseOption(selections[i], definition.options).toLowerCase();
                        if (definition.options) {
                            if (definition.options.includes(option)) {
                                parsedOptions.push(option);
                            } else {
                                return {
                                    valid: false
                                };
                            }
                        }
                    }
                } else {
                    let option = MessagingServices.parseOption(input, definition.options).toLowerCase();
                    if (definition.options) {
                        if (definition.options.includes(option)) {
                            parsedOptions = [option];
                        } else {
                            return {
                                valid: false
                            };
                        }
                    }
                }
            }
            return {
                valid: true,
                parsedOptions: parsedOptions.join(';')
            };
        default:
            return {
                valid: true
            };
    }
}

async function performAction(action: ActionType, input: string, session: MessagingSessionModelType) {
    switch (action.operation) {
        case 'set':
            //TODO: Implement replace functionality
            //TODO: Add overwrite/clear functionality
            await ReportServices.addToField(session.current, action.arguments[0], input);
            break;
        case 'jump':
            let newCursor = getViewIndex(input, session.project.sections);
            if (newCursor >= 0) {
                session.cursor = newCursor;
                SessionServices.updateSession(session._id, session);
            }
            break;
        case 'send':
            return {
                messages: [action.arguments[0]]
            };
        default:
            break;
    }
    return {
        messages: []
    };
}

function meetsCondition(condition: ConditionType, report: ReportModelType): boolean {
    //TODO: Handle errors
    try {
        switch (condition.operation) {
            case 'equals':
                return report.fields[condition.arguments[0]].value === condition.arguments[1];
            case 'contains':
                return condition.arguments[1].split(';').includes(report.fields[condition.arguments[0]].value);
            case 'includes':
                return report.fields[condition.arguments[0]].value.split(';').includes(condition.arguments[1]);
            default:
                return false;
        }
    } catch (err) {
        return false;
    }
}

function meetsAllConditions(conditions: Array<ConditionType>, report: ReportModelType) {
    for (let i = 0; i < conditions.length; i++) {
        if (!meetsCondition(conditions[i], report)) {
            return false;
        }
    }
    return true;
}

function getViewText(view: ViewType) {
    switch (view.type) {
        case 'text':
            return view.body.contents;
        case 'custom':
            return view.body.contents; //TODO: Implement
        default:
            return '';
    }
}

function getProjectObject(project: ProjectType | null) : ProjectType | null {
    if (!project) {
        return null;
    }
    return {
        title: project.title,
        sections: project.sections,
        abbreviation: project.abbreviation,
        type: project.type,
        published: project.published,
        settings: project.settings,
        finalView: project.finalView
    };
}

export default {
    createProject,
    getSectionViews,
    getProject,
    getProjectModelFromAbbreviation,
    getProjectFromAbbreviation,
    updateProject,
    deleteProjectFromAbbreviation,
    validateInput,
    performAction,
    meetsAllConditions,
    getViewText
};
