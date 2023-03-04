import Joi from "joi";
import { IncomingMessageType } from "~~/interfaces/types";

let incomingMessageSchema = {
    Body: Joi.string().required()
};

export default Joi.object<IncomingMessageType>(incomingMessageSchema);
