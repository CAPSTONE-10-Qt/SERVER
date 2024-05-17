import { Request, Response, NextFunction } from 'express';
import { exceptionMessage, message, rm, sc, statusCode } from '../module/constant';
import { success, fail } from '../module/constant/utils';
import { userService } from '../service';
import jwt from '../module/jwtHandler';
import { validationResult } from 'express-validator';
import { UserCreateDTO, UserSignInDTO } from '../interface/DTO';
import jwtHandler from '../module/jwtHandler';

const createUser = async (req: Request, res: Response) => {

  //? 기존 비구조화 할당 방식 -> DTO의 형태
  const userCreateDto: UserCreateDTO = req.body;
  const data = await userService.createUser(userCreateDto);

  if (!data) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.SIGNUP_FAIL))
  }

  const accessToken = jwtHandler.sign(data.id);

  const result = {
    id: data.id,
    name: data.userName,
    accessToken,
  };

  return res.status(sc.CREATED).send(success(sc.CREATED, rm.SIGNUP_SUCCESS, result));
};

const signInUser = async (req: Request, res: Response) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }

  const userSignInDto: UserSignInDTO = req.body;

  try {
    const userId = await userService.signIn(userSignInDto);

    if (!userId) return res.status(sc.NOT_FOUND).send(fail(sc.NOT_FOUND, rm.NOT_FOUND));
    else if (userId === sc.UNAUTHORIZED)
      return res.status(sc.UNAUTHORIZED).send(fail(sc.UNAUTHORIZED, rm.INVALID_PASSWORD));

    const accessToken = jwtHandler.sign(userId);

    const result = {
      id: userId,
      accessToken,
    };

    res.status(sc.OK).send(success(sc.OK, rm.SIGNIN_SUCCESS, result));
  } catch (e) {
    console.log(error);
    //? 서버 내부에서 오류 발생
    res.status(sc.INTERNAL_SERVER_ERROR).send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
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
    signInUser
};