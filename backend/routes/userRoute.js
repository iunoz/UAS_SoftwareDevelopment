import express from 'express';
import { register, login, updatePassword, deleteUser, getUserData, updateAddress, setAdmin, getAllUsers } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.get('/all', authMiddleware, getAllUsers);
userRouter.post('/register', register)
userRouter.post('/login', login);
userRouter.put('/forgot-password', updatePassword); // update password (blm login)
userRouter.put('/:uid/forgot-password', updatePassword); // update password
userRouter.delete('/:uid', deleteUser); // delete user
userRouter.get('/:uid', getUserData); // get user profile data
userRouter.put('/:uid/update-address', updateAddress); // update user address
userRouter.put('/:uid/set-role', authMiddleware, setAdmin); // authMiddleware harus cek JWT & set req.user

export default userRouter;