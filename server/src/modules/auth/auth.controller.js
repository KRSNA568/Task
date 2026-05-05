const { createUser, validateCredentials, issueTokens, verifyRefreshToken, getUserById } = require('./auth.service');
const { success, error } = require('../../utils/apiResponse');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const signup = async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    const { accessToken, refreshToken } = issueTokens(user);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return success(res, { user, accessToken }, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await validateCredentials(email, password);
    if (!user) return error(res, 'Invalid email or password', 401);

    const { accessToken, refreshToken } = issueTokens(user);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return success(res, { user, accessToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return error(res, 'No refresh token', 401);

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return error(res, 'Invalid or expired refresh token', 401);
    }

    const user = await getUserById(payload.id);
    if (!user) return error(res, 'User not found', 401);

    const { accessToken, refreshToken: newRefreshToken } = issueTokens(user);
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    return success(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, refreshToken, logout };
