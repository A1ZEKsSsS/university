import { makeAutoObservable } from "mobx";
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

    authorize(token) {
        this.isAuth = true;
        this.token = token;
        localStorage.setItem('token', token);
    }

    unauthorize() {
        this.isAuth = false;
        this.token = null;
        localStorage.removeItem('token');
    }
}


const auth = new Auth();
export default auth;