const express = require('express');
const router = express.Router();
const ctrl = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const verifyToken = require('../../middleware/verifyToken');
const { signupSchema, loginSchema } = require('./auth.schema');

router.post('/signup', validate(signupSchema), ctrl.signup);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', verifyToken, ctrl.logout);

module.exports = router;
