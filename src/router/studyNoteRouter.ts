import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { studyNoteController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.get(
    '/:sortNum',
    [
      param('sortNum').notEmpty(),
      body('refreshToken').notEmpty(),
    ],
    errorValidator,
    studyNoteController.getStudyNote,
  );

export default router;