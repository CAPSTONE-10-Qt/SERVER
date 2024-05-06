import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const getQuestionNum = async (interviewId: number, interviewQuestionId: number) => {
    const questions = await prisma.interviewQuestion.findMany({
        where: {
            interviewId: interviewId
        },
        orderBy: {
            id: 'asc'
        },
        select: {
            id: true
        }
    });
    const questionIndex = questions.findIndex(question => question.id === interviewQuestionId);
    return questionIndex !== -1 ? questionIndex + 1 : -1;
}

const startAgain = async(interviewQuestionId: number, refreshToken: string) => {
    const findUserId = await prisma.user.findFirst({
        where: {
            refreshToken: refreshToken,
        },
        select: {
            id: true,
        },
    });

    const findSubjectId = await prisma.interviewQuestion.findFirst({
        where: {
            id: interviewQuestionId
        },
        select: {
            subjectId: true,
            questionId: true,
            interviewId: true
        },
    });

    const findSubject = await prisma.subject.findFirst({
        where: {
            id: findSubjectId!.subjectId
        },
        select: {
            subjectText: true
        }
    })

    const findQuestion = await prisma.question.findFirst({
        where: {
            id: findSubjectId!.questionId
        },
        select: {
            questionText: true
        }
    })

    const findInterview = await prisma.interview.findFirst({
        where: {
            id: findSubjectId!.interviewId
        },
        select: {
            title: true,
        }
    })

    const startQuestion = await prisma.interviewQuestion.create({
        data: {
            interviewId: 0,
            questionId: findSubjectId!.questionId,
            userId: findUserId!.id,
            subjectId: findSubjectId!.subjectId,
            again: true,
            pin: false,
            isAgain: true,
        }
    });

    const updateQuestion = await prisma.interviewQuestion.update({
        where: {
            id: interviewQuestionId
        },
        data: {
            again: true
        }
    });

    const questionNum = await getQuestionNum(findSubjectId!.interviewId, interviewQuestionId);

    const result = ({
        id: startQuestion.id,
        subjectText: findSubject!.subjectText,
        title: findInterview!.title,
        questionText: findQuestion!.questionText,
        questionNum: questionNum
    })

    return result;
}

const getStudyNotes = async (sortNum: number, subjectText: string, onlyWrong: boolean, refreshToken: string) => {
    const findUserId = await prisma.user.findFirst({
        where: {
            refreshToken: refreshToken
        },
        select: {
            id: true
        }
    });

    interface ScoreResult {
        score: number | null;
    }
    
    const findScore = async (interviewQuestionId: number): Promise<number | null> => {
        const score = await prisma.feedback.findFirst({
            where: {
                interviewQuestionId: interviewQuestionId
            },
            select: {
                score: true
            }
        })
        return score? score.score : null;
    };

    let interviewQuestions = await prisma.interviewQuestion.findMany({
        where: {
            userId: findUserId!.id,
            isAgain: false
        },
        select: {
            id: true,
            subjectId: true,
            again: true,
            questionId: true,
            pin: true,
        }
    });

    if (sortNum === 2) {
        interviewQuestions = interviewQuestions.filter(question => question.again === true);
    } else if (sortNum === 3) {
        interviewQuestions = interviewQuestions.filter(question => question.pin === true);
    }

    if (subjectText !== 'ALL') {
        interviewQuestions = interviewQuestions.filter(async question => {
            return (await prisma.subject.findFirst({
                where: {
                    id: question.subjectId,
                    subjectText: subjectText
                }
            })) !== null;
        });
    }

    if (onlyWrong) {
        interviewQuestions = interviewQuestions.filter(async question => {
            const score = await findScore(question.id);
            return ( score !== 1 )
        });
    }

    const findInterview = async( interviewQuestionId: number) => {
        const interviewId = await prisma.interviewQuestion.findFirst({
            where: {
                id: interviewQuestionId
            },
            select: {
                interviewId: true
            }
        })
        const interview = await prisma.interview.findFirst({
            where: {
                id: interviewId!.interviewId
            },
            select: {
                id: true,
                title: true,
                subjectId: true
            }
        })
        return interview;
    }

    const findQuestionText = async( questionId: number ) => {
        const result = await prisma.question.findFirst({
            where: {
                id: questionId,
            },
            select: {
                questionText: true
            }
        })
        return result
    }

    const result = await Promise.all(interviewQuestions.map(async (question) => {
        const subject = await prisma.subject.findFirst({
            where: {
                id: question.subjectId
            },
            select: {
                subjectText: true
            }
        });

        const interview = await findInterview(question.id);
        const questionText = await findQuestionText(question.questionId);
        const score = await findScore(question.id);

        return {
            id: question.id,
            subjectText: subject!.subjectText,
            title: interview!.title,
            again: question.again,
            questionText: questionText,
            score: score,
            pin: question.pin,
        };
    }));

    return result;
}


export default {
  startAgain,
  getStudyNotes
};