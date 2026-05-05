const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../../config/supabase');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('../../config/env');

const SALT_ROUNDS = 10;

const createUser = async ({ name, email, password }) => {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash })
    .select('id, name, email, role, avatar_url, created_at')
    .single();

  if (error) {
    if (error.code === '23505') throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
    throw error;
  }
  return data;
};

const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, password_hash, avatar_url')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
};

const validateCredentials = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  const { password_hash, ...safeUser } = user;
  return safeUser;
};

const issueTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

const getUserById = async (id) => {
  const { data } = await supabase
    .from('users')
    .select('id, name, email, role, avatar_url, created_at')
    .eq('id', id)
    .single();
  return data;
};

module.exports = { createUser, validateCredentials, issueTokens, verifyRefreshToken, getUserById };
