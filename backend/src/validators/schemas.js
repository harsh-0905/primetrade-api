const Joi = require("joi");

// ─── Auth Validators ──────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

// ─── Task Validators ──────────────────────────────────────────────
const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  status: Joi.string().valid("todo", "in-progress", "done").optional(),
  priority: Joi.string().valid("low", "medium", "high").optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(""),
  status: Joi.string().valid("todo", "in-progress", "done").optional(),
  priority: Joi.string().valid("low", "medium", "high").optional(),
}).min(1); // At least one field must be provided

// ─── Middleware Factory ───────────────────────────────────────────
// Returns an Express middleware that validates req.body against a schema
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message.replace(/"/g, ""));
    return res.status(400).json({ success: false, message: messages.join("; ") });
  }
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
};
