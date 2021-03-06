import Joi from 'joi';

export const passwordSchema = Joi.string().min(8).max(200).required();

export const signUpInputSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z ,.'-]+$/i)
    .min(3)
    .max(50)
    .required(),
  email: Joi.string().email().min(3).max(50).required(),
  password: passwordSchema,
});
