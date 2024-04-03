import { startInterviewDTO, makeFeedbackDTO, saveEmotionDTO } from '../interface/DTO';
import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
import { count } from 'console';
import { scoreAnswer } from '../index'
const prisma = new PrismaClient();

const startInterview = async (startInterviewDTO: startInterviewDTO, refreshToken: string) => {
  try {
    const findUserId = await prisma.user.findFirst({
        where: {
            refreshToken: refreshToken,
        },
        select: {
            id: true,
        },
    });

    const findSubjectId = await prisma.subject.findFirst({
        where: {
            subjectText: startInterviewDTO.subjectText,
        },
        select: {
            id: true,
        },
    });

    const countInterviewToday = await prisma.interview.count({
        where: {
            startDateTime: startInterviewDTO.startDateTime
        }
    });

    if (findSubjectId && findUserId) {
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

        const title = startInterviewDTO.startDateTime + "모의면접" + countInterviewToday

        const createInterview = await prisma.interview.create({
            data: {
              userId: findUserId.id,
              subjectId: findSubjectId.id,
              questionNum: startInterviewDTO.questionNum,
              title: title,
              endDateTime: "",
              onlyVoice: startInterviewDTO.onlyVoice,
              startDateTime: startInterviewDTO.startDateTime,
            },
        });

        const interviewQuestionPromises = selectedQuestions.map(async (question) => {
            const createdInterviewQuestion = await prisma.interviewQuestion.create({
                data: {
                    interviewId: createInterview.id,
                    questionId: question.id,
                    userId: findUserId.id,
                    subjectId: findSubjectId.id,
                }
            });
        });

        const interview = ({
            data: {
                id: createInterview.id,
                userId: createInterview.userId,
                subjectText: startInterviewDTO.subjectText,
                startDateTime: startInterviewDTO.startDateTime,
                questionNum: startInterviewDTO.questionNum,
                title: createInterview.title,
                onlyVoice: startInterviewDTO.onlyVoice,
                questionList: selectedQuestions.map(question => ({
                    id: question.id,
                    questionText: question.questionText
                  }))
            }
        })

        return interview;
    } else {
        throw new Error("Subject not found.");
    }
  } catch (error) {
    throw error;
  }
};

const makeFeedback = async (makeFeedbackDTO: makeFeedbackDTO, interviewQuestionId: number) => {
    try {
    const findInterviewQuestion = await prisma.interviewQuestion.findFirst({
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

    if (findInterviewQuestion) {
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

        const feedbackText = await scoreAnswer(makeFeedbackDTO.text);

        const feedback = await prisma.feedback.create({
            data: {
                interviewQuestionId: interviewQuestionId,
                answerId: answer.id,
                interviewId: answer.interviewId,
                score: null,
                feedbackText: feedbackText,
            }
        })
    
        return answer;
    }
    } catch(error) {
        throw error;
    }
};

const saveEmotion = async (saveEmotionDTO: saveEmotionDTO, interviewQuestionId: number) => {
    try {
        const saveEmotion = await prisma.picture.create({
            data: {
                interviewQuestionId: interviewQuestionId,
                emotion: saveEmotionDTO.emotion
            }
        });
        return saveEmotion;
    } catch(error) {
        throw error;
    }
};

const endInterview = async (endDateTime: string, interviewQuestionId: number) => {
    try {
        const findInterviewQuestion = await prisma.interviewQuestion.findFirst({
            where: {
                id: interviewQuestionId,
            },
            select: {
                interviewId: true,
            }
        });

        if (findInterviewQuestion) { 
            const endInterview = await prisma.interview.update({
                where: {
                    id: findInterviewQuestion.interviewId
                },
                data: {
                    endDateTime: endDateTime,
                }
            });

            const Interview = await prisma.interview.findFirst({
                where: {
                    id: findInterviewQuestion.interviewId
                },
                select: {
                    id: true,
                    startDateTime: true,
                    endDateTime: true,
                    questionNum: true,
                }
            })
            return Interview;
        } else {
            throw new Error("Interview question not found.");
        }
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
                mumble: answer.mumble,
                silent: answer.silent,
                talk: answer.talk,
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

const getEmotionForInterview = async (interviewId: number) => {
    // interviewId에 해당하는 interviewQuestion들을 찾음
    const interviewQuestions = await prisma.interviewQuestion.findMany({
        where: {
            interviewId: interviewId,
        },
        select: {
            id: true,
        }
    });

    type EmotionCounts = {
        [key: string]: number;
    };
    
    const emotionCounts: EmotionCounts = {
        angry: 0,
        disgust: 0,
        fear: 0,
        happy: 0,
        sad: 0,
        surprise: 0,
        neutral: 0
    };

    for (const question of interviewQuestions) {
        const getEmotionList = await prisma.picture.findMany({
            where: {
                interviewQuestionId: question.id,
            },
            select: {
                emotion: true,
            }
        });

        getEmotionList.forEach(({ emotion }) => {
            emotionCounts[emotion]++;
        });
    }
    const totalNegativeEmotions = emotionCounts.angry + emotionCounts.disgust + emotionCounts.fear + emotionCounts.sad;
    const totalEmotions = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
    const threshold = totalEmotions / 2;

    if (totalNegativeEmotions > threshold) {
        return "표정관리해";
    } else {
        return null;
    }
};

const calculateScore = (mumble:number, silent:number, talk:number) => {
    const mumbleScore = 20 - (mumble / (mumble + talk)) * 20;
    const silentScore = 10 - (silent / (silent + talk)) * 10;
    return mumbleScore + silentScore;
};

const firstResultInterview = async (interviewId: number) => {
    try {
        const questionDetails = await getQuestionDetails(interviewId)
        const textScore = questionDetails.reduce((total, question) => {
            if (question!.score === 1) {
                return total + 1;
            } else if (question!.score === 0.5) {
                return total + 0.5;
            } else {
                return total;
            }
        }, 0);

        let otherScore = 0;
        for (const question of questionDetails) {
            const mumble = question!.mumble;
            const silent = question!.silent;
            const talk = question!.talk;
            const score = calculateScore(mumble!, silent!, talk!);
            otherScore += score;
        }

        let otherFeedback = "말 잘하네";
        if (otherScore < 25 && 20 <= otherScore) {
            const otherFeedback = "웅얼거리는거 좀만 고쳐";
        };
        if (otherScore < 20 && 15 <= otherScore) {
            const otherFeedback = "말 제대로하자";
        };
        if (otherScore < 15) {
            const otherFeedback = "심각한데?";
        };

        const makeScore = await prisma.interview.update({
            where: {
                id: interviewId,
            },
            data: {
                score: textScore/getQuestionDetails.length *70 + otherScore,
                otherFeedback: otherFeedback + getEmotionForInterview(interviewId),
            }
        });

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
            const firstResult = ({
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
            return firstResult
        }

    } catch(error) {
        throw error;
    }
};

export default {
  startInterview,
  makeFeedback,
  saveEmotion,
  endInterview,
  firstResultInterview,
};