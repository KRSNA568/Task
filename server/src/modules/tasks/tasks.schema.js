const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(300).required(),
  description: Joi.string().max(5000).allow('', null),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  assigned_to: Joi.string().uuid().allow(null),
  due_date: Joi.date().iso().allow(null),
  tags: Joi.array().items(Joi.string().max(50)).default([]),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(300),
  description: Joi.string().max(5000).allow('', null),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  assigned_to: Joi.string().uuid().allow(null),
  due_date: Joi.date().iso().allow(null),
  tags: Joi.array().items(Joi.string().max(50)),
}).min(1);

module.exports = { createTaskSchema, updateTaskSchema };
