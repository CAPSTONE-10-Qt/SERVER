import { Router } from "express";
import interviewRouter from './interviewRouter';
import userRouter from "./userRouter";
import historyRouter from "./historyRouter";
import questionRouter from "./questionRouter";

const router: Router = Router();

router.use('/interview', interviewRouter);
router.use('/accounts', userRouter);
router.use('/history', historyRouter);
router.use('/question', questionRouter);

export default router;