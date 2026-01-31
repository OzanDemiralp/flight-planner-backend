import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': '"name" must be a string',
    'string.empty': '"name" is required',
    'string.min': '"name" must be at least 2 characters',
    'string.max': '"name" must be at most 50 characters',
    'any.required': '"name" is required',
  }),

  email: Joi.string().trim().lowercase().email().required().messages({
    'string.base': '"email" must be a string',
    'string.email': '"email" must be a valid email',
    'string.empty': '"email" is required',
    'any.required': '"email" is required',
  }),

  password: Joi.string().min(6).max(72).required().messages({
    'string.base': '"password" must be a string',
    'string.empty': '"password" is required',
    'string.min': '"password" must be at least 8 characters',
    'string.max': '"password" must be at most 72 characters',
    'any.required': '"password" is required',
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': '"email" must be a valid email',
    'any.required': '"email" is required',
  }),
  password: Joi.string().required().messages({
    'any.required': '"password" is required',
  }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});
