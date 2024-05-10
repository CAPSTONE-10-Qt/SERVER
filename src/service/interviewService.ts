import { startInterviewDTO, makeFeedbackDTO, saveEmotionDTO } from '../interface/DTO';
import { PrismaClient } from '@prisma/client';
import errorGenerator from '../middleware/error/errorGenerator';
import { message, statusCode } from '../module/constant';
import { count, error } from 'console';
import { Answer, Score } from '../index'
const prisma = new PrismaClient();

const findInterviewQuestionId = async(interviewId: number, questionId: number) => {
    const find = await prisma.interviewQuestion.findFirst({
            where:{
                interviewId: interviewId,
                questionId: questionId
            },
            select:{
                id: true
            }
        })
    return find!.id
}

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
            id: true
        },
    });

    let countInterviewToday = await prisma.interview.count({
        where: {
            startDateTime: startInterviewDTO.startDateTime
        }
    });

    const questionList = await prisma.question.findMany({
        where: {
            subjectId: findSubjectId!.id
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
    
    const startDate = startInterviewDTO?.startDateTime.substring(0,13);

    const title = (startDate || '') + " 모의 면접 " + countInterviewToday!+1;

    const createInterview = await prisma.interview.create({
        data: {
            userId: findUserId!.id,
            subjectId: findSubjectId!.id,
            startDateTime: startInterviewDTO!.startDateTime,
            questionNum: startInterviewDTO.questionNum,
            title: title,
            onlyVoice: startInterviewDTO.onlyVoice,
        },
    });

    const interviewQuestionPromises = await Promise.all(selectedQuestions.map(async (question) => {
        const createdInterviewQuestion = await prisma.interviewQuestion.create({
            data: {
                interviewId: createInterview.id,
                questionId: question.id,
                userId: findUserId!.id,
                subjectId: findSubjectId!.id,
            }
        });
        return {
            id: createdInterviewQuestion.id,
            questionText: question.questionText
        }
    }));

    const interview = ({
            id: createInterview.id,
            userId: createInterview.userId,
            subjectText: startInterviewDTO.subjectText,
            startDateTime: startInterviewDTO.startDateTime,
            questionNum: startInterviewDTO.questionNum,
            title: createInterview.title,
            onlyVoice: startInterviewDTO.onlyVoice,
            questionList: interviewQuestionPromises
        })
    return interview;
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
        }
    });

    const findQuestion = await prisma.question.findFirst({
        where: {
            id: findInterviewQuestion?.questionId
        },
        select: {
            questionText: true
        }
    })

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
                endDateTime: makeFeedbackDTO.endDateTime
            }
        });

        const feedbackText = await Answer(findQuestion!.questionText!,makeFeedbackDTO.text);
        const score = await Score(findQuestion!.questionText!, makeFeedbackDTO.text)
        let scoreNum = 0
    
        if (score.includes('1')) {
            scoreNum = 1
        } else if (score.includes('0.5')) {
            scoreNum = 0.5
        } else {
            scoreNum = 0
        } 

        const feedback = await prisma.feedback.create({
            data: {
                interviewQuestionId: interviewQuestionId,
                answerId: answer.id,
                interviewId: answer.interviewId,
                score: +scoreNum,
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
    let totalNegativeEmotions = 0;
    let totalEmotions = 0;
    let totalPositiveEmotions = 0;
    let totalNeutralEmotions = 0;
    totalNegativeEmotions = emotionCounts.angry + emotionCounts.disgust + emotionCounts.fear + emotionCounts.sad;
    totalPositiveEmotions = emotionCounts.happy;
    totalNeutralEmotions = emotionCounts.surprise + emotionCounts.neutral;

    const saveEmotionCount = await prisma.interview.update({
        where: {
            id: interviewId,
        },
        data: {
            facePositive: totalPositiveEmotions,
            faceNegative: totalNegativeEmotions,
            faceNeutral: totalNeutralEmotions,
        }
    })
    if (totalNegativeEmotions == null) {
        totalNegativeEmotions = 0;
    }
    totalEmotions = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
    if (totalEmotions == null) {
        totalEmotions = 0;
    }
    const threshold = totalEmotions / 4;

    if (threshold === 0) {
        return "면접에서 표정이 아주 자연스럽고 조절이 잘 되었습니다. 이렇게 유연하게 표현할 수 있는 능력은 면접에서도 큰 장점입니다. 계속 이렇게 잘 유지해 주세요!";
    } else if (totalNegativeEmotions > threshold) {
        return "면접 중 표정을 조금 더 신경 써야 할 필요가 있습니다. 긴장이나 불안감이 표정으로 드러나고 있어, 이 부분을 개선하면 더 좋은 인상을 줄 수 있을 것입니다. 조금 더 표정 관리에 신경을 써주세요.";
    } else {
        return "면접에서 표정 관리를 잘 했습니다. 자신감과 친절함이 표정으로 잘 전달되었습니다. 이런 모습을 유지하면 더 좋은 결과를 얻을 수 있을 것입니다. 수고하셨습니다!";
    }
};

const calculateScore = (mumble:number, silent:number, talk:number) => {
    const mumbleScore = 20 - (mumble / (mumble + talk)) * 20;
    const silentScore = 10 - (silent / (silent + talk)) * 10;
    return mumbleScore + silentScore;
};

const getAnswerAndFeedback = async (questionId: number, interviewId: number) => {
    const answer = await prisma.answer.findFirst({
        where: {
            questionId: questionId,
            interviewId: interviewId
        },
        select: {
            id: true,
            text: true,
            time: true,
            mumble: true,
            silent: true,
            talk: true,
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

    const feedback = await prisma.feedback.findFirst({
        where: {
            answerId: answer!.id,
            interviewId: interviewId
        },
        select: {
            score: true,
            feedbackText: true
        }
    });
    return {
        questionId: questionId,
        questionText: question!.questionText,
        sampleAnswer: question!.sampleAnswer,
        score: feedback!.score,
        text: answer!.text,
        feedbackText: feedback!.feedbackText,
        time: answer!.time,
        mumble: answer!.mumble,
        silent: answer!.silent,
        talk: answer!.talk,
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

const endInterview = async (interviewId: number, endDateTime: string) => {
    try {
        const questionDetails = await getQuestionDetails(interviewId)

        let totalScore = 0;
        let otherScore = 0;
        
        questionDetails.forEach(question => {
            totalScore += question.score!;
            otherScore += calculateScore(question.mumble, question.silent, question.talk);
        });

        otherScore = otherScore/questionDetails.length

        let otherFeedback = "면접에 대한 답변이 매우 탁월합니다. 당신의 자신감과 표현력은 매우 인상적입니다. 당신의 응답은 분명히 면접관들에게도 좋은 인상을 줄 것입니다. 그러나, 항상 완벽하지는 않습니다. 조금 더 세부적으로 응답을 다듬으면 면접 성과를 더욱 향상시킬 수 있을 것으로 보입니다. 계속해서 노력해 주시기 바랍니다.";
        if (otherScore < 25 && 20 <= otherScore) {
            const otherFeedback = "당신의 응답은 매우 수준 높은 편입니다. 그러나, 가끔씩 말이 조금 어색해 보일 때가 있습니다. 이는 큰 문제는 아니지만, 더 자연스러운 표현을 위해 조금 더 노력하시면 좋을 것 같습니다. 스스로 더 많은 자신감을 줄 수 있도록 노력해 주시기 바랍니다.";
        };
        if (otherScore < 20 && 15 <= otherScore) {
            const otherFeedback = "당신의 응답은 좋은 편입니다. 그러나, 답변에서 일부 어색한 부분이 보입니다. 이는 큰 문제는 아니지만, 더 자연스러운 표현을 위해 조금 더 노력하시면 좋을 것 같습니다. 더 많은 연습과 자신에 대한 확신을 가지시면 면접에서 더 좋은 성과를 이끌어 낼 수 있을 것입니다.";
        };
        if (otherScore < 15) {
            const otherFeedback = "당신의 응답은 자주 어색한 부분이 보입니다. 더 많은 연습과 자신에 대한 확신을 가지시면 면접에서 더 좋은 성과를 이끌어 낼 수 있을 것입니다. 좀 더 자연스럽고 확고한 표현을 위해 노력해 주시기 바랍니다.";
        };

        const totalTime = questionDetails.reduce((total, detail) => total + detail.time, 0);

        const endInterview = await prisma.interview.update({
            where: {
                id: interviewId,
            },
            data: {
                score: (totalScore/questionDetails.length)*70 + otherScore,
                otherFeedback: otherFeedback + getEmotionForInterview(interviewId),
                textScore: (totalScore/questionDetails.length) * 70,
                otherScore: otherScore,
                totalTime: totalTime,
            }
        });

        const addEndDateTime = await prisma.interview.update({
            where: {
                id: interviewId,
            },
            data: {
                endDateTime: endDateTime
            }
        })

        const Interview = await prisma.interview.findFirst({
            where: {
                id: interviewId
            },
            select: {
                id: true,
                startDateTime: true,
                endDateTime: true,
                questionNum: true,
            }
        })
        return Interview;
    } catch(error) {
        throw new Error("what");
    }
};

const resultInterview = async (interviewId: number) => {
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
                totalTime: true,
                questionNum: true,
                score: true,
                textScore: true,
                otherScore: true,
                facePositive: true,
                faceNegative: true,
                faceNeutral: true,
                otherFeedback: true,
                title: true,
                onlyVoice: true,
            }
        })

        const totalTime = questionDetails.reduce((total, detail) => total + detail.time, 0);
        const totalMumble = questionDetails.reduce((total, detail) => total + detail.mumble, 0);
        const totalTalk = questionDetails.reduce((total, detail) => total + detail.talk, 0);
        const totalSilent = questionDetails.reduce((total, detail) => total + detail.silent, 0);
        const mumbleRatio = (totalMumble / (totalTalk + totalMumble))*100;
        const silentRatio = (totalSilent / (totalTalk + totalSilent))*100;

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
                    id: findInterview.id,
                    subjectText: findSubjectText?.subjectText,
                    startDateTime: findInterview.startDateTime,
                    endDateTime: findInterview.endDateTime,
                    totalTime: findInterview.totalTime,
                    questionNum: findInterview.questionNum,
                    score: findInterview.score,
                    textScore: findInterview.textScore,
                    otherScore: findInterview.otherScore,
                    mumblePercent: mumbleRatio,
                    silentPercent: silentRatio,
                    facePositive: findInterview.facePositive,
                    faceNegative: findInterview.faceNegative,
                    faceNeutral: findInterview.faceNeutral,
                    title: findInterview.title,
                    otherFeedback: findInterview.otherFeedback,
                    onlyVoice: findInterview.onlyVoice,
                    questionList: questionDetails,
            })
            return firstResult
        }

    } catch(error) {
        throw error;
    }
};

const deleteInterview = async (interviewId: number) => {
    try {
        const deleteInterview = await prisma.interview.delete({
            where: {
                id: interviewId,
            }
        });
        const deleteAnswer = await prisma.answer.deleteMany({
            where: {
                interviewId: interviewId,
            }
        });
        const deleteFeedback = await prisma.feedback.deleteMany({
            where: {
                interviewId: interviewId,
            }
        });
        const deleteInterviewQuestion = await prisma.interviewQuestion.deleteMany({
            where: {
                interviewId: interviewId,
            }
        });
    } catch(error) {
        throw error;
    }
}

export default {
    startInterview,
    makeFeedback,
    saveEmotion,
    endInterview,
    resultInterview,
    getAnswerAndFeedback,
    getQuestionDetails,
    deleteInterview,
  };