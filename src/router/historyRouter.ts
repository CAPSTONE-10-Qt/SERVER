import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { historyController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.get(
  '/:sortNum',
  [
    param('sortNum'),
    header('refreshToken'),
  ],
  errorValidator,
  historyController.getInterviewList,
);

export default router;