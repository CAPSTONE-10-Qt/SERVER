import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { studynoteController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.patch(
  '/:interviewQuestionId',
  [
    param('interviewQuestionId').notEmpty(),
    body('refreshToken').notEmpty()
  ],
  errorValidator,
  studynoteController.startAgain,
);

export default router;