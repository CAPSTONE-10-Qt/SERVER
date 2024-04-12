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
      prompt: "너는 컴퓨터공학과 교수야. 뒤에 오는 컴공 질문과 학생의 대답을 듣고 평가해. 구체적으로 어느 부분은 맞았지만 어떤 부분은 부족한지 \"첨삭\"을 자세히. 학생 답변을 다시 보여줄 필요는 없고 300자 안쪽으로 꼭 마무리되게 말해줘."+questionText+"이게 질문이고 다음이 학생의 답변이야."+text,
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
      prompt: "너는 컴퓨터공학과 교수야. 질문과 학생의 대답을 1점, 0.5점, 0점 중에 하나를 int 값만 리턴."+questionText+"이게 질문이고 다음이 학생의 답변이야."+text,
      max_tokens: 10
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