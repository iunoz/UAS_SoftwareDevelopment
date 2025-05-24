import express from 'express';
import { register, login, updatePassword, deleteUser, getUserData, updateAddress } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login);
userRouter.put('/forgot-password', updatePassword); // update password (blm login)
userRouter.put('/:uid/forgot-password', updatePassword); // update password
userRouter.delete('/:uid', deleteUser); // delete user
userRouter.get('/:uid', getUserData); // get user profile data
userRouter.put('/:uid/update-address', updateAddress); // update user address

export default userRouter;