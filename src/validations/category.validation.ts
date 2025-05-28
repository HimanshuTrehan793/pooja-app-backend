import Joi from "joi";

export const categoryValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  image: Joi.string().required(),
});

export const subCategoryValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  image: Joi.string().required(),
  parent_id: Joi.string().required(),
});

