import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const getStudyNote = async (refreshToken: string, subjectText: string, onlyWrong: boolean, sortNum: number) => {
    try {
        const getUser= await prisma.user.findFirst({
            where: {
                refreshToken: refreshToken
            },
            select: {
                id: true
            }
        });

        const interviews = await prisma.interview.findMany({
            where: {
                userId: getUser!.id,
            },
            select: {
                id: true
            }
        })

        const questionList = [];
        for (const interview of interviews) {
            const interviewQuestions = await prisma.interviewQuestion.findMany({
                where: {
                    interviewId: interview.id
                },
                select: {
                    questionId: true,
                    interviewId: true,
                }
            });
            for (const interviewQuestion of interviewQuestions) {
                const question = await prisma.question.findFirst({
                    where: {
                        id: interviewQuestion.questionId
                    },
                    select: {
                        id: true,
                        subjectId: true,
                        questionText: true,
                        pin: true,
                        again: true
                        }
                    })
                const getAnswer = await prisma.answer.findFirst({
                    where: {
                        questionId: interviewQuestion.questionId
                    },
                    select: {
                        id: true
                    }
                })
                const getFeedback = await prisma.feedback.findFirst({
                    where: {
                        answerId: getAnswer!.id
                    },
                    select: {
                        score: true,
                    }
                })
                const getTitle = await prisma.interview.findFirst({
                    where:{
                        id: interviewQuestion.interviewId
                    },
                    select: {
                        title: true,
                    }
                })
                const getSubjectText = await prisma.subject.findFirst({
                    where: {
                        id: question?.subjectId
                    },
                    select: {
                        subjectText: true
                    }
                })
                if ((subjectText === 'ALL' || subjectText === getSubjectText!.subjectText) &&
                    (!onlyWrong || (getFeedback?.score !== 1 && getFeedback!.score !== 0.5))) {
                    const result = ({
                        data: {
                            id: question!.id,
                            subjectText: getSubjectText!.subjectText,
                            title: getTitle?.title,
                            again: question!.again,
                            questionText: question!.questionText,
                            score: getFeedback?.score,
                            pin: question!.pin
                        }
                    });
                    questionList.push(result)
                    }
                }    
            }
            if (sortNum === 2) {
                questionList.filter(question => question.data.again === true);
            } else if (sortNum === 3) {
                questionList.filter(question => question.data.pin === true);
            }
        return {
            data: {
                questionList
            }
        }
    } catch(error) {
        throw error;
    }
};

export default {
  getStudyNote,
};