
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CalculatorPage from './pages/calc/CalculatorPage';
import AuhtPage from './pages/auth/AuthPage';
import './App.css';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
// import { useStore } from 'reactflow';
import { useStore } from './store';

const App = () => {

  const store = useStore();

  const { isAuth, user } = store.auth;

  useEffect(() => {
    console.log('isAuth changed:', isAuth);
    if (isAuth) {
      store.auth.fetchUserInfo();
    }
  }, [isAuth, store.auth]);

  return (
    <Router>
      <Routes>
        {
          isAuth ? (
            <>
              <Route path="/" element={<CalculatorPage />} />
              <Route path="*" element={<CalculatorPage />} />
            </>

          ) : (
            <>
              <Route path="auth" element={<AuhtPage />} />
              <Route path="*" element={<AuhtPage />} />
            </>
          )
        }
      </Routes>
    </Router>
  );
}
export default observer(App);