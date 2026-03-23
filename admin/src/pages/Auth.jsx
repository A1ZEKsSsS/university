import { useState } from 'react'

const Auth = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!email || !password) {
            setError('Введите email и пароль')
            return
        }

        setError('')
        // Здесь можно вызвать авторизацию на сервере
        console.log('Вход админа:', { email, password })
        alert('Успешная имитация входа')
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Вход в админ-панель</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label">
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            placeholder="admin@example.com"
                            autoFocus
                        />
                    </label>

                    <label className="auth-label">
                        Пароль
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="Пароль"
                        />
                    </label>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-button">
                        Войти
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Auth