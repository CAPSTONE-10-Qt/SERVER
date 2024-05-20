import { Router } from 'express';
import { body, header, param } from 'express-validator';
import { userController } from '../controller';
import auth from '../middleware/auth';
import errorValidator from '../middleware/error/errorValidator';
import { env } from 'process';
import axios from 'axios';
import app from '..';

const router: Router = Router();

router.get('/myPage', auth, userController.accessUserInfo);

router.get(
  "/", async (req, res) => {
    const githubAuthUrl = 'https://github.com/login/oauth/authorize?client_id=' + env.OAUTH_CLIENT_ID
    res.redirect(githubAuthUrl);
  }
)

router.get("/github/callback", (req, res) => {
  axios.post("https://github.com/login/oauth/access_token", {
      client_id: env.OAUTH_CLIENT_ID,
      client_secret: env.OAUTH_CLIENT_SECRET,
      code: req.query.code
  }, {
      headers: {
          Accept: "application/json"
      }
  }).then(async (result) => {
      console.log(result.data.access_token)
      res.send("you are authorized " + result.data.access_token)
      const userResponse = await axios({
        method: 'GET',
        url: 'https://api.github.com/user',
        headers: {
          Authorization: `token ${result.data.access_token}`,
        },
      })
    console.log('social login result:', userResponse.data)
    req.body.id = userResponse.data.id;
    req.body.name = userResponse.data.name;
    req.body.avatar_url = userResponse.data.avatar_url
    userController.createUser
  }).catch((err) => {
      console.log(err);
  })
})

export default router;