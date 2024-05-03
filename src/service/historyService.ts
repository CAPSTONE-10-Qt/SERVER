import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const getIntervewDetails = async (refreshToken: string, orderBy: any) => {
    const findUserId = await prisma.user.findFirst({
        where: {
            refreshToken: refreshToken
        },
        select: {
            id: true,
        }
    });

    const findInterview = await prisma.interview.findMany({
        where: {
            userId: findUserId!.id
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

const getInterviewList = async (refreshToken: string, sortNum: number) => {
    try {
        let orderBy;
        if (sortNum === 1) {
            orderBy = { startDateTime: 'desc' };
        } else if (sortNum === 2) {
            orderBy = { score: 'desc' };
        } else if (sortNum === 3) {
            orderBy = { score: 'asc' };
        }

        const interviewList = await getIntervewDetails(refreshToken, orderBy);

        return { 
            interviewList,
            sortNum
        }
    } catch(error) {
        throw error;
    }
};

export default {
    getInterviewList,
};