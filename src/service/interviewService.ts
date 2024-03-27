import { startInterviewDTO } from '../interface/DTO';
import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
const prisma = new PrismaClient();

const startInterview = async (startInterviewDTO: startInterviewDTO, refreshToken: string) => {
  try {
    const findUserId = await prisma.User.find({
        where: {
            refreshToken: refreshToken,
        },
        select: {
            id: true,
        },
    });

    const findSubjectId = await prisma.Subject.find({
        where: {
            subjectText: startInterviewDTO.subjectText,
        },
        select: {
            id: true,
        },
    });

    const countInterviewToday = await prisma.Subject.findMany({
        include: {
            _count: {
                select: {startDateTime: startInterviewDTO.startDateTime}
            }
        }
    });

    const questionList = await prisma.Question.findMany({
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

    const interview = await prisma.Interview.create({
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
    return interview;
  } catch (error) {
    throw error;
  }
};

export default {
  startInterview,
};