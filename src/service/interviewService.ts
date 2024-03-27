import { startInterviewDTO, makeFeedbackDTO } from '../interface/DTO';
import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const startInterview = async (startInterviewDTO: startInterviewDTO, refreshToken: string) => {
  try {
    const findUserId = await prisma.user.find({
        where: {
            refreshToken: refreshToken,
        },
        select: {
            id: true,
        },
    });

    const findSubjectId = await prisma.subject.find({
        where: {
            subjectText: startInterviewDTO.subjectText,
        },
        select: {
            id: true,
        },
    });

    const countInterviewToday = await prisma.subject.findMany({
        include: {
            _count: {
                select: {startDateTime: startInterviewDTO.startDateTime}
            }
        }
    });

    const questionList = await prisma.question.findMany({
        where: {
            subjectId: findSubjectId.id
        },
        select: {
            id: true,
            questionText: true,
        },
    });

    const selectedQuestions = [];
    const numQuestions = Math.min(questionList.length, startInterviewDTO.questionNum);
    const shuffledQuestions = questionList.sort(() => Math.random() - 0.5);
    for (let i = 0; i < numQuestions; i++) {
        selectedQuestions.push(shuffledQuestions[i]);
    };

    const interview = await prisma.interview.create({
        data: {
          userId: findUserId.id,
          subjectId: findSubjectId.id,
          questionNum: startInterviewDTO.questionNum,
          subjectText: startInterviewDTO.subjectText,
          title: null,
          onlyVoice: startInterviewDTO.onlyVoice,
          startDateTime: startInterviewDTO.startDateTime,
          questionList: selectedQuestions.map(question => ({
              id: question.id,
              questionText: question.questionText
            })),
        },
    });

    const interviewQuestionPromises = selectedQuestions.map(async (question) => {
        const createdInterviewQuestion = await prisma.interviewQuestion.create({
            data: {
                interviewId: interview.id,
                questionId: question.id,
                userId: findUserId.id,
                subjectId: findSubjectId.id,
            }
        });
        return createdInterviewQuestion
    });

    const createdInterviewQuestion = await Promise.all(interviewQuestionPromises)
    return interview;
  } catch (error) {
    throw error;
  }
};

const makeFeedback = async (makeFeedbackDTO: makeFeedbackDTO, interviewQuestionId: number) => {
    try {
    const findInterviewQuestion = await.prisma.interviewQuestion.find({
        where: {
            id: interviewQuestionId,
        },
        select: {
            interviewId: true,
            questionId: true,
            userId: true,
            subjectId: true,
            pin: true,
            again: true,
        }
    });
    
    const answer = await prisma.answer.create({
        data: {
            interviewQuestionId: interviewQuestionId,
            questionId: findInterviewQuestion.questionId,
            interviewId: findInterviewQuestion.interviewId,
            text: makeFeedbackDTO.text,
            mumble: makeFeedbackDTO.mumble,
            silent: makeFeedbackDTO.silent,
            talk: makeFeedbackDTO.talk,
            time: makeFeedbackDTO.time,
        }
    });

    const feedback = await prisma.feedback.create({
        data: {
            interviewQuestionId: interviewQuestionId,
            answerId: answer.id,
            interviewId: answer.interviewId,
            score: null,
            feedbackText: null,
        }
    })

    return answer;
    } catch(error) {
        throw error;
    }
}

export default {
  startInterview,
  makeFeedback,
};