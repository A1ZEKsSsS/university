import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

class Auth {
    isAuth = false;
    token = null;

    user = {
        id: '',
        name: '',
        email: '',
    };

    constructor() {
        makeAutoObservable(this);
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            this.authorize(savedToken);
        }
    }

    *fetchUserInfo() {
        try {
            const { data } = yield axios.get('/auth/user');
            this.user = {
                ...this.user,
                id: data.id,
                name: data.name,
                email: data.email,
            };
        } catch (e) {
            if (e.response?.status === 401) {
                runInAction(() => {
                    this.unauthorize();
                });
            }
        }
    }

    authorize(token, user) {
        this.isAuth = true;
        this.token = token;
        if (user) {
            this.user = {
                id: user.id || user._id || '',
                name: user.name || '',
                email: user.email || '',
            };
        }
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    unauthorize() {
        this.isAuth = false;
        this.token = null;
        this.user = { id: '', name: '', email: '' };
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
}

const auth = new Auth();
export default auth;
