import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const getIntervewDetails = async (userId: number, orderBy: any) => {
    const findInterview = await prisma.interview.findMany({
        where: {
            userId: userId
        },
        orderBy: orderBy,
        select: {
            id: true,
            subjectId: true,
            startDateTime: true,
            endDateTime: true,
            title: true,
            score: true,
            totalTime: true,
            questionNum: true,
        }
    });

    const interviewDetails = await Promise.all(findInterview.map(async (interview) => {
        const subject = await prisma.subject.findUnique({
            where: {
                id: interview.subjectId
            },
            select: {
                subjectText: true
            }
        });

        return {
            ...interview,
            subjectText: subject?.subjectText,
        };
    }));

    return interviewDetails;
}

const getInterviewList = async (userId: number, sortNum: number) => {
    try {
        let orderBy;
        if (sortNum === 1) {
            orderBy = { startDateTime: 'desc' };
        } else if (sortNum === 2) {
            orderBy = { score: 'desc' };
        } else if (sortNum === 3) {
            orderBy = { score: 'asc' };
        }

        const interviewList = await getIntervewDetails(userId, orderBy);

        return { 
            interviewList,
            sortNum
        }
    } catch(error) {
        throw error;
    }
};

const deleteAgain = async (interviewQuestionId: number) => {
    const deleteQuestion = await prisma.interviewQuestion.delete({
        where: {
            id: interviewQuestionId
        }
    })
    const deleteAnswer = await prisma.answer.delete({
        where: {
            id: interviewQuestionId
        }
    })
    const deleteFeedback = await prisma.feedback.delete({
        where: {
            id: interviewQuestionId
        }
    })

}

export default {
    getInterviewList,
    deleteAgain,
};