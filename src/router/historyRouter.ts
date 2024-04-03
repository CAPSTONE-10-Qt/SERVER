import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { historyController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.get(
  '/:sortNum',
  [
    param('sortNum'),
    header('refreshToken').notEmpty(),
  ],
  errorValidator,
  historyController.getInterviewList,
);

router.get(
  '/:interviewId',
  [
    param('interviewId').notEmpty(),
  ],
  errorValidator,
  historyController.getInterviewDetail,
)

router.delete(
  '/:interviewId',
  [
    param('interviewId').notEmpty(),
  ],
  errorValidator,
  historyController.deleteInterview,

)
export default router;