import { apiClient } from "./client";
import type {
  UserCreateRequest,
  UserResponse,
  UserRoleUpdateRequest,
} from "../types";

export const userApi = {
  list: () => apiClient.get<UserResponse[]>("/users").then((r) => r.data),

  get: (id: number) =>
    apiClient.get<UserResponse>(`/users/${id}`).then((r) => r.data),

  create: (data: UserCreateRequest) =>
    apiClient.post<UserResponse>("/users", data).then((r) => r.data),

  update: (id: number, data: UserRoleUpdateRequest) =>
    apiClient.patch<UserResponse>(`/users/${id}`, data).then((r) => r.data),
};
