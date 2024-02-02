import express from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import { refreshToken } from '../middleware/auth.middleware.js';
import { addUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', login);
router.delete('/logout', logout);
router.get('/token', refreshToken);
router.post('/register', addUser);

export default router