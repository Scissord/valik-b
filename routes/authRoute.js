import express from 'express';
import * as controller from '#controllers/authController.js';
import verify from '#middleware/verify.js';
import {
  loginValidation,
  registrationValidation
} from '#validations/auth/index.js';
import validate from '#middleware/validate.js';

const router = express.Router();

// work with user authorization
router.post('/login', validate(loginValidation), controller.userLogin);
router.post('/registration', validate(registrationValidation), controller.userRegistration);
router.post('/logout', verify('user'), controller.userLogout);
router.post('/refresh', verify('user'), controller.userRefresh);

export default router;
