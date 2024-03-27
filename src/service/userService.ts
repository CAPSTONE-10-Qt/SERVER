import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const accessUserInfo = async (refreshToken: string) => {
    try {
        const userInfo = await prisma.user.findfirst({
            where: {
                refreshToken: refreshToken,
            },
            select: {
                id: true,
                userName: true,
                pictureURL: true,
                themeColor: true,
                refreshToken: true,
            }
        });
        return userInfo;
    } catch(error) {
        throw error;
    }
};

export default {
  accessUserInfo,
};