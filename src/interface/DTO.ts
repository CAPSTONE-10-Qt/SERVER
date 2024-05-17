import { LargeNumberLike } from "crypto";

export interface startInterviewDTO {
    questionNum: number;
    subjectText: string;
    onlyVoice: boolean;
    startDateTime: string;
  }

  export interface makeFeedbackDTO{
    mumble: number;
    silent: number;
    talk: number;
    time: number;
    text: string;
    endDateTime: string;
  }

  export interface saveEmotionDTO{
    emotion: string;
  }

  export interface UserCreateDTO {
    name: string;
    email: string;
    password: string;
  }

  export interface UserSignInDTO {
    email: string;
    password: string;
  }