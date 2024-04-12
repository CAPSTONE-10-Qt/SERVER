import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { userController } from '../controller';
import auth from '../middleware/auth';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.post('/auth', [
  body('social').isString().notEmpty().isIn(['GOOGLE']),
  errorValidator,
  userController.getSocialUser,
]);

router.get('/myPage', auth, userController.accessUserInfo);

export default router;