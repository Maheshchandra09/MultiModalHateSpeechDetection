import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import styles from './Login.module.css';

const Login = ({ setCurrentUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setSubmitButtonDisabled(false);
  }, []);

  const handleLogin = async () => {
    try {
      if (!username.trim() || !password.trim()) {
        setErrorMsg('Both username and password are required. Please fill in all the details.');
      } else {
        setSubmitButtonDisabled(true);
        await signInWithEmailAndPassword(auth, username, password);
        setCurrentUser(username);
        window.localStorage.setItem('isLoggedin', true);
        window.localStorage.setItem('usernameis', username);
        setSubmitButtonDisabled(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      setErrorMsg('Invalid Credentials');
      setSubmitButtonDisabled(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <h1 className={styles.heading}>Login</h1>
        <div>
          <label>
            Email:
            <input type="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <br />
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <br />
          <div className={styles.footer}>
            <button disabled={submitButtonDisabled} onClick={handleLogin}>
              Login
            </button>
            <br></br>
            <b className={styles.error}>{errorMsg}</b>
            <p>
              Don't have an account?{' '}
              <span>
                <Link to="/register">Register</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
