import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const addPin = async(interviewQuestionId: number, pin: number) => {
    if (pin == 0) {
        const updatePin = await prisma.interviewQuestion.update({
            where: {
                id: interviewQuestionId,
            },
            data: {
                pin: false
            }
        })
        return updatePin
    }
    else if (pin == 1) {
        const updatePin = await prisma.interviewQuestion.update({
            where: {
                id: interviewQuestionId,
            },
            data: {
                pin: true
            }
        })
        return updatePin
    }
}

export default {
  addPin,
};