import { LargeNumberLike } from "crypto";

export interface startInterviewDTO {
    subjectText: string;
    questionNum: number;
    onlyVoice: boolean;
    startDateTime: string;
  }

  export interface makeFeedbackDTO{
    mumble: number;
    silent: number;
    talk: number;
    time: number;
    text: string;
  }

  export interface saveEmotionDTO{
    angry: number;
    disgust: number;
    fear: number;
    happy: number;
    sad: number;
    surprise: number;
    neutral: number;
  }