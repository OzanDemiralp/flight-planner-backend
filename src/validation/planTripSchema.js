import Joi from 'joi';

export const planTripSchema = Joi.object({
  departureFrom: Joi.string().trim().min(2).max(50).required(),
  departureTo: Joi.string().trim().min(2).max(50).required(),
  returnFrom: Joi.string().trim().min(2).max(50).required(),
  returnTo: Joi.string().trim().min(2).max(50).required(),

  vacationLength: Joi.number().integer().min(1).max(30).required(),

  minNonWorkingDays: Joi.number().integer().min(0).default(0),

  searchWindow: Joi.object({
    startDate: Joi.date().required().messages({
      'date.base': '"searchWindow.startDate" must be a valid date',
      'any.required': '"searchWindow.startDate" is required',
    }),

    endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
      'date.base': '"searchWindow.endDate" must be a valid date',
      'date.greater':
        '"searchWindow.endDate" must be after "searchWindow.startDate"',
      'any.required': '"searchWindow.endDate" is required',
    }),
  }).required(),

  filters: Joi.object({
    maxTotalPrice: Joi.number().min(0),
    maxWorkDaysUsed: Joi.number().integer().min(0).max(30),
  }).default({}),

  sort: Joi.array()
    .items(
      Joi.object({
        by: Joi.string()
          .valid('totalPrice', 'workDaysUsed', 'nonWorkingDaysCount')
          .required(),
        order: Joi.string().valid('asc', 'desc').default('asc'),
      }).unknown(false)
    )
    .min(1)
    .default([{ by: 'totalPrice', order: 'asc' }]),
}).options({
  abortEarly: false, // return all errors
  stripUnknown: true, // drop random things from request body
});
