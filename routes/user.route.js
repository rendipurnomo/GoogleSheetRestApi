import express from 'express';
import * as userController from '../controllers/userController.js';
import { adminOnly, verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/users',verifyToken,adminOnly, userController.getUsers);
router.get('/users/:id',verifyToken, userController.getUser);
router.patch('/users/:id',verifyToken, userController.editUser);
router.delete('/users/:id',verifyToken,adminOnly, userController.deleteUser);

export default router;