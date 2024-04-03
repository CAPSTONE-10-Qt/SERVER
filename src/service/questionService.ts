import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const addPin = async (interveiwQuestionId: number) => {
    try {
        const findQuestionId = await prisma.interviewQuestion.findFirst({
            where: {
                id: interveiwQuestionId,
            },
            select: {
                questionId: true
            }
        })
        const pin = await prisma.question.update({
            where: {
                id: findQuestionId?.questionId
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
        const findQuestionId = await prisma.interviewQuestion.findFirst({
            where: {
                id: interveiwQuestionId,
            },
            select: {
                questionId: true
            }
        })
        const pin = await prisma.question.update({
            where: {
                id: findQuestionId?.questionId
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