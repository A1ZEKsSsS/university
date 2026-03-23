import { useEffect, useState } from 'react';

const Users = () => {
    const apiBase = import.meta.env.VITE_API_HOST || '';
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    const getHeaders = () => {
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

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError('Не удалось загрузить пользователей. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Удалить пользователя и все его схемы?')) {
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
            setSuccess('Пользователь и его схемы успешно удалены.');
        } catch (err) {
            setError('Не удалось удалить пользователя. ' + err.message);
        }
    };

    const saveToken = () => {
        localStorage.setItem('token', token);
        setSuccess('Токен сохранён. Обновите список.');
    };

    useEffect(() => {
        if (!token) {
            return;
        }
        fetchUsers();
    }, [token]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Админ: управление пользователями</h1>

            <div style={{ marginBottom: '16px' }}>
                <label>
                    API Token (JWT):
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Введите токен"
                        style={{ width: '80%', marginLeft: '8px' }}
                    />
                </label>
                <button onClick={saveToken} style={{ marginLeft: '8px' }}>
                    Сохранить
                </button>
            </div>

            <button onClick={fetchUsers} disabled={loading || !token} style={{ marginBottom: '16px' }}>
                {loading ? 'Загрузка...' : 'Обновить список'}
            </button>

            {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '12px' }}>{success}</div>}

            {!token && <div style={{ color: '#666' }}>Нужен JWT токен из входа администратора.</div>}

            {users.length === 0 && !loading && token && <div>Пока нет пользователей.</div>}

            {users.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '8px' }}>Email</th>
                            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '8px' }}>Имя</th>
                            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '8px' }}>Роль</th>
                            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '8px' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id || user.id}>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{user.email}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{user.name || '-'}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{user.role}</td>
                                <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                                    <button
                                        onClick={() => deleteUser(user._id || user.id)}
                                        style={{ color: 'white', backgroundColor: '#d9534f', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Users;