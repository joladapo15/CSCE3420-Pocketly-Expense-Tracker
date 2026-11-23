import { apiFetch } from "./client";

export async function getProfile() {
  const data = await apiFetch("/api/profile");
  return data.user;
}

export async function updateProfile({ full_name, institution_name, phone_number }) {
  const data = await apiFetch("/api/profile", {
    method: "PUT",
    body: JSON.stringify({ full_name, institution_name, phone_number }),
  });
  return data.user;
}

export function changePassword(current_password, new_password) {
  return apiFetch("/api/profile/password", {
    method: "PUT",
    body: JSON.stringify({ current_password, new_password }),
  });
}