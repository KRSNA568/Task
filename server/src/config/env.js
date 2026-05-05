require('dotenv').config();
const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  CLIENT_URL: Joi.string().default('http://localhost:5173'),
}).unknown(true);

const { error, value } = schema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  NODE_ENV: value.NODE_ENV,
  PORT: value.PORT,
  SUPABASE_URL: value.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: value.SUPABASE_SERVICE_ROLE_KEY,
  JWT_ACCESS_SECRET: value.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: value.JWT_REFRESH_SECRET,
  CLIENT_URL: value.CLIENT_URL,
};
