import { Joi, Segments } from 'celebrate';

export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.base': 'Password must be a string',
      'string.min': 'Password should have at least {#limit} characters',
      'any.required': 'Password is required',
    }),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'string.base': 'Password must be a string',
      'any.required': 'Password is required',
    }),
  }),
};
