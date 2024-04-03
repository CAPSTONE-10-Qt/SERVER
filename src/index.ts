import express, { NextFunction, Request, Response } from 'express';
//import { Configuration, OpenAIApi } from 'openai';
import Configuration, { OpenAI } from 'openai';
import OpenAIApi from 'openai';
import config from './config';
import router from './router';
import * as dotenv from 'dotenv'

dotenv.config()
const axios = require('axios')
const app = express(); // express 객체 받아옴

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router); 

const openai = new OpenAI({
  organization: "org-5IqT7dxuJeAfuyJEJJhg8VXq",
  apiKey: process.env.OPEN_API_KEY
});

export const scoreAnswer = async (apitext: string) => {
  try {
    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: apitext,
      max_tokens: 200
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
  res.render('error');
});

app.listen(config.port, () => {
  console.log(`
        #############################################
            🛡️ Server listening on port: ${config.port} 🛡️
        #############################################
    `);
});