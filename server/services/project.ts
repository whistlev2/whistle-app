import {
    ActionType,
    ConditionType,
    InputType,
    ProjectType,
    ReportType,
    SectionBodyType,
    SessionType,
    ValidationType,
    ViewType
} from "~~/interfaces/types";
import ProjectModel from "~~/server/models/project";
import { MessagingSessionModelType } from "~~/server/models/session";
import ReportServices from "./report";
import MessagingServices from "./messaging";
import SessionServices from "./session";

function getSectionViews(sections: Array<SectionBodyType>): Array<ViewType> {
    let views: Array<ViewType> = [];
    var section;
    for (let i = 0; i < sections.length; i++) {
        section = sections[i];
        if (section.type === "section") {
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
    if (ref === "end") {
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
        throw createError("Error creating project");
    }
    return getProjectObject(ret);
}

async function getProject(projectID: string) {
    try {
        let ret = await ProjectModel.findById(projectID);
        return ret;
    } catch (err) {
        console.error("Error getting project"); //TODO: Handle differently
    }
}

async function getProjectModelFromReference(projectRef: string) {
    let project = await ProjectModel.findOne({ ref: projectRef });
    return project;
}

async function getProjectFromReference(projectRef: string) {
    let project = await getProjectModelFromReference(projectRef);
    return getProjectObject(project);
}

async function updateProject(updatedProject: ProjectType) {
    let project = await ProjectModel.findOne({ ref: updatedProject.ref });

    if (!project) {
        throw createError({
            statusCode: 404,
            message: "Not found - project not found"
        });
    }

    project.set(updatedProject);
    await project.save();
    return getProjectObject(project);
}

async function deleteProjectFromReference(projectRef: string) {
    let project = await ProjectModel.findOneAndDelete({ ref: projectRef });
    return getProjectObject(project);
}

//TODO: Move action/validation/condition logic to session services? or another file?
function checkValidation(input: string, validation: ValidationType) {
    switch (validation.type) {
        case "required":
            return input.length > 0;
        case "regex":
            return true; //TODO: Implement
        case "is":
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
        case "multiple":
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
                        option = MessagingServices.parseOption(
                            selections[i],
                            definition.options
                        ).toLowerCase();
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
                    let option = MessagingServices.parseOption(
                        input,
                        definition.options
                    ).toLowerCase();
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
                parsedOptions: parsedOptions.join(";")
            };
        default:
            return {
                valid: true
            };
    }
}

async function performAction(
    action: ActionType,
    input: string,
    session: MessagingSessionModelType,
    view?: ViewType
) {
    switch (action.operation) {
        case "set":
            //TODO: Validate arguments
            //TODO: Implement replace functionality
            //TODO: Add overwrite/clear functionality
            if (session.activeReport) {
                await ReportServices.addToField(
                    session.activeReport,
                    action.arguments[0],
                    input
                );
            } else {
                let report: ReportType = {
                    fields: {},
                    test: session.test,
                    timestamp: new Date(),
                    projectRef: session.project.ref,
                    tags: []
                };
                report.fields[action.arguments[0]] = {
                    value: input,
                    view: view
                };
                let updatedReport = await ReportServices.createReport(report);
                //TODO: Handle errors differently
                if (updatedReport) {
                    session.activeReport = updatedReport._id;
                    session.reports.push(updatedReport._id);
                    SessionServices.updateSession(session._id, session);
                }
            }
            break;
        case "jump":
            let newCursor = getViewIndex(input, session.project.sections);
            if (newCursor >= 0) {
                session.cursor = newCursor;
                SessionServices.updateSession(session._id, session);
            }
            break;
        case "send":
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

function meetsCondition(
    condition: ConditionType,
    session: SessionType
): boolean {
    //TODO: Handle errors
    try {
        switch (condition.operation) {
            case "equals":
                if (!session.fields) {
                    return false;
                }
                return (
                    session.fields[condition.arguments[0]].value ===
                    condition.arguments[1]
                );
            case "contains":
                if (!session.fields) {
                    return false;
                }
                return condition.arguments[1]
                    .split(";")
                    .includes(session.fields[condition.arguments[0]].value);
            case "includes":
                if (!session.fields) {
                    return false;
                }
                return session.fields[condition.arguments[0]].value
                    .split(";")
                    .includes(condition.arguments[1]);
            default:
                return false;
        }
    } catch (err) {
        return false;
    }
}

function meetsAllConditions(
    conditions: Array<ConditionType>,
    session: SessionType
) {
    for (let i = 0; i < conditions.length; i++) {
        if (!meetsCondition(conditions[i], session)) {
            return false;
        }
    }
    return true;
}

function getViewText(view: ViewType) {
    switch (view.type) {
        case "text":
            return view.body.contents;
        case "custom":
            return view.body.contents; //TODO: Implement
        default:
            return "";
    }
}

function getProjectObject(project: ProjectType | null): ProjectType | null {
    if (!project) {
        return null;
    }
    return {
        title: project.title,
        sections: project.sections,
        ref: project.ref,
        type: project.type,
        settings: project.settings
    };
}

export default {
    createProject,
    getSectionViews,
    getProject,
    getProjectModelFromReference,
    getProjectFromReference,
    updateProject,
    deleteProjectFromReference,
    validateInput,
    performAction,
    meetsAllConditions,
    getViewText
};
