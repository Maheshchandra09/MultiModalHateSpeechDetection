import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

const Register = ({ setCurrentUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
        setErrorMsg('All fields are required. Please fill in all the details.');
      } else if (password === confirmPassword) {
        setSubmitButtonDisabled(true);
        await createUserWithEmailAndPassword(auth, username, password);
        setCurrentUser(username);
        window.localStorage.setItem('isLoggedin', true);
        window.localStorage.setItem('usernameis', username);
        setSubmitButtonDisabled(false);
        setRegistrationSuccess(true);
        navigate('/');
      } else {
        setErrorMsg("Passwords don't match. Please re-enter.");
      }
    } catch (error) {
      console.error('Error registering user:', error.message);
      setErrorMsg(error.message);
      setSubmitButtonDisabled(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <h1 className={styles.heading}>Register</h1>
        <label>
          Email:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <br />
        <label>
          Re-enter Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <div className={styles.footer}>
          <b className={styles.error}>{errorMsg}</b>
          <button onClick={handleRegister} disabled={submitButtonDisabled}>
            Signup
          </button>
          <p>
            Already have an account?{' '}
            <span>
              <Link to="/login">Login</Link>
            </span>
          </p>

          {registrationSuccess && <p style={{ color: 'blue' }}>Registration successful!</p>}
        </div>
      </div>
    </div>
  );
};

export default Register;
