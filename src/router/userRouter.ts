import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { userController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.get(
  '/',
  [
    body('refreshToken').notEmpty(),
  ],
  errorValidator,
  userController.accessUserInfo,
);

router.patch(
    '/',
    [
      body('refreshToken').notEmpty(),
      body('themeColor'),
    ],
    errorValidator,
    userController.updateUserInfo,
  );

export default router;