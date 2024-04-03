import { Router } from 'express';
import { body, header, param, query } from 'express-validator';
import { studyNoteController } from '../controller';
import errorValidator from '../middleware/error/errorValidator';

const router: Router = Router();

router.get(
    '/:sortNum',
    [
      param('sortNum').notEmpty(),
      query('subjectText').notEmpty(),
      query('onlyWrong').notEmpty(),
      header('refreshToken').notEmpty(),
    ],
    errorValidator,
    studyNoteController.getStudyNote,
  );

export default router;