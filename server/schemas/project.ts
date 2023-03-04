import Joi from "joi";
import { ProjectType } from "~~/interfaces/types";

let actionSchema = {
    operation: Joi.string().valid("set", "jump", "send").required(),
    arguments: Joi.array().items(Joi.string()).required()
};

let validationSchema = {
    type: Joi.string().valid("required", "regex", "is").required(),
    arguments: Joi.array().items(Joi.string())
};

let inputSchema = {
    type: Joi.string().valid("text", "multiple").required(),
    actions: Joi.array().items(actionSchema).required(),
    options: Joi.array().items(Joi.string()),
    allowOther: Joi.boolean(),
    allowMultiple: Joi.boolean(),
    validations: Joi.array().items(validationSchema).required()
};

let textBodySchema = {
    contents: Joi.string().required()
};

let customBodySchema = {
    contents: Joi.string().required()
};

let conditionSchema = {
    operation: Joi.string().valid("equals", "contains", "includes").required(),
    arguments: Joi.array().items(Joi.string()).required()
};

let viewSchema = {
    ref: Joi.string().required(),
    type: Joi.string().valid("text", "custom").required(),
    input: inputSchema,
    body: Joi.alternatives().try(textBodySchema, customBodySchema).required(),
    show: Joi.array().items(conditionSchema).required()
};
let sectionSchema = Joi.object()
    .keys({
        type: Joi.string().valid("section").required(),
        title: Joi.string().required(),
        body: Joi.array()
            .items(Joi.alternatives().try(Joi.link("#section"), viewSchema))
            .required()
    })
    .id("section");

let webSettingsSchema = {
    image: Joi.string(),
    colour: Joi.string(),
    errorLink: Joi.string(),
    published: Joi.boolean().required()
};

let messagingSettingsSchema = {
    keywords: Joi.object().pattern(Joi.string(), actionSchema),
    errorMessage: Joi.string(),
    parsingErrorMessage: Joi.string(),
    published: Joi.boolean().required(),
    finalView: viewSchema
};

let projectSchema = {
    title: Joi.string().required(),
    sections: Joi.array()
        .items(Joi.alternatives().try(sectionSchema, viewSchema))
        .required(),
    ref: Joi.string().required(),
    type: Joi.string().valid("web", "sms", "mms").required(),
    settings: Joi.alternatives()
        .try(webSettingsSchema, messagingSettingsSchema)
        .required()
};

//TODO: Add web and messaging specific schemas
export default Joi.object<ProjectType>(projectSchema);
