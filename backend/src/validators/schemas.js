const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }
  next();
};

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(1000).allow("").optional(),
  status: Joi.string().valid("todo", "in-progress", "done").optional(),
  priority: Joi.string().valid("low", "medium", "high").optional(),
  dueDate: Joi.date().allow(null, "").optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(1000).allow("").optional(),
  status: Joi.string().valid("todo", "in-progress", "done").optional(),
  priority: Joi.string().valid("low", "medium", "high").optional(),
  dueDate: Joi.date().allow(null, "").optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

module.exports = { validate, registerSchema, loginSchema, createTaskSchema, updateTaskSchema };