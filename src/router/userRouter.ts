import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { userController } from '../controller';
import auth from '../middleware/auth';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.post(
  "/",
  [body("name").notEmpty(), body("email").notEmpty(), body("password").isLength({ min: 6 })],
  userController.createUser
);

router.post(
  "/signin",
  [
    body("email").notEmpty(),
    body("email").isEmail(),
    body("password").notEmpty(),
    body("password").isLength({ min: 6 }),
  ],
  userController.signInUser
);

router.get('/myPage', auth, userController.accessUserInfo);

export default router;