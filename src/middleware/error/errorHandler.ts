import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import config from '../../config/index';
import responseMessage from '../../module/constant/responseMessage';
import { fail } from '../../module/constant/utils';
import { ErrorWithStatusCode } from './errorGenerator';

const generalErrorHandler: ErrorRequestHandler = (
  error: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { message, statusCode } = error;
  // 인자로 statusCode를 넘기지 않는 경우, 500 에러를 보냄
  if (!statusCode || statusCode == 500) {
    return res
      .status(500)
      .send(fail(500, responseMessage.INTERNAL_SERVER_ERROR));
  } else {
    return res.status(statusCode).send(fail(statusCode, message));
  }
};

export default generalErrorHandler;