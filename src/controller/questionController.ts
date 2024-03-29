import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { questionService } from '../service';

const addPin = async (req: Request, res: Response, next: NextFunction) => {
  const {interveiwQuestionId} = req.params;

  try {
    const data = await questionService.addPin(+interveiwQuestionId);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.ADD_PIN_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

const deletePin = async (req: Request, res: Response, next: NextFunction) => {
    const {interveiwQuestionId} = req.params;
  
    try {
      const data = await questionService.deletePin(+interveiwQuestionId);
  
      return res
        .status(statusCode.CREATED)
        .send(success(statusCode.CREATED, message.DELETE_PIN_SUCCESS, data));
    } catch (error) {
      next(error);
    }
  };

export default {
    addPin,
    deletePin,
};