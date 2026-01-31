import express from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validation/authSchema.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', me);

export default router;
