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

const getAnswerAndFeedback = async (questionId: number, interviewId: number) => {
    const answer = await prisma.answer.findFirst({
        where: {
            questionId: questionId,
            interviewId: interviewId
        }
    });
    const question = await prisma.question.findFirst({
        where: {
            id: questionId,
        },
        select: {
            questionText: true,
            sampleAnswer: true
        }
    })
    if (answer && question) {
        const feedback = await prisma.feedback.findFirst({
            where: {
                answerId: answer.id,
                interviewId: interviewId
            }
        });
        if (feedback) {
            return {
                questionId: questionId,
                questionText: question.questionText,
                sampleAnswer: question.sampleAnswer,
                score: feedback.score,
                text: answer.text,
                feedbackText: feedback.feedbackText,
                time: answer.time,
            }
        }
    }
    if (!answer || !question) {
        return {};
    }
}

const getQuestionDetails = async (interviewId: number) => {
    const findQuestionList = await prisma.interviewQuestion.findMany({
        where: {
            interviewId: interviewId,
        },
        select: {
            id: true,
            interviewId: true,
            questionId: true,
        }
    })
    const questionDetails = [];
    for (const question of findQuestionList) {
        const details = await getAnswerAndFeedback(question.questionId, question.interviewId);
        questionDetails.push(details);
    }
    return questionDetails;
}

const getInterviewDetail = async(interviewId: number) => {
    try {
        const questionDetails = await getQuestionDetails(interviewId)
        const findInterview = await prisma.interview.findFirst({
            where: {
                id: interviewId,
            },
            select: {
                id: true,
                userId: true,
                subjectId: true,
                startDateTime: true,
                endDateTime: true,
                questionNum: true,
                score: true,
                otherFeedback: true,
                title: true,
                onlyVoice: true,
            }
        })

        if (findInterview){
            const findSubjectText = await prisma.subject.findFirst({
                where: {
                    id: findInterview.subjectId
                },
                select: {
                    subjectText: true,
                }
            })
            const result = ({
                data: {
                    id: findInterview.id,
                    subjectText: findSubjectText?.subjectText,
                    startDateTime: findInterview.startDateTime,
                    endDateTime: findInterview.endDateTime,
                    questionNum: findInterview.questionNum,
                    score: findInterview.score,
                    title: findInterview.title,
                    otherFeedback: findInterview.otherFeedback,
                    onlyVoice: findInterview.onlyVoice,
                    questionList: questionDetails,
                }
            })
            return result
        }

    } catch(error) {
        throw error;
    }
};

export default {
    getInterviewList,
    getInterviewDetail,
};