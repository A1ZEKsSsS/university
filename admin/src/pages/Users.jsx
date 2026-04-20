import { useEffect, useState } from 'react';
import auth from '../../store/auth';


const Users = () => {
    const apiBase = import.meta.env.VITE_API_HOST || '';
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getHeaders = () => {
        const token = localStorage.getItem('token') || '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    };

    const fetchUsers = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${apiBase}/api/auth/users`, {
                method: 'GET',
                headers: getHeaders(),
            });

            if (response.status === 401) {
                auth.unauthorize();
                return;
            }

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError('Не вдалося завантажити користувачів. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Видалити користувача та всі його схеми?')) {
            return;
        }

        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${apiBase}/api/auth/users/${userId}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            setUsers((prev) => prev.filter((user) => user._id !== userId));
            setSuccess('Користувача видалено.');
        } catch (err) {
            setError('Не вдалося видалити користувача. ' + err.message);
        }
    };

    const handleLogout = () => {
        if (!window.confirm('Вийти з системи?')) return;
        auth.unauthorize();
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="users-page">
            <div className="users-container">
                <header className="users-header">
                    <div>
                        <h1 className="users-title">Користувачі</h1>
                        <p className="users-subtitle">
                            {users.length > 0
                                ? `Всього: ${users.length}`
                                : 'Керування обліковими записами'}
                        </p>
                    </div>
                    <div className="users-header__actions">
                        <button
                            onClick={fetchUsers}
                            disabled={loading}
                            className="users-refresh"
                        >
                            {loading ? 'Оновлення...' : 'Оновити'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="users-logout"
                            title="Вийти з системи"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Вийти</span>
                        </button>
                    </div>
                </header>

                {error && <div className="users-alert users-alert--error">{error}</div>}
                {success && <div className="users-alert users-alert--success">{success}</div>}

                <div className="users-card">
                    {loading && users.length === 0 ? (
                        <div className="users-empty">Завантаження...</div>
                    ) : users.length === 0 ? (
                        <div className="users-empty">Ще немає користувачів.</div>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Ім'я</th>
                                    <th>Роль</th>
                                    <th className="users-table__actions"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id || user.id}>
                                        <td>{user.email}</td>
                                        <td>{user.name || <span className="users-muted">—</span>}</td>
                                        <td>
                                            <span className={`users-role users-role--${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="users-table__actions">
                                            <button
                                                onClick={() => deleteUser(user._id || user.id)}
                                                className="users-delete"
                                            >
                                                Видалити
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users;
