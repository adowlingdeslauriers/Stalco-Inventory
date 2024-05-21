import axios from "axios"

let token = null;
let tokenExpires = null;

export const getToken = async (authKey, tpl, userLoginId) => {

  console.log("AUTHKEY", authKey)
  try {
    const response = await axios.post(
      'https://secure-wms.com/AuthServer/api/Token',
      {
        grant_type: 'client_credentials',
        tpl,
        user_login_id: userLoginId,
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          Host: 'secure-wms.com',
          'Accept-Language': 'Content-Length',
          'Accept-Encoding': 'gzip,deflate,sdch',
          Authorization: `Basic ${authKey}`,
        },
      }
    );
    token = response.data;
    tokenExpires = new Date(Date.now() + token.expires_in * 1000);

    setTimeout(() => {
      getToken(authKey, tpl, userLoginId);
    }, 55 * 60 * 1000);

    return token;
  } catch (error) {
    console.error(`Unable to refresh token: ${error.message}`);
    return null;
  }
};

export const checkToken = async (authKey, tpl, userLoginId) => {
  if (!token || tokenExpires <= new Date()) {
    return await getToken(authKey, tpl, userLoginId);
  }
  return token;
};

