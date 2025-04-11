import { clearAuthStorage } from "./clearAuthStorage";

export function logout() {
    console.log("Logging out...");
    clearAuthStorage();
    window.location.href = "/home";
}
