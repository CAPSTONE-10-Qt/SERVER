import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const getIntervewDetails = async (refreshToken: string) => {
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
        select: {
            id: true,
            subjectId: true,
            startDateTime: true,
            endDateTime: true,
            title: true,
            score: true,
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

        const timeInSeconds = (interview.endDateTime.getTime() - interview.startDateTime.getTime()) / 1000;

        return {
            ...interview,
            subjectText: subject?.subjectText,
            time: timeInSeconds
        };
    }));

    return interviewDetails;
}

const getInterviewList = async (refreshToken: string, sortNum: number) => {
    try {
        let interviewList = await getIntervewDetails(refreshToken);
        if (sortNum === 1) {
            interviewList.sort((a, b) => b.startDateTime.getTime() - a.startDateTime.getTime());
        } else if (sortNum === 2) {
            interviewList.sort((a, b) => (b.score || 0) - (a.score || 0));
        } else if (sortNum === 3) {
            interviewList.sort((a, b) => (a.score || 0) - (b.score || 0));
        } else {
            interviewList
        }
        return { data: { interviewList } };
    } catch(error) {
        throw error;
    }
};

export default {
    getInterviewList,
};