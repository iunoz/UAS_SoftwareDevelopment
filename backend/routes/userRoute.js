import express from 'express';
import { register, login, updatePassword, deleteUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login);
userRouter.put('/:uid/forgot-password', updatePassword); // update password
userRouter.delete('/:uid', deleteUser); // delete user

export default userRouter;