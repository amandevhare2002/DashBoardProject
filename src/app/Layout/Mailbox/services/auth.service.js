import BaseService from "./base.service";

export function useAuthService() {
  return new AuthServices();
}

class AuthServices extends BaseService {
  getToken = async () =>
    await this._callApi(
      "POST",
      "/token",
      undefined,
      new URLSearchParams({
        username: localStorage.getItem("username"),
        password: "test123",
        grant_type: "password",
      })
    );
}
