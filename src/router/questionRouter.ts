import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { questionController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.patch(
  '/:interviewQuestionId',
  [
    param('interveiwQuestionId').notEmpty(),
  ],
  errorValidator,
  questionController.addPin,
);

router.delete(
    '/:interviewQuestionId',
    [
        param('interviewQuestionId').notEmpty(),
    ],
    errorValidator,
    questionController.deletePin,
)

export default router;