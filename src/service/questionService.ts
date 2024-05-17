import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const addPin = async(interviewQuestionId: number) => {
    const currentQuestion = await prisma.interviewQuestion.findUnique({
        where: {
            id: interviewQuestionId,
        },
        select: {
            pin: true
        }
    });

    if (!currentQuestion) {
        throw new Error("Interview question not found")
    }

    const updatedPinValue = !currentQuestion.pin;
    const updatedQuestion = await prisma.interviewQuestion.update({
        where: {
            id: interviewQuestionId,
        },
        data: {
            pin: updatedPinValue
        }
    })
    return updatedQuestion;
}

export default {
  addPin,
};