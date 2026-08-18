import { apiClient } from "./client";
import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse,
} from "../types";

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<UserResponse>("/auth/register", data).then((r) => r.data),

  me: () => apiClient.get<UserResponse>("/auth/me").then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient
      .post<{ success: boolean; message: string }>(
        "/auth/change-password",
        data,
      )
      .then((r) => r.data),
};
