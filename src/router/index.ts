import { Router } from "express";
import interviewRouter from './interviewRouter';
import userRouter from "./userRouter";

const router: Router = Router();

router.use('/interview', interviewRouter);
router.use('/accounts', userRouter);

export default router;