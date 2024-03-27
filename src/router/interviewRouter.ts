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


export default router;