import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import auth from '../../store/auth';


const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const emailRef = useRef(null);

    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            return setError('Будь ласка, введіть email та пароль.');
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/api/admin/login', { email, password });
            const { token, admin } = response.data;

            auth.authorize(token, admin);
        } catch (err) {
            setError(err.response?.data?.error || "Не вдалося з'єднатися з сервером.");
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Вхід</h1>

                {error && <div className="login-error">{error}</div>}

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            ref={emailRef}
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
