import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';
import PreviousUpload from './components/Previousupload';
import Offensive from './components/Offensive';

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = JSON.parse(window.localStorage.getItem('currentUser'));
    return storedUser || null;
  });

  const logout = () => {
    window.localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  useEffect(() => {
    window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleLogin = (user) =>{
    setCurrentUser(user);
  }

  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="container">
            <div className="navbar-brand">
              <h4 className="navbar-item">Hate Speech Detection</h4>
            </div>
            <div className="navbar-menu">
              {(currentUser) ? (
                <>
                  <div style={{ color: 'aliceblue', marginRight: '15px' }}>
                    {`Welcome, ${currentUser}`}
                  </div>
                  <div>
                    <Link to="/" className="nav-item nav-link btn btn-dark mx-2">
                      Home
                    </Link>
                  </div>
                  <div>
                    <Link to="/previousupload" className="nav-item nav-link btn btn-dark mx-2">
                      Previous Uploads
                    </Link>
                  </div>
                  <div>
                    <Link to="/logout" className="nav-item nav-link btn btn-dark mx-2" onClick={logout}>
                      Logout
                    </Link>
                  </div>
                 
                </>
              ) : (
                <>
                  <div>
                    <Link to="/login" className="nav-item nav-link btn btn-dark mx-2">
                      Login
                    </Link>
                  </div>
                  <div>
                    <Link to="/register" className="nav-item nav-link btn btn-dark mx-2">
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
            <Route path="/register" element={<Register setCurrentUser={setCurrentUser} />} />
            <Route path="/logout" element={<Navigate to="/login" />} />
            <Route path="/" element={<Home presentUser={currentUser} login={handleLogin}/>} />
            <Route
              path="/previousupload"
              element={currentUser ? <PreviousUpload presentUser={currentUser} /> : <Navigate to="/" />}
            />
            <Route path="/notAllowed" element={<Offensive></Offensive>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
