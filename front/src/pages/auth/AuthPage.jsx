import React, { useState } from 'react';
// import './AuthPage.css';

const AuthPage = ({ onLoginSuccess }) => {
    const [method, setMethod] = useState('email'); // 'email' или 'phone'
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        code: ''
    });
    const [error, setError] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false); // Для имитации СМС

    // Обработка ввода
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Сброс ошибки при вводе
    };

    // Имитация отправки СМС
    const handleSendCode = () => {
        if (formData.phone.length < 10) {
            setError('Введите корректный номер телефона');
            return;
        }
        setIsCodeSent(true);
        alert(`Код подтверждения отправлен на ${formData.phone}: 1234`); // Имитация
    };

    // Обработка регистрации
    const handleSubmit = (e) => {
        e.preventDefault();

        // Валидация для Email
        if (method === 'email') {
            if (!formData.email || !formData.password) {
                setError('Заполните все поля');
                return;
            }
            if (!formData.email.includes('@')) {
                setError('Некорректный Email');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Пароли не совпадают');
                return;
            }
        }

        // Валидация для Телефона
        if (method === 'phone') {
            if (!isCodeSent) {
                handleSendCode();
                return;
            }
            if (formData.code !== '1234') { // Хардкод проверка
                setError('Неверный код из СМС');
                return;
            }
        }

        // Если всё ок
        onLoginSuccess();
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Регистрация</h2>

                {/* Вкладки */}
                <div className="auth-tabs">
                    <button
                        className={`tab-btn ${method === 'email' ? 'active' : ''}`}
                        onClick={() => { setMethod('email'); setError(''); }}
                    >
                        Email
                    </button>
                    <button
                        className={`tab-btn ${method === 'phone' ? 'active' : ''}`}
                        onClick={() => { setMethod('phone'); setError(''); }}
                    >
                        Телефон
                    </button>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>

                    {/* Поля для EMAIL */}
                    {method === 'email' && (
                        <>
                            <div className="form-group">
                                <label>Email адрес</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Пароль</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="******"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Повторите пароль</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="******"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                    {/* Поля для ТЕЛЕФОНА */}
                    {method === 'phone' && (
                        <>
                            <div className="form-group">
                                <label>Номер телефона</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    placeholder="+380..."
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isCodeSent}
                                />
                            </div>

                            {isCodeSent && (
                                <div className="form-group">
                                    <label>Код из СМС (1234)</label>
                                    <input
                                        type="text"
                                        name="code"
                                        className="form-input"
                                        placeholder="1234"
                                        value={formData.code}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <button type="submit" className="submit-btn">
                        {method === 'phone' && !isCodeSent ? 'Получить код' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="secondary-action">
                    Уже есть аккаунт? <span className="link" onClick={onLoginSuccess}>Войти</span>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;