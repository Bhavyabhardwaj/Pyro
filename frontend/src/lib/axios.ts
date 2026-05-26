import axios, { type AxiosInstance } from "axios";

interface RedirectableAPI extends AxiosInstance {
    _hasRedirected?: boolean;
}

let rawBaseURL = import.meta.env.VITE_API_URL || "https://api.bhavy4.tech/api";
if (rawBaseURL && !rawBaseURL.endsWith("/api") && !rawBaseURL.endsWith("/api/")) {
    rawBaseURL = rawBaseURL.replace(/\/$/, "") + "/api";
}

export const api = axios.create({
    baseURL: rawBaseURL,
}) as RedirectableAPI;

api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem(
                "token"
            );

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            console.warn("API returned 401 — clearing token and redirecting to login");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (!api._hasRedirected) {
                api._hasRedirected = true;
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    },
);