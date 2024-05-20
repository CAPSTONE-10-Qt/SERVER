import { Request, Response, NextFunction } from 'express';
import { exceptionMessage, message, rm, sc, statusCode } from '../module/constant';
import { success, fail } from '../module/constant/utils';
import { userService } from '../service';
import jwt from '../module/jwtHandler';
import { validationResult } from 'express-validator';
import { UserCreateDTO, UserSignInDTO } from '../interface/DTO';
import jwtHandler from '../module/jwtHandler';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id, name, avatar_url } = req.body;
  const data = await userService.createUser(id, name, avatar_url)
  const accessToken = jwtHandler.sign(id);
  const result = {
    id: data.id,
    name: data.name,
    img: data.img,
    githubID: data.githubID,
    accessToken
  }
  return res.status(sc.CREATED).send(success(sc.CREATED, rm.SIGNUP_SUCCESS, result));
};

const accessUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.userId;
  try {
    const data = await userService.accessUserInfo(userId);
    return res
      .status(statusCode.CREATED)
      .send(success(statusCode.CREATED, message.ACCESS_USERINFO_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export default {
    accessUserInfo,
    createUser,
};