import { AppError } from "@/domain/utils/app_error";
import axios, { AxiosError, AxiosInstance } from "axios";
import { getStorageAuthToken, setStorageAuthToken } from "../storage/token";

export type Subscription = () => void;
export type Dependency = () => Promise<void>;
export type APIInstanceProps = {
  registerInterceptorTokenManager: (signOut: Dependency) => Subscription;
} & AxiosInstance;
export type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

const api = axios.create({
  baseURL: "http://192.168.15.8:3333",
  timeout: 6000,
}) as APIInstanceProps;

let failedQueue: Array<PromiseType> = [];
let isRefreshing = false;

api.registerInterceptorTokenManager = (signOut: Dependency) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    async (RequestError) => {
      const errorResponse = RequestError.response;
      if (errorResponse && errorResponse.status === 401) {
        if (
          errorResponse.data.message === "token.expired" ||
          errorResponse.data.message === "token.invalid"
        ) {
          const { refreshToken } = await getStorageAuthToken();
          if (!refreshToken) {
            signOut();
            return Promise.reject(RequestError);
          }
          const originalConfig = RequestError.config;
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                onSuccess: (token: string) => {
                  originalConfig.headers["Authorization"] = `Bearer ${token}`;
                  resolve(api(originalConfig));
                },
                onFailure: (error: AxiosError) => {
                  reject(error);
                },
              });
            });
          }
          isRefreshing = true;
          return new Promise((resolve, reject) => {
            api
              .post("/sessions/refresh-token", {
                refresh_token: refreshToken,
              })
              .then(({ data: { token, refresh_token } }) => {
                setStorageAuthToken({
                  authToken: token,
                  refreshToken: refresh_token,
                });
                return { token, refresh_token };
              })
              .then(({ token }) => {
                if (
                  originalConfig.data &&
                  typeof originalConfig.data === "string"
                ) {
                  originalConfig.data = JSON.parse(originalConfig.data);
                }
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                api.defaults.headers.common[
                  "Authorization"
                ] = `Bearer ${token}`;
                failedQueue.forEach((promise) => {
                  promise.onSuccess(token);
                });
                resolve(api(originalConfig));
              })
              .catch((error) => {
                failedQueue.forEach((promise) => {
                  promise.onFailure(error);
                });
                signOut();
                reject(error);
              })
              .finally(() => {
                isRefreshing = false;
                failedQueue = [];
              });
          });
        }
        signOut();
      }
      if (errorResponse && errorResponse.data) {
        return Promise.reject(new AppError(errorResponse.data.message));
      } else {
        return Promise.reject(RequestError);
      }
    }
  );

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};

api.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

export { api };
