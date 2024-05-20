import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, sc, statusCode } from '../module/constant';
import { setDefaultHighWaterMark } from 'stream';
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
import { UserCreateDTO, UserSignInDTO } from '../interface/DTO';

const createUser = async (id: number, name: string, avatar_url: string) => {
  const user = await prisma.user.findFirst({
    where: {
      githubID: id
    },
    select: {
      id: true,
      name: true,
      img: true,
      githubID: true
    }
  })
  if (!user) {
    const data = await prisma.user.create({
      data: {
        name: name,
        img: avatar_url,
        githubID: id
      },
    });
    return data;
    }
  else {
    return {
      id: user.id,
      name: user.name,
      img: user.img,
      githubID: user.githubID
    }
  }
};

const accessUserInfo = async (userId: number) => {
    try {
        const userInfo = await prisma.user.findFirst({
            where: {
                id: userId
            },
            select: {
                name: true,
                img: true
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
};