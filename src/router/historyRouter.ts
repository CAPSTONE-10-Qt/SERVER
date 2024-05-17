import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { historyController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';
import { auth } from '../middleware';

const router: Router = Router();

router.get(
  '/:sortNum',
  [
    param('sortNum').notEmpty(),
  ],
  errorValidator,
  auth,
  historyController.getInterviewList,
);

export default router;