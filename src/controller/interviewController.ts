import { startInterviewDTO } from '../interface/DTO';
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

export default {
  startInterview,
};