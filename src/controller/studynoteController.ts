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

const getStudyNotes = async (req: Request, res: Response, next: NextFunction) => {
  const sortNumParam = req.params.sortNum;
  const sortNum = typeof sortNumParam === 'string' ? parseInt(sortNumParam, 10) : 1;
  const subjectText = typeof req.query.subjectText === 'string';
  const onlyWrong = typeof req.query.onlyWrong === 'boolean';
  const refreshToken = req.body.refreshToken;

  try {
    const data = await studynoteService.getStudyNotes(sortNum, "hi", onlyWrong, refreshToken);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_INTERVIEWLIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

const endAgain = async (req: Request, res: Response, next: NextFunction) => {
  const interviewQuestionId = req.params.interviewQuestionId;
  const time = req.body.time;
  const endDateTime = req.body.endDateTime;
  try {
    const data = await studynoteService.endAgain(+interviewQuestionId, time, endDateTime);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_INTERVIEWLIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export default {
    startAgain,
    getStudyNotes,
    endAgain,
};