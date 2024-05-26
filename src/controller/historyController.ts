import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { historyService } from '../service';
import { auth } from '../middleware';

const getInterviewList = async (req: Request, res: Response, next: NextFunction) => {
  const sortNum = req.params.sortNum;
  const userId = req.body.userId;

  try {
    const data = await historyService.getInterviewList(userId, +sortNum);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_INTERVIEWLIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

const deleteAgain = async (req: Request, res: Response, next: NextFunction) => {
  const interviewQuestionId = req.params.interviewQuestionId;

  try {
    const data = await historyService.deleteAgain(+interviewQuestionId);
    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_INTERVIEWLIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
}

export default {
    getInterviewList,
    deleteAgain,
};