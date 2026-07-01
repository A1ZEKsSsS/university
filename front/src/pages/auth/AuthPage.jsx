import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        code: ''
    });

    const [authMode, setAuthMode] = useState('login');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const store = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const switchMode = (mode) => {
        setAuthMode(mode);
        setIsCodeSent(false);
        setError('');
        setTimer(0);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '', code: '' }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setIsResending(true);
        setError('');
        try {
            if (authMode === 'register') {
                await axios.post('/api/auth/verify-email', {
                    email: formData.email,
                    password: formData.password
                });
            } else if (authMode === 'recovery') {
                await axios.post('/api/auth/reset-password', {
                    email: formData.email
                });
            }
            setTimer(60);
        } catch (e) {
            console.error(e);
            setError('Не вдалося надіслати код повторно');
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.email) throw new Error('Введіть Email');

            if (authMode === 'login') {
                if (!formData.password) throw new Error('Введіть пароль');
                const response = await axios.post('/api/auth/signin', {
                    email: formData.email,
                    password: formData.password
                });
                store.auth.authorize(response.data.token);
                navigate('/');
            }

            else if (authMode === 'register') {

                if (!isCodeSent) {
                    if (formData.password !== formData.confirmPassword) throw new Error('Паролі не співпадають');

                    await axios.post('/api/auth/verify-email', {
                        email: formData.email,
                        password: formData.password
                    });

                    setIsCodeSent(true);
                    setTimer(60);
                }
                else {
                    if (!formData.code) throw new Error('Введіть код');

                    await axios.post('/api/auth/confirm-verify-email', {
                        email: formData.email,
                        code: formData.code
                    });

                    const response = await axios.post('/api/auth/signup', {
                        email: formData.email,
                        password: formData.password,
                        code: formData.code
                    });

                    store.auth.authorize(response.data.token);
                    navigate('/');
                }
            }

            else if (authMode === 'recovery') {
                if (!isCodeSent) {
                    await axios.post('/api/auth/reset-password', {
                        email: formData.email
                    });
                    setIsCodeSent(true);
                    setTimer(60);
                } else {
                    if (formData.password !== formData.confirmPassword) throw new Error('Паролі не співпадають');

                    const response = await axios.post('/api/auth/reset-password-confirm', {
                        email: formData.email,
                        code: formData.code,
                        password: formData.password
                    });

                    if (response.data.token) {
                        store.auth.authorize(response.data.token);
                        navigate('/');
                    } else {
                        switchMode('login');
                    }
                }
            }

        } catch (e) {
            console.error(e);
            const msg = e.response?.data?.error || e.message || 'Сталася помилка';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const getTitle = () => {
        if (authMode === 'login') return 'Вхід';
        if (authMode === 'register') return isCodeSent ? 'Підтвердження реєстрації' : 'Реєстрація';
        if (authMode === 'recovery') return isCodeSent ? 'Зміна пароля' : 'Відновлення';
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">{getTitle()}</h2>

                    {(authMode !== 'recovery' && !isCodeSent) && (
                        <div className="auth-tabs">
                            <button className={`tab-btn ${authMode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Вхід</button>
                            <button className={`tab-btn ${authMode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>Реєстрація</button>
                        </div>
                    )}
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Email адреса</label>
                        <input type="email" name="email" className="form-input" placeholder="name@example.com" value={formData.email} onChange={handleChange} disabled={isCodeSent} />
                    </div>

                    {(authMode === 'login' || (authMode === 'register' && !isCodeSent)) && (
                        <div className="form-group">
                            <label>Пароль</label>
                            <input type="password" name="password" className="form-input" placeholder="******" value={formData.password} onChange={handleChange} />
                        </div>
                    )}

                    {((authMode === 'register' && !isCodeSent) || (authMode === 'recovery' && isCodeSent)) && (
                        <div className="form-group">
                            <label>{authMode === 'recovery' ? 'Новий пароль' : 'Повторіть пароль'}</label>
                            <input type="password" name="confirmPassword" className="form-input" placeholder="******" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    )}

                    {authMode === 'login' && (
                        <div className="forgot-pass-wrapper">
                            <span className="link-forgot" onClick={() => switchMode('recovery')}>Забули пароль?</span>
                        </div>
                    )}

                    {isCodeSent && (
                        <div className="fade-in">
                            {authMode === 'recovery' && (
                                <div className="form-group">
                                    <label>Новий пароль</label>
                                    <input type="password" name="password" className="form-input" placeholder="New pass" value={formData.password} onChange={handleChange} />
                                </div>
                            )}

                            <div className="info-text">Код відправлено на {formData.email}</div>

                            <div className="form-group">
                                <label>Код з листа</label>
                                <input type="text" name="code" className="form-input code-input" placeholder="1234" value={formData.code} onChange={handleChange} autoFocus />
                            </div>

                            <div className="resend-wrapper">
                                {timer > 0 ? (
                                    <span className="resend-timer">Відправити повторно через {timer}с</span>
                                ) : (
                                    <span className={`resend-link ${isResending ? 'disabled' : ''}`} onClick={handleResend}>
                                        {isResending ? 'Відправка...' : 'Відправити код повторно'}
                                    </span>
                                )}
                            </div>

                            <div className="link-back" onClick={() => setIsCodeSent(false)}>← Змінити Email</div>
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Завантаження...' : (
                            authMode === 'login' ? 'Увійти' :
                                authMode === 'register' ? (isCodeSent ? 'Підтвердити і створити' : 'Далі') :
                                    (isCodeSent ? 'Змінити пароль' : 'Відправити код')
                        )}
                    </button>

                    {(authMode === 'recovery' && !isCodeSent) && (
                        <div className="secondary-action">
                            <span className="link" onClick={() => switchMode('login')}>Повернутися до входу</span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default observer(AuthPage);