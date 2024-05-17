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

const startAgain = async(interviewQuestionId: number, userId: number) => {
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
            userId: userId,
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

const getStudyNotes = async (sortNum: number, subjectText: string, onlyWrong: boolean, userId: number) => {
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
        });
        return score ? score.score : null;
    };

    let interviewQuestions = await prisma.interviewQuestion.findMany({
        where: {
            userId: userId,
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
        const filteredQuestions = await Promise.all(interviewQuestions.map(async question => {
            const subject = await prisma.subject.findFirst({
                where: {
                    id: question.subjectId,
                    subjectText: subjectText
                }
            });
            return subject ? question : null;
        }));
        interviewQuestions = filteredQuestions.filter(question => question !== null) as typeof interviewQuestions;
    }

    if (onlyWrong === true) {
        const filteredQuestions = await Promise.all(interviewQuestions.map(async question => {
            const score = await findScore(question.id);
            return score !== 1 ? question : null;
        }));
        interviewQuestions = filteredQuestions.filter(question => question !== null) as typeof interviewQuestions;
    }

    const findInterview = async(interviewQuestionId: number) => {
        const interviewId = await prisma.interviewQuestion.findFirst({
            where: {
                id: interviewQuestionId
            },
            select: {
                interviewId: true
            }
        });
        if (!interviewId) {
            throw new Error("Interview not found");
        }
        const interview = await prisma.interview.findFirst({
            where: {
                id: interviewId.interviewId
            },
            select: {
                id: true,
                title: true,
                subjectId: true
            }
        });
        return interview;
    };

    const findQuestionText = async(questionId: number) => {
        const result = await prisma.question.findFirst({
            where: {
                id: questionId,
            },
            select: {
                questionText: true
            }
        });
        return result;
    };

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
            subjectText: subject ? subject.subjectText : "Unknown",
            title: interview ? interview.title : "Unknown",
            again: question.again,
            questionText: questionText ? questionText.questionText : "Unknown",
            score: score,
            pin: question.pin,
        };
    }));

    return result;
}


const endAgain = async(interviewQuestionId: number, time: number, endDateTime: string) => {
    const findAnswerId = await prisma.answer.findFirst({
        where: {
            interviewQuestionId: interviewQuestionId
        },
        select: {
            id: true
        }
    })

    const updateQuestion = await prisma.answer.update({
        where: {
            id: findAnswerId?.id
        },
        data: {
            time: time,
            endDateTime: endDateTime
        }
    });
    return updateQuestion
}

const getAnswerAndFeedback = async (interviewQuestionId: number) => {
    try {
    const answer = await prisma.answer.findFirst({
        where: {
            interviewQuestionId: interviewQuestionId
        },
        select: {
            questionId: true,
            text: true,
            time: true,
            endDateTime: true
        }
    });
    if (!answer) {
        throw new Error('Answer not found');
    }
    
    const question = await prisma.question.findFirst({
        where: {
            id: answer.questionId,
        },
        select: {
            questionText: true,
            sampleAnswer: true
        }
    })
    if (!question) {
        throw new Error('Question not found');
    }

    const feedback = await prisma.feedback.findFirst({
        where: {
            interviewQuestionId: interviewQuestionId
        },
        select: {
            score: true,
            feedbackText: true
        }
    });
    if (!feedback) {
        throw new Error('Feedback not found');
    }

    return {
        questionId: answer.questionId,
        questionText: question.questionText,
        score: feedback.score,
        text: answer.text,
        feedbackText: feedback.feedbackText,
        sampleAnswer: question.sampleAnswer,
        time: answer.time,
        endDateTime: answer.endDateTime
    }
} catch (error) {
    console.error('Error in getAnswerAndFeedback:', error);
    throw error;
}
}

const getQuestionDetail = async(interviewQuestionId: number, userId: number) => {
    try {
    const findFirstQuestion = await prisma.interviewQuestion.findFirst({
        where: {
            id: interviewQuestionId,
            userId: userId,
            isAgain: false
        },
        select: {
            id: true,
            interviewId: true,
            questionId: true,
            subjectId: true,
            pin: true,
            again: true
        }
    })

    if (!findFirstQuestion) {
        throw new Error('Question not found');
    }

    const subject = await prisma.subject.findFirst({
        where: { id: findFirstQuestion.subjectId },
        select: { subjectText: true }
    });
    if (!subject) {
        throw new Error('Subject not found');
    }

    const interview = await prisma.interview.findFirst({
        where: { id: findFirstQuestion.interviewId },
        select: { title: true }
    });
    if (!interview) {
        throw new Error('Interview not found');
    }

    const questionNum = await getQuestionNum(findFirstQuestion.interviewId, findFirstQuestion.id)
    const initialAnswerAndFeedback = await getAnswerAndFeedback(findFirstQuestion.id)

    let againList = await prisma.interviewQuestion.findMany({
        where: {
            questionId: findFirstQuestion.questionId,
            isAgain: true
        },
        select: {
            id: true
        }
    })

    interface AgainDetail {
        startDateTime: Date;
        time: number;
        score: number;
        text: string;
        feedbackText: string;
    }

    let againDetails; 

    if (againList.length > 0) {
        againDetails = await Promise.all(
            againList.map(async (againQuestion) => {
                const details = await getAnswerAndFeedback(againQuestion.id);
                return {
                    startDateTime: details.endDateTime,
                    time: details.time,
                    score: details.score,
                    text: details.text,
                    feedbackText: details.feedbackText
                }   
            })
        )
    }   

    const result = ({
        id: findFirstQuestion.id,
        title: interview.title,
        questionNum: questionNum,
        subjectText: subject.subjectText,
        score: initialAnswerAndFeedback.score,
        pin: findFirstQuestion.pin,
        again: findFirstQuestion.again,
        questionText: initialAnswerAndFeedback.questionText,
        text: initialAnswerAndFeedback.text,
        sampleAnswer: initialAnswerAndFeedback.sampleAnswer,
        feedbackText: initialAnswerAndFeedback.feedbackText,
        startDateTime: initialAnswerAndFeedback.endDateTime,
        time: initialAnswerAndFeedback.time,
        againList: againDetails
    })
    return result;
    } catch (error) {
        console.error('Error in getQuestionDetail', error);
        throw error;
    }
}

export default {
  startAgain,
  getStudyNotes,
  endAgain,
  getQuestionDetail,
};