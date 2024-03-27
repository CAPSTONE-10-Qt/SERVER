import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { interviewController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.post(
  '/',
  [
    body('refreshToken').notEmpty(),
    body('subjectText').notEmpty(),
    body('questionNum').notEmpty(),
    body('onlyVoice').notEmpty(),
    body('startDateTime').notEmpty(),
  ],
  errorValidator,
  interviewController.startInterview,
);

router.post(
  '/answers/:interviewQuestionId',
  [
    param('interviewQuestionId').notEmpty(),
    body('mumble'),
    body('silent'),
    body('talk'),
    body('time'),
    body('text'),
  ],
  errorValidator,
  interviewController.makeFeedback,
)

export default router;