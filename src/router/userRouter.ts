import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { userController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.get(
  '/',
  [
    body('refreshToken'),
  ],
  errorValidator,
  userController.accessUserInfo,
);

export default router;