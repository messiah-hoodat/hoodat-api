import * as Joi from 'joi';

export const LIST_COLORS = ['orange', 'pink', 'blue'];

export const addListInputSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  color: Joi.string()
    .valid(...LIST_COLORS)
    .optional(),
  contacts: Joi.array().items(Joi.string()).optional(),
});

export default addListInputSchema;
