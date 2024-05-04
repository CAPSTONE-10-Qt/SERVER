import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { questionController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.patch(
  '/:interviewQuestionId',
  [
    param('interviewQuestionId').notEmpty(),
    body('pin').notEmpty(),
  ],
  errorValidator,
  questionController.addPin,
);

export default router;