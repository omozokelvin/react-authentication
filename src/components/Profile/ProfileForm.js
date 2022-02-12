import { useRef, useContext } from 'react';
import { AuthContext } from '../../store/auth-context';
import { useNavigate } from 'react-router-dom';

import classes from './ProfileForm.module.css';

const PASSWORD_CHANGE_URL = `${process.env.REACT_APP_API_URL}accounts:update?key=${process.env.REACT_APP_API_KEY}`;

const ProfileForm = () => {
  const navigate = useNavigate();
  const newPasswordInputRef = useRef();
  const authCtx = useContext(AuthContext);
  const { token } = authCtx;

  const updatePassword = async (token, enteredNewPassword) => {
    try {
      const response = await fetch(PASSWORD_CHANGE_URL, {
        method: 'POST',
        body: JSON.stringify({
          idToken: token,
          password: enteredNewPassword,
          returnSecureToken: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      const errorMessage = data?.error?.message;

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      navigate('/');
    } catch (error) {
      alert(error.message || 'Failed to update password');
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();

    const enteredNewPassword = newPasswordInputRef.current.value;

    updatePassword(token, enteredNewPassword);
  };

  return (
    <form className={classes.form} onSubmit={submitHandler}>
      <div className={classes.control}>
        <label htmlFor="new-password">New Password</label>
        <input
          type="password"
          id="new-password"
          ref={newPasswordInputRef}
          minLength="6"
        />
      </div>
      <div className={classes.action}>
        <button>Change Password</button>
      </div>
    </form>
  );
};

export default ProfileForm;
