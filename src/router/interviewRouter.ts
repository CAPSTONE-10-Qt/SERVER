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
);

router.post(
  '/picture/:interviewQuestionId',
  [
    param('interviewQuestionId').notEmpty(),
    body('angry'),
    body('disgust'),
    body('fear'),
    body('happy'),
    body('sad'),
    body('surprise'),
    body('neutral'),
  ],
  errorValidator,
  interviewController.saveEmotion,
);

router.patch(
  '/:interviewQuestionId',
  [
    param('interviewQuestionId').notEmpty(),
    body('endDateTime'),
  ],
  errorValidator,
  interviewController.endInterview,
);

router.get(
  '/result/:interviewId',
  [
    param('interviewId').notEmpty(),
  ],
  errorValidator,
  interviewController.firstResultInterview,
);


export default router;