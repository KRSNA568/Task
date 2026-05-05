const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(2000).allow('', null),
  status: Joi.string().valid('active', 'on_hold', 'completed', 'archived').default('active'),
  due_date: Joi.date().iso().allow(null),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().max(2000).allow('', null),
  status: Joi.string().valid('active', 'on_hold', 'completed', 'archived'),
  due_date: Joi.date().iso().allow(null),
}).min(1);

const addMemberSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  role: Joi.string().valid('admin', 'member').default('member'),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
