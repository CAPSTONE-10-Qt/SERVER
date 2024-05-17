import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { questionService } from '../service';

const addPin = async (req: Request, res: Response, next: NextFunction) => {
  const interviewQuestionId = req.params.interviewQuestionId;
  try {
    const data = await questionService.addPin(+interviewQuestionId);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_INTERVIEWLIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export default {
    addPin,
};