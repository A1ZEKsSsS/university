import AuthStore from './auth';

export const RootStore = {
    auth: AuthStore,
};

export const useStore = () => RootStore;
