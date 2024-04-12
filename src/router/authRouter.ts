import { Router } from 'express';
import tokenController from '../controller/tokenController';

const router: Router = Router();

router.use('/token', tokenController.getValidAccessToken);
export default router;