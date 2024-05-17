import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, sc, statusCode } from '../module/constant';
import { setDefaultHighWaterMark } from 'stream';
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
import { UserCreateDTO, UserSignInDTO } from '../interface/DTO';

const createUser = async (userCreateDto: UserCreateDTO) => {
  //? 넘겨받은 password를 bcrypt의 도움을 받아 암호화
  const salt = await bcrypt.genSalt(10); //^ 매우 작은 임의의 랜덤 텍스트 salt
  const password = await bcrypt.hash(userCreateDto.password, salt); //^ 위에서 랜덤을 생성한 salt를 이용해 암호화

  const data = await prisma.user.create({
    data: {
      userName: userCreateDto?.name,
      email: userCreateDto.email,
      password: password
    },
  });

  return data;
};

const signIn = async (userSignInDto: UserSignInDTO) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: userSignInDto.email,
        }
      });
      if (!user) return null;
  
      //? bcrypt가 DB에 저장된 기존 password와 넘겨 받은 password를 대조하고,
      //? match false시 401을 리턴
      const isMatch = await bcrypt.compare(userSignInDto.password, user.password);
      if (!isMatch) return sc.UNAUTHORIZED;
  
      return user.id;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

const accessUserInfo = async (userId: number) => {
    try {
        const userInfo = await prisma.user.findFirst({
            where: {
                id: userId
            },
            select: {
                email: true,
                userName: true,
            }
        });
        return userInfo;
    } catch(error) {
        throw error;
    }
};

export default {
    accessUserInfo,
    createUser,
    signIn
};