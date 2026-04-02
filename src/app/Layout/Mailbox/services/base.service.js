import { localStorageKeys } from "../utils/constant";

const isError = (error) => {
  return error instanceof Error;
};

export default class BaseService {
  #token;

  constructor(token) {

    this.#token = token;
  }

  async _callApi(method, route, urlParams, requestData, skipReadingResponseBody) {
    try {
      let headers = {};
      if (this.#token) {
        headers = {
          Authorization: `Bearer ${this.#token}`,
        };
      }

      let body;
      const url = `https://logpanel.insurancepolicy4u.com${route}${urlParams ? "?" + urlParams.toString() : ""}`;

      if (requestData) {
        if (method === "GET") {
          return this.#response({
            success: false,
            error: "Invalid request, GET requests cannot have a body",
          });
        }
        if (requestData instanceof URLSearchParams) {
          body = requestData.toString();
        } else {
          headers["Content-Type"] = "application/json";
          body = JSON.stringify(requestData);
        }
      }

      const res = await fetch(url, {
        method,
        headers,
        body,
      });
      if (res.ok) {
        try {
          if (skipReadingResponseBody) {
            return this.#response({
              success: true,
              responses: "",
            });
          }

          // if api returns no content
          if (res.status === 204) {
            return this.#response({
              success: true,
              responses: "",
            });
          }

          const resData = await res.json();
          return this.#response({
            success: true,
            responses: resData,
          });
        } catch (err) {
          return this.#response({
            success: false,
            error: "failed to parse response returned by server",
          });
        }
      } else {
        if (res.status === 401) {
          localStorage.removeItem(localStorageKeys.TOKEN);
        }

        const resError = await res.text();
        return this.#response({
          success: false,
          error: resError ? resError : `${res.status} - ${res.statusText || "failed to call api"}`,
        });
      }
    } catch (err) {
      let errorMessage = "failed to call api";
      if (isError(err)) {
        errorMessage = `${errorMessage} - ${err.message}`;
      }
      return this.#response({
        success: false,
        error: errorMessage,
      });
    }
  }

  #response(response) {
    if (response.success) {
      return Promise.resolve(response.responses);
    } else {
      return Promise.reject({
        error: response.error,
        isApiError: true,
      });
    }
  }
}
