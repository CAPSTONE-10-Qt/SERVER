import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { historyService } from '../service';

const getInterviewList = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.body;
  const {sortNum} = req.params;

  try {
    const data = await historyService.getInterviewList(refreshToken, +sortNum);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_INTERVIEWLIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

const getInterviewDetail = async (req: Request, res: Response, next: NextFunction) => {
  const {interviewId} = req.params;

  try {
    const data = await historyService.getInterviewDetail(+interviewId);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_INTERVIEWDETAIL_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

const deleteInterview = async (req: Request, res: Response, next: NextFunction) => {
  const {interviewId} = req.params;

  try {
    const data = await historyService.deleteInterview(+interviewId);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.DELETE_INTERVIEW_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export default {
    getInterviewList,
    getInterviewDetail,
    deleteInterview,
};