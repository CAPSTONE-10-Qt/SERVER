import axios from 'axios';
import { exceptionMessage } from '../module/constant';
import { SocialUser } from '../interface/SocialUser';

const googleAuth = async (googleAccessToken: string) => {
  try {
    //*사용자 정보 받기

    const user = await axios({
      method: 'get',
      url: `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${googleAccessToken}`,
      headers: {
        authorization: `Bearer ${googleAccessToken}`,
      },
    });
    const userId = user.data.id;
    if (!userId) return exceptionMessage.INVALID_USER;
    const name = user.data.name;
    const email = user.data.email;

    const googleUser: SocialUser = {
      userId: userId,
      name: name,
      email: email,
    };

    return googleUser;
  } catch (error) {
    console.log('googleAuth error', error);
    return null;
  }
};

export default {
  googleAuth,
};