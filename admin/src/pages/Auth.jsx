import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import classNames from 'classnames';
import { useStore } from '../../store';


const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const store = useStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            return setError('Please enter both email and password.');
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/auth/admin/login', {
                email,
                password
            });

            const { token, admin } = response.data;

            localStorage.setItem('token', token);

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            store.auth.setAdminAuth(admin);

            navigate('/admin/dashboard', { replace: true });

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center shadow-lg">
                        {/* <ShieldCheckIcon className="h-10 w-10 text-white" /> */}
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Sign in with your administrator credentials
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-xl sm:px-10">

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={classNames(
                                        "appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm",
                                        error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-slate-500 focus:border-slate-500"
                                    )}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={classNames(
                                        "appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm",
                                        error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-slate-500 focus:border-slate-500"
                                    )}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={classNames(
                                    "w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800",
                                    isLoading ? "bg-slate-500 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-900"
                                )}
                            >
                                {isLoading ? 'Authenticating...' : 'Sign in to Dashboard'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;