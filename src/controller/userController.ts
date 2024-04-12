import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { userService } from '../service';

const accessUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  //const refreshToken = req.headers['refreshtoken'] as string;
  const refreshToken = req.body.refreshToken
  try {
    const data = await userService.accessUserInfo(refreshToken);
    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.ACCESS_USERINFO_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export default {
    accessUserInfo,
};