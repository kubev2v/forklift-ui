import React, { useEffect } from 'react';
import { useLocation, Redirect, useHistory } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

interface ILoginHandlerComponentProps {
  test: any;
}

const LoginHandlerComponent: React.FunctionComponent<ILoginHandlerComponentProps> = () => {
  const { saveLoginToken } = useAppContext();
  const history = useHistory();

  const searchParams = new URLSearchParams(useLocation().search);
  const userStr = searchParams.get('user');
  const errorStr = searchParams.get('error');
  let user;
  let loginError;
  try {
    user = userStr && JSON.parse(userStr);
    loginError = errorStr && JSON.parse(errorStr);
  } catch (error) {
    user = null;
    loginError = null;
  }

  useEffect(() => {
    if (loginError) {
      console.log('Authentication error: ', loginError);
    } else if (user) {
      saveLoginToken(user.access_token, history); // Will cause a redirect to "/"
    }
  }, [loginError, user, history, saveLoginToken]);

  return user ? null : <Redirect to="/" />;
};

export default LoginHandlerComponent;
