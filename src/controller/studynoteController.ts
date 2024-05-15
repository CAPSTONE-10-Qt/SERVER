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
  const sortNum = parseInt(req.params.sortNum, 10); // sortNum을 숫자로 변환
  const subjectText = req.query.subjectText as string; // subjectText를 문자열로 타입 변환
  const onlyWrong = req.query.onlyWrong === 'true'
  const refreshToken = req.body.refreshToken;

  try {
    const data = await studynoteService.getStudyNotes(sortNum, subjectText, onlyWrong, refreshToken);

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

const getQuestionDetail = async (req: Request, res: Response, next: NextFunction) => {
  const questionId = req.params.questionId;

  try {
    const data = await studynoteService.getQuestionDetail(+questionId);

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
    getQuestionDetail,
};