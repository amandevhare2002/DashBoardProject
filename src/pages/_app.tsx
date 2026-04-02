import { Provider } from "react-redux";
import "../../src/styles/base.scss";
import { AppProps } from "next/app";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import reducer from "../reducers";
import { useRouter } from "next/router";
import ErrorBoundary from "../app/Layout/ErrorBoundry";
import { useEffect } from "react";
import { Interceptor } from "@/app/Layout/Mailbox/utils/api";
import axios from "axios";
import { BackgroundProvider } from "@/app/Layout/Mailbox/utils/pagebackground";
import { Layout } from "@/app/Layout/Layout";
const store = configureStore({
  devTools: true,
  reducer: combineReducers({
    ...reducer,
  }),
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        router.push('/login');
      }
      return Promise.reject(error);
    }
  );
  return (
    <Provider store={store}>
      <BackgroundProvider>
        {router.pathname === "/login" ? (
          <Component {...pageProps} />
        ) : (
          <ErrorBoundary>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ErrorBoundary>
        )}
      </BackgroundProvider>
    </Provider>
  );
}

export default MyApp;
