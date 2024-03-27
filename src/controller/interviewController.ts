import { startInterviewDTO, makeFeedbackDTO } from '../interface/DTO';
import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { interviewService } from '../service';

const startInterview = async (req: Request, res: Response, next: NextFunction) => {
  const startInterviewDTO: startInterviewDTO = req.body;
  const refreshToken = req.body;

  try {
    const data = await interviewService.startInterview(startInterviewDTO, refreshToken);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.START_INTERVIEW_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

const makeFeedback = async (req: Request, res: Response, next: NextFunction) => {
    const makeFeedbackDTO: makeFeedbackDTO = req.body;
    
    try {
        const data = await interviewService.makeFeedback(makeFeedbackDTO);

        return res
        .status(statusCode.CREATED)
        .send(success(statusCode.CREATED, message.MAKE_FEEDBACK_SUCCESS, data));
    } catch (error) {
        next(error);
    }
}

export default {
  startInterview,
  makeFeedback,
};