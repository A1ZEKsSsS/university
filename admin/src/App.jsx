import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Users from './pages/Users'
import AdminLogin from './pages/AdminLogin';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

// import AdminLogin from './pages/auth';
import { useStore } from '../store';

function App() {

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
        {isAuth ? (
          <>
            <Route path="/" element={<Users />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/auth" element={<AdminLogin />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default observer(App)
