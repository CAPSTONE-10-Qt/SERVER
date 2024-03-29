import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const addPin = async (interveiwQuestionId: number) => {
    try {
        const pin = await prisma.interviewQuestion.update({
            where: {
                id: interveiwQuestionId
            },
            data: {
                pin: true,
            }
        });
        return pin
    } catch(error) {
        throw error;
    }
};

const deletePin = async (interveiwQuestionId: number) => {
    try {
        const pin = await prisma.interviewQuestion.update({
            where: {
                id: interveiwQuestionId
            },
            data: {
                pin: false,
            }
        });
        return pin
    } catch(error) {
        throw error;
    }
};

export default {
  addPin,
  deletePin,
};