import { createSlice } from "@reduxjs/toolkit";

export const SET_AUTH_TOKEN = "SET_AUTH_TOKEN";
export const SET_LOADING = "SET_LOADING";
export const SET_PAGE_BACKGROUND = "SET_PAGE_BACKGROUND";
export const SET_USER_DATA = "SET_USER_DATA";
export const SET_IFRAME_URL = "SET_IFRAME_URL";

export const setAuthToken = (token: any) => ({
    type: SET_AUTH_TOKEN,
    token
});

export const setLoading = (loading: any) => ({
    type: SET_LOADING,
    loading
});

export const setPageBackground = (background: { color?: string, image?: string }) => ({
    type: SET_PAGE_BACKGROUND,
    background
});

export const setUserData = (userData: any) => ({
    type: SET_USER_DATA,
    payload: userData
});

export const setIframeURL = (iframeURL: string) => ({
    type: SET_IFRAME_URL,
    payload: iframeURL,
});

export interface PageBackgroundState {
    color: string;
    image: string;
}

interface AuthState {
    token: string;
    loading: boolean;
    pageBackground: PageBackgroundState;
    userData: any;
    iframeURL: string;
}

const initialState: AuthState = {
    token: "",
    loading: false,
    pageBackground: {
        color: "",
        image: ""
    },
    userData: null,
    iframeURL: "",
};

export default function authReducer(state = initialState, action: any) {
    switch (action.type) {
        case SET_AUTH_TOKEN:
            return {
                ...state,
                token: action.token
            };

        case SET_LOADING:
            return {
                ...state,
                loading: action.loading
            };

        case SET_PAGE_BACKGROUND:
            return {
                ...state,
                pageBackground: {
                    color: action.background.color,
                    image: action.background.image
                }
            };

        case SET_USER_DATA:
            return {
                ...state,
                userData: action.payload
            };

        case SET_IFRAME_URL:
            return {
                ...state,
                iframeURL: action.payload,
            };

        default:
            return state;
    }
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthToken: (state, action) => {
            state.token = action.payload;
        },
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setPageBackground: (state, action) => {
            state.pageBackground = action.payload;
        },
        setIframeURL: (state, action) => {
            state.iframeURL = action.payload;
        },
        clearAuth: (state: any) => {
            state.token = null;
            state.userData = null;
            state.pageBackground = { color: '', image: '' };
            state.iframeURL = '';
        }
    }
});