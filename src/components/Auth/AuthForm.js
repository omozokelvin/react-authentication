import { useRef, useState, useContext } from 'react';
import { AuthContext } from '../../store/auth-context';
import { useNavigate } from 'react-router-dom';

import classes from './AuthForm.module.css';

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const SIGNUP_URL = `${API_URL}accounts:signUp?key=${API_KEY}`;
const LOGIN_URL = `${API_URL}accounts:signInWithPassword?key=${API_KEY}`;

const sendAuthRequest = async (url, email, password, returnSecureToken) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ email, password, returnSecureToken }),
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  const message = data?.error?.message;

  if (!response.ok) {
    throw new Error(message);
  }

  return data;
};

const AuthForm = () => {
  const navigate = useNavigate();

  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const authCtx = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const authSuccess = (idToken, expiresIn) => {
    const expirationTime = new Date(new Date().getTime() + +expiresIn * 1000);

    authCtx.login(idToken, expirationTime.toISOString());

    navigate('/');
  };

  const registerUser = async (email, password, returnSecureToken) => {
    setIsLoading(true);
    try {
      const response = await sendAuthRequest(
        SIGNUP_URL,
        email,
        password,
        returnSecureToken
      );

      setIsLoading(false);

      authSuccess(response.idToken, response.expiresIn);
    } catch (error) {
      setIsLoading(false);
      alert(error?.message || 'Failed to create your account');
    }
  };

  const loginUser = async (email, password, returnSecureToken) => {
    setIsLoading(true);
    try {
      const response = await sendAuthRequest(
        LOGIN_URL,
        email,
        password,
        returnSecureToken
      );

      setIsLoading(false);

      authSuccess(response.idToken, response.expiresIn);
    } catch (error) {
      setIsLoading(false);
      alert(error?.message || 'Failed to log you in');
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();

    const { value: email } = emailInputRef.current;
    const { value: password } = passwordInputRef.current;

    //Optional: We can add validation errors

    const returnSecureToken = true;

    if (isLogin) {
      loginUser(email, password, returnSecureToken);
    } else {
      registerUser(email, password, returnSecureToken);
    }
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? 'Login' : 'Create Account'}</button>
          )}

          {isLoading && <p>Sending Request...</p>}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
