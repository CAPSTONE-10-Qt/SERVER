import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { studynoteService } from '../service';

const startAgain = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.body.refreshToken;
  const interviewQuestionId = req.params.interviewQuestionId;
  try {
    const data = await studynoteService.startAgain(+interviewQuestionId, refreshToken);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_INTERVIEWLIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export default {
    startAgain,
};