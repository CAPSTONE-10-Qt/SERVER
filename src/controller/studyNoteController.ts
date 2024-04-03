import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { studyNoteService } from '../service';

const getStudyNote = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.body;
  const sortNum = +req.params.sortNum;
  const subjectText = req.query.subjectText as string;
  const onlyWrong = req.query.onlyWrong === 'true'; 
  try {
    const data = await studyNoteService.getStudyNote(refreshToken, subjectText, onlyWrong, +sortNum);
    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.GET_STUDYNOTE_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export default {
    getStudyNote,
};