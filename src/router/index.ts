import { Router } from "express";
import interviewRouter from './interviewRouter';

const router: Router = Router();

router.use('/interview', interviewRouter);

export default router;