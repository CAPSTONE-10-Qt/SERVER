import { Request, Response, NextFunction } from 'express';
import { message, statusCode } from '../module/constant';
import { success } from '../module/constant/utils';
import { userService } from '../service';

const accessUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.headers['refreshtoken'] as string;
  try {
    const data = await userService.accessUserInfo(refreshToken);

    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.ACCESS_USERINFO_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

const updateUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.headers['refreshtoken'] as string;
    const themeColor = req.body.themeColor;
    try {
      const data = await userService.updateUserInfo(refreshToken, themeColor);
  
      return res
        .status(statusCode.CREATED)
        .send(success(statusCode.CREATED, message.UPDATE_USERINFO_SUCCESS, data));
    } catch (error) {
      next(error);
    }
  };

export default {
    accessUserInfo,
    updateUserInfo
};