import express, { NextFunction, Request, Response } from 'express';
import Configuration, { OpenAI } from 'openai';
import OpenAIApi from 'openai';
import config from './config';
import router from './router'
import * as dotenv from 'dotenv'
import errorHandler from './middleware/error/errorHandler';
import cors from 'cors';

dotenv.config()
const axios = require('axios')
const app = express(); // express 객체 받아옴 

const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:3000',
  config.ec2URL,
];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  const origin: string = req.headers.origin!;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, content-type, x-access-token',
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);

const openai = new OpenAI({
  organization: "org-5IqT7dxuJeAfuyJEJJhg8VXq",
  apiKey: process.env.OPEN_API_KEY
});

export const Answer = async (questionText: string, text: string) => {
  try {
    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0,
      user: 'IT company interviewer',
      prompt: "너가 한 면접 질문은 이거고 "+questionText+", 면접자의 답변은 다음과같아."+text+ "면접자에 대한 피드백을 대답의 좋은 점, 틀린 내용과 첨삭, 아쉬웠던 부분 등을 꼭 포함해서 공백포함 400자로 작성해줘.",
      max_tokens: 400
    });
    const result = completion.choices[0].text;
    return result;
  } catch(error) {
    throw error;
  }
};

export const Score = async (questionText: string, text: string) => {
  try {
    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0,
      user: 'IT company interviewer',
      prompt: questionText+"이게 면접 질문이고,"+text+"이게 답변 내용이야. 채점표에는 0점, 0.5점, 1점 만 있어. 몇점 줄거야?",
      max_tokens: 3
    });
    const result = completion.choices[0].text;
    return result;
  } catch(error) {
    throw error;
  }
};

app.post('/api/chat', async (req, res) => {
  try {
  const { message } = req.body
  const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: message,
      max_tokens:20
    });
  res.json({ response: completion.choices[0].text })
} catch (error) {
res.json({error})       
}
})

//Error Handler
interface ErrorType {
  message: string;
  status: number;
}

app.use(function (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'production' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err })
});

app.listen(config.port, () => {
  console.log(`
        #############################################
            🛡️ Server listening on port: ${config.port} 🛡️
        #############################################
    `);
})
.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

export default app;