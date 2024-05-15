import { Router } from 'express';
import { body, header, param, query } from 'express-validator';
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

router.get(
  '/:sortNum', 
  [
    param('sortNum').notEmpty(),
    query('subjectText').notEmpty(),
    query('onlyWrong').notEmpty(),
    body('refreshToken').notEmpty()
  ], 
  errorValidator, 
  studynoteController.getStudyNotes,
);

router.patch(
  '/end/:interviewQuestionId', 
  [
    param('interviewQuestionId').notEmpty(),
    body('time'),
    body('endDateTime')
  ], 
  errorValidator, 
  studynoteController.endAgain,
);

router.get(
  '/detail/:questionId',
  [
    param('questionId').notEmpty(),
  ],
  errorValidator,
  studynoteController.getQuestionDetail
)

export default router;